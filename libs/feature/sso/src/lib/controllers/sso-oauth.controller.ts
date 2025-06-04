import { WebhookService } from '@nestjs-mod/webhook';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { PrismaToolsService } from '@nestjs-mod/prisma-tools';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { omit } from 'lodash/fp';
import { IpAddress } from '../decorators/ip-address.decorator';
import { UserAgent } from '../decorators/user-agent.decorator';
import { PrismaClient } from '../generated/prisma-client';
import { SsoCookieService } from '../services/sso-cookie.service';
import { SsoEventsService } from '../services/sso-events.service';
import { SSO_FEATURE } from '../sso.constants';
import { AllowEmptySsoUser, CurrentSsoRequest } from '../sso.decorators';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { OAuthProvider } from '../types/sso-oauth-provider.dto';
import { SsoOAuthVerificationArgs } from '../types/sso-oauth-verification.dto';
import { SsoRequest } from '../types/sso-request';
import { SsoWebhookEvent } from '../types/sso-webhooks';
import { TokensResponse } from '../types/tokens.dto';

@ApiTags('Sso')
@AllowEmptySsoUser()
@Controller('/sso/oauth')
export class SsoOAuthController {
  private readonly logger = new Logger(SsoOAuthController.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoCookieService: SsoCookieService,
    private readonly ssoEventsService: SsoEventsService,
    private readonly webhookService: WebhookService,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments
  ) {}

  @ApiOkResponse({ type: OAuthProvider, isArray: true })
  @Get('providers')
  async oauthProviders(
    @CurrentSsoRequest() ssoRequest: SsoRequest
  ): Promise<OAuthProvider[]> {
    const domain = this.ssoStaticEnvironments.serverUrl;
    const providers = await this.prismaClient.ssoOAuthProvider.findMany({});
    return providers.map((provider) => ({
      ...provider,
      url: `${domain}/api/sso/oauth/${
        provider.name
      }?redirect_uri=${encodeURIComponent(
        `${domain}/api/sso/oauth/${provider.name}/redirect?client_id=${ssoRequest.ssoClientId}`
      )}`,
    }));
  }

  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('verification')
  async oauthVerification(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() ssoOAuthVerificationArgs: SsoOAuthVerificationArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string
  ) {
    try {
      let oAuthToken = await this.prismaClient.ssoOAuthToken.findFirstOrThrow({
        include: { SsoUser: true },
        where: { verificationCode: ssoOAuthVerificationArgs.verificationCode },
      });

      const user = await this.prismaClient.ssoUser.update({
        data: {
          SsoProject: {
            connect: { id: ssoRequest.ssoProject.id },
          },
        },
        where: { id: oAuthToken.userId },
      });

      oAuthToken = await this.prismaClient.ssoOAuthToken.update({
        include: { SsoUser: true },
        data: {
          verificationCode: null,
          projectId: user.projectId,
        },
        where: { id: oAuthToken?.id },
      });

      await this.webhookService.sendEvent({
        eventName: SsoWebhookEvent['sso.sign-in'],
        eventBody: omit(['password'], oAuthToken.SsoUser),
        eventHeaders: { projectId: user.projectId },
      });

      if (oAuthToken.SsoUser.emailVerifiedAt === null) {
        this.logger.debug({
          signIn: {
            SsoOAuthVerification: ssoOAuthVerificationArgs,
            projectId: user.projectId,
          },
        });
        throw new SsoError(SsoErrorEnum.EmailNotVerified);
      } else {
        await this.ssoEventsService.send({
          OAuthVerification: {
            oAuthVerificationArgs: ssoOAuthVerificationArgs,
          },
          userId: oAuthToken.userId,
          userIp,
          userAgent,
        });
      }

      const cookieWithJwtToken =
        await this.ssoCookieService.getCookieWithJwtToken({
          userId: oAuthToken.userId,
          userIp,
          userAgent,
          fingerprint: ssoOAuthVerificationArgs.fingerprint,
          roles: oAuthToken.SsoUser.roles,
          projectId: user.projectId,
        });

      response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

      const result: TokensResponse = {
        user: oAuthToken.SsoUser,
        accessToken: cookieWithJwtToken.accessToken,
        refreshToken: cookieWithJwtToken.refreshToken,
      };
      response.send(result);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        this.logger.error(err, err.stack);
        throw new SsoError(SsoErrorEnum.VerificationCodeNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }
}
