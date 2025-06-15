import { StatusResponse } from '@nestjs-mod/swagger';
import { ValidationError, ValidationErrorEnum } from '@nestjs-mod/validation';
import { WebhookService } from '@nestjs-mod/webhook';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, refs } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { omit } from 'lodash/fp';
import { InjectTranslateFunction, TranslateFunction, TranslatesStorage } from 'nestjs-translates';
import assert from 'node:assert';
import { Cookies } from '../decorators/cookie.decorator';
import { IpAddress } from '../decorators/ip-address.decorator';
import { UserAgent } from '../decorators/user-agent.decorator';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';
import { SsoCacheService } from '../services/sso-cache.service';
import { SsoCookieService } from '../services/sso-cookie.service';
import { SsoEventsService } from '../services/sso-events.service';
import { SsoService } from '../services/sso.service';
import { OperationName } from '../sso.configuration';
import { AllowEmptySsoUser, CurrentSsoRequest, SkipValidateRefreshSession } from '../sso.decorators';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { CompleteForgotPasswordArgs, ForgotPasswordArgs } from '../types/forgot-password.dto';
import { RefreshTokensResponse } from '../types/refresh-tokens.dto';
import { SignInArgs } from '../types/sign-in.dto';
import { SignOutArgs } from '../types/sign-out.dto';
import { CompleteSignUpArgs, SignUpArgs } from '../types/sign-up.dto';
import { SsoRequest } from '../types/sso-request';
import { SsoWebhookEvent } from '../types/sso-webhooks';
import { TokensResponse } from '../types/tokens.dto';
import { UpdateProfileArgs } from '../types/update-profile.dto';

@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@Controller('/sso')
export class SsoController {
  private logger = new Logger(SsoController.name);

  constructor(
    private readonly ssoCookieService: SsoCookieService,
    private readonly ssoService: SsoService,
    private readonly ssoEventsService: SsoEventsService,
    private readonly webhookService: WebhookService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly translatesStorage: TranslatesStorage,
  ) {}

  @AllowEmptySsoUser()
  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signInArgs: SignInArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const user = await this.ssoService.signIn({
      signInArgs,
      projectId: ssoRequest.ssoProject.id,
    });

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.sign-in'],
      eventBody: omit(['password'], user),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    if (user.emailVerifiedAt === null) {
      this.logger.debug({
        signIn: {
          signInArgs,
          projectId: ssoRequest.ssoProject.id,
        },
      });
      throw new SsoError(SsoErrorEnum.EmailNotVerified);
    } else {
      await this.ssoEventsService.send({
        SignIn: { signInArgs },
        userId: user.id,
        userIp,
        userAgent,
      });
    }

