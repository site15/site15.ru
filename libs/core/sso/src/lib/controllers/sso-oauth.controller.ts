import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { WebhookService } from '@nestjs-mod-sso/webhook';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
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
import { PrismaClient } from '@prisma/sso-client';
import { Response } from 'express';
import { omit } from 'lodash/fp';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IpAddress } from '../decorators/ip-address.decorator';
import { UserAgent } from '../decorators/user-agent.decorator';
import { SsoCookieService } from '../services/sso-cookie.service';
import { SsoEventsService } from '../services/sso-events.service';
import { SSO_FEATURE } from '../sso.constants';
import { AllowEmptySsoUser, CurrentSsoRequest } from '../sso.decorators';
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
    private readonly prismaToolsService: PrismaToolsService
  ) {}

  @ApiOkResponse({ type: OAuthProvider, isArray: true })
  @Get('providers')
  oauthProviders(): Observable<OAuthProvider[]> {
    const domain = 'https://sso.nestjs-mod.com';
    return from(this.prismaClient.ssoOAuthProvider.findMany({})).pipe(
      map((providers) =>
        providers.map((provider) => ({
          ...provider,
          url: `${domain}/api/sso/oauth/${
            provider.name
          }?redirect_uri=${encodeURI(
            `${domain}/api/sso/oauth/${provider.name}/redirect`
          )}`,
        }))
      )
    );
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

      oAuthToken = await this.prismaClient.ssoOAuthToken.update({
        include: { SsoUser: true },
        data: { verificationCode: null },
        where: { id: oAuthToken?.id },
      });

      await this.webhookService.sendEvent({
        eventName: SsoWebhookEvent['sso.sign-in'],
        eventBody: omit(['password'], oAuthToken.SsoUser),
        eventHeaders: { projectId: ssoRequest.ssoProject.id },
      });

      if (oAuthToken.SsoUser.emailVerifiedAt === null) {
        this.logger.debug({
          signIn: {
            SsoOAuthVerification: ssoOAuthVerificationArgs,
            projectId: ssoRequest.ssoProject.id,
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
          projectId: ssoRequest.ssoProject.id,
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
        throw new SsoError(SsoErrorEnum.VerificationCodeNotFound);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
  }
}
