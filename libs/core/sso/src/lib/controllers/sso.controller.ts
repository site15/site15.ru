import { StatusResponse } from '@nestjs-mod-sso/common';
import { ValidationError } from '@nestjs-mod-sso/validation';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Cookies } from '../decorators/cookie.decorator';
import { IpAddress } from '../decorators/ip-address.decorator';
import { UserAgent } from '../decorators/user-agent.decorator';
import { SsoUserDto } from '../generated/rest/dto/sso-user.dto';
import { SsoCookieService } from '../services/sso-cookie.service';
import { SsoEventsService } from '../services/sso-events.service';
import { SsoService } from '../services/sso.service';
import { CurrentSsoRequest } from '../sso.decorators';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { ChangePasswordArgs } from '../types/change-password.dto';
import {
  CompleteForgotPasswordArgs,
  ForgotPasswordArgs,
} from '../types/forgot-password.dto';
import { RefreshTokensResponse } from '../types/refresh-tokens.dto';
import { SignInArgs } from '../types/sign-in.dto';
import { SignOutArgs } from '../types/sign-out.dto';
import { CompleteSignUpArgs, SignUpArgs } from '../types/sign-up.dto';
import { SsoEntities } from '../types/sso-entities';
import { SsoRequest } from '../types/sso-request';
import { TokensResponse } from '../types/tokens.dto';
import { UpdateProfileArgs } from '../types/update-profile.dto';
import assert from 'node:assert';

@ApiExtraModels(SsoError, SsoEntities, ValidationError)
@ApiBadRequestResponse({
  schema: { allOf: refs(SsoError, ValidationError) },
})
@ApiTags('Sso')
@Controller('/sso')
export class SsoController {
  constructor(
    private readonly ssoCookieService: SsoCookieService,
    private readonly ssoService: SsoService,
    private readonly ssoEventsService: SsoEventsService
  ) {}

  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signInArgs: SignInArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string
  ) {
    const user = await this.ssoService.signIn({
      signInArgs,
      projectId: ssoRequest.ssoProject.id,
    });

    if (user.emailVerifiedAt === null) {
      throw new SsoError(SsoErrorEnum.EmailNotVerified);
    }

    await this.ssoEventsService.send({
      userId: user.id,
      SignIn: { signInArgs },
      userIp,
      userAgent,
    });

    const cookieWithJwtToken =
      await this.ssoCookieService.getCookieWithJwtToken({
        userId: user.id,
        userIp,
        userAgent,
        fingerprint: signInArgs.fingerprint,
        roles: user.roles,
        projectId: ssoRequest.ssoProject.id,
      });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signUpArgs: SignUpArgs,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string
  ) {
    const user = await this.ssoService.signUp({
      signUpArgs,
      projectId: ssoRequest.ssoProject.id,
    });

    await this.ssoEventsService.send({
      userId: user.id,
      SignUp: { signUpArgs: signUpArgs },
      userIp,
      userAgent,
    });

    return { message: 'ok' };
  }

  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('complete-sign-up')
  async completeSignUp(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() completeSignUpArgs: CompleteSignUpArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
    @Query('code') code: string
  ) {
    const user = await this.ssoService.completeSignUp({
      code,
      projectId: ssoRequest.ssoProject.id,
    });

    const cookieWithJwtToken =
      await this.ssoCookieService.getCookieWithJwtToken({
        userId: user.id,
        userIp,
        userAgent,
        fingerprint: completeSignUpArgs.fingerprint,
        roles: user.roles,
        projectId: ssoRequest.ssoProject.id,
      });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-out')
  async signOut(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signOutArgs: SignOutArgs | null,
    @Res({ passthrough: true }) response: Response,
    @Cookies('refreshToken') cookieRefreshToken: string | null,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string
  ) {
    const refreshToken = cookieRefreshToken || signOutArgs?.refreshToken;
    if (!refreshToken) {
      throw new SsoError(SsoErrorEnum.RefreshTokenNotProvided);
    }

    const cookieWithJwtToken = await this.ssoCookieService.getCookieForSignOut({
      refreshToken,
      projectId: ssoRequest.ssoProject.id,
    });

    await this.ssoEventsService.send({
      userId: cookieWithJwtToken.refreshSession?.userId,
      SignOut: { signOutArgs: { refreshToken } },
      userIp,
      userAgent,
    });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({ message: 'ok' });
  }

  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() forgotPasswordArgs: ForgotPasswordArgs
  ) {
    await this.ssoService.forgotPassword({
      forgotPasswordArgs,
      ssoRequest,
      projectId: ssoRequest.ssoProject.id,
    });
    return { message: 'ok' };
  }

  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('complete-forgot-password')
  async completeForgotPassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() completeForgotPasswordArgs: CompleteForgotPasswordArgs,
    @Res({ passthrough: true }) response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string,
    @Query('code') code: string
  ) {
    const user = await this.ssoService.completeForgotPassword({
      code,
      completeForgotPasswordArgs,
      projectId: ssoRequest.ssoProject.id,
    });
    const cookieWithJwtToken =
      await this.ssoCookieService.getCookieWithJwtToken({
        userId: user.id,
        userIp,
        userAgent,
        fingerprint: completeForgotPasswordArgs.fingerprint,
        roles: user.roles,
        projectId: ssoRequest.ssoProject.id,
      });

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() changePasswordArgs: ChangePasswordArgs
  ) {
    assert(ssoRequest.ssoUser);
    await this.ssoService.changePassword({
      userId: ssoRequest.ssoUser.id,
      changePasswordArgs,
      projectId: ssoRequest.ssoProject.id,
    });
    return { message: 'ok' };
  }

  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() refreshTokensArgs: RefreshTokensResponse,
    @Res({ passthrough: true }) response: Response,
    @Cookies('refreshToken') cookieRefreshToken: string | null,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string
  ) {
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

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: SsoUserDto })
  @Get('profile')
  profile(@CurrentSsoRequest() ssoRequest: SsoRequest) {
    return ssoRequest.ssoUser;
  }

  @ApiOkResponse({ type: SsoUserDto })
  @Put('profile')
  async updateProfile(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() updateProfileArgs: UpdateProfileArgs
  ) {
    assert(ssoRequest.ssoUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.ssoService.update({
      user: {
        ...updateProfileArgs,
        id: ssoRequest.ssoUser.id,
      },
      projectId: ssoRequest.ssoProject.id,
    });
    return user;
  }
}