    const cookieWithJwtToken = await this.ssoCookieService.getCookieWithJwtToken({
      userId: user.id,
      userIp,
      userAgent,
      fingerprint: signInArgs.fingerprint,
      roles: user.roles,
      projectId: ssoRequest.ssoProject.id,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    const result: TokensResponse = {
      user,
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    };
    response.send(result);
  }

  @UseGuards(ThrottlerGuard)
  @AllowEmptySsoUser()
  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signUpArgs: SignUpArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const user = await this.ssoService.signUp({
      signUpArgs,
      projectId: ssoRequest.ssoProject.id,
      operationName: OperationName.VERIFY_EMAIL,
    });

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.sign-up'],
      eventBody: omit(['password'], user),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    if (user.emailVerifiedAt === null) {
      this.logger.debug({
        signUp: {
          signUpArgs,
          projectId: ssoRequest.ssoProject.id,
        },
      });
      throw new SsoError(SsoErrorEnum.EmailNotVerified);
    } else {
      await this.ssoEventsService.send({
        SignUp: { signUpArgs: signUpArgs },
        userId: user.id,
        userIp,
        userAgent,
      });
    }

    const cookieWithJwtToken = await this.ssoCookieService.getCookieWithJwtToken({
      userId: user.id,
      userIp,
      userAgent,
      fingerprint: signUpArgs.fingerprint,
      roles: user.roles,
      projectId: ssoRequest.ssoProject.id,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    const result: TokensResponse = {
      user,
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    };
    response.send(result);
  }

  @AllowEmptySsoUser()
  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('complete-sign-up')
  async completeSignUp(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() completeSignUpArgs: CompleteSignUpArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const user = await this.ssoService.completeSignUp({
      code: completeSignUpArgs.code,
      projectId: ssoRequest.ssoProject.id,
    });

    if (!user) {
      throw new SsoError(SsoErrorEnum.UserNotFound);
    }

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.complete-sign-up'],
      eventBody: omit(['password'], user),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    await this.ssoEventsService.send({
      CompleteSignUp: { completeSignUpArgs },
      userId: user.id,
      userIp,
      userAgent,
    });

    const cookieWithJwtToken = await this.ssoCookieService.getCookieWithJwtToken({
      userId: user.id,
      userIp,
      userAgent,
      fingerprint: completeSignUpArgs.fingerprint,
      roles: user.roles,
      projectId: ssoRequest.ssoProject.id,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    const result: TokensResponse = {
      user,
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    };
    response.send(result);
  }

  @SkipValidateRefreshSession()
  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-out')
  async signOut(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signOutArgs: SignOutArgs,
    @Res({ passthrough: true }) response: Response,
    @Cookies('refreshToken') cookieRefreshToken: string | null,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const refreshToken = cookieRefreshToken || signOutArgs?.refreshToken;
    if (!refreshToken) {
      throw new SsoError(SsoErrorEnum.RefreshTokenNotProvided);
    }

    const cookieWithJwtToken = await this.ssoCookieService.getCookieForSignOut({
      refreshToken,
      projectId: ssoRequest.ssoProject.id,
    });

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.sign-out'],
      eventBody: omit(['password'], ssoRequest.ssoUser || {}),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    await this.ssoEventsService.send({
      SignOut: { signOutArgs: { refreshToken } },
      userId: cookieWithJwtToken.refreshSession?.userId,
      userIp,
      userAgent,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    response.send({ message: 'ok' });
  }

  @AllowEmptySsoUser()
  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() forgotPasswordArgs: ForgotPasswordArgs,
  ): Promise<StatusResponse> {
    await this.ssoService.forgotPassword({
      forgotPasswordArgs,
      ssoRequest,
      projectId: ssoRequest.ssoProject.id,
    });

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.forgot-password'],
      eventBody: omit(['password'], ssoRequest.ssoUser || {}),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    return { message: 'ok' };
  }

  @AllowEmptySsoUser()
  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('complete-forgot-password')
  async completeForgotPassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() completeForgotPasswordArgs: CompleteForgotPasswordArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const user = await this.ssoService.completeForgotPassword({
      completeForgotPasswordArgs,
      projectId: ssoRequest.ssoProject.id,
    });

    if (!user) {
      throw new SsoError(SsoErrorEnum.UserNotFound);
    }

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.complete-forgot-password'],
      eventBody: omit(['password'], ssoRequest.ssoUser || {}),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    const cookieWithJwtToken = await this.ssoCookieService.getCookieWithJwtToken({
      userId: user.id,
      userIp,
      userAgent,
      fingerprint: completeForgotPasswordArgs.fingerprint,
      roles: user.roles,
      projectId: ssoRequest.ssoProject.id,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    const result: TokensResponse = {
      user,
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    };
    response.send(result);
  }

  @AllowEmptySsoUser()
  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() refreshTokensArgs: RefreshTokensResponse,
    @Res({ passthrough: true }) response: Response,
    @Cookies('refreshToken') cookieRefreshToken: string | null,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
  ): Promise<void> {
    const refreshToken = cookieRefreshToken || refreshTokensArgs.refreshToken;
    if (!refreshToken) {
      throw new SsoError(SsoErrorEnum.RefreshTokenNotProvided);
    }

    const cookieWithJwtToken = await this.ssoService.refreshTokens({
      refreshToken,
      userIp,
      userAgent,
      fingerprint: refreshTokensArgs.fingerprint,
      projectId: ssoRequest.ssoProject.id,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    const result: TokensResponse = {
      user: cookieWithJwtToken.user,
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    };
    response.send(result);
  }

  @ApiOkResponse({ type: SsoUserDto })
  @Get('profile')
  profile(@CurrentSsoRequest() ssoRequest: SsoRequest): SsoUserDto {
    assert(ssoRequest.ssoUser);
    return ssoRequest.ssoUser;
  }

  @ApiOkResponse({ type: SsoUserDto })
  @Put('profile')
  async updateProfile(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() updateProfileArgs: UpdateProfileArgs,
    @InjectTranslateFunction() getText: TranslateFunction,
  ): Promise<SsoUserDto> {
    assert(ssoRequest.ssoUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...profile } = updateProfileArgs;

    if (profile.lang && !this.translatesStorage.locales.includes(profile.lang)) {
      throw new ValidationError(undefined, ValidationErrorEnum.COMMON, [
        {
          property: 'lang',
          constraints: {
            isWrongEnumValue: getText('lang must have one of the values: {{values}}', {
              values: this.translatesStorage.locales.join(', '),
            }),
          },
        },
      ]);
    }

    const user = await this.ssoService.update({
      user: {
        ...profile,
        id: ssoRequest.ssoUser.id,
      },
      projectId: ssoRequest.ssoProject.id,
    });

    await this.ssoCacheService.clearCacheByUserId({
      userId: ssoRequest.ssoUser.id,
    });

    await this.webhookService.sendEvent({
      eventName: SsoWebhookEvent['sso.update-profile'],
      eventBody: omit(['password'], user),
      eventHeaders: { projectId: ssoRequest.ssoProject.id },
    });

    return user;
  }
}
