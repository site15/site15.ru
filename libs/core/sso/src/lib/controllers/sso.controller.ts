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
import { SignUpArgs } from '../types/sign-up.dto';
import { SsoEntities } from '../types/sso-entities';
import { SsoRequest } from '../types/sso-request';
import { TokensResponse } from '../types/tokens.dto';
import { UpdateProfileModel as UpdateProfileArgs } from '../types/update-profile.dto';

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
    const user = await this.ssoService.signIn(
      signInArgs,
      ssoRequest.ssoProject.id
    );

    await this.ssoEventsService.send({
      userId: user.id,
      SignIn: { signInArgs: signInArgs },
      userIp,
      userAgent,
    });

    const cookieWithJwtToken =
      await this.ssoCookieService.getCookieWithJwtToken(
        user.id,
        userIp,
        userAgent,
        signInArgs.fingerprint
      );

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: TokensResponse })
  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() signUpArgs: SignUpArgs,
    @Res() response: Response,
    @IpAddress() userIp: string,
    @UserAgent() userAgent: string
  ) {
    const user = await this.ssoService.signUp(
      signUpArgs,
      ssoRequest.ssoProject.id
    );

    await this.ssoEventsService.send({
      userId: user.id,
      SignUp: { signUpArgs: signUpArgs },
      userIp,
      userAgent,
    });

    const cookieWithJwtToken =
      await this.ssoCookieService.getCookieWithJwtToken(
        user.id,
        userIp,
        userAgent,
        signUpArgs.fingerprint
      );

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

    const cookieWithJwtToken = await this.ssoCookieService.getCookieForSignOut(
      refreshToken
    );

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
  forgotPassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() forgotPasswordArgs: ForgotPasswordArgs
  ) {
    return this.ssoService.forgotPassword(
      forgotPasswordArgs,
      ssoRequest.ssoProject.id,
      ssoRequest
    );
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
    const user = await this.ssoService.completeForgotPassword(
      code,
      completeForgotPasswordArgs
    );
    const cookieWithJwtToken =
      await this.ssoCookieService.getCookieWithJwtToken(
        user.id,
        userIp,
        userAgent,
        completeForgotPasswordArgs.fingerprint
      );

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: StatusResponse })
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() changePasswordArgs: ChangePasswordArgs
  ) {
    return this.ssoService.changePassword(
      ssoRequest.ssoUser.id,
      changePasswordArgs
    );
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

    const cookieWithJwtToken = await this.ssoService.refreshTokens(
      refreshToken,
      userIp,
      userAgent,
      refreshTokensArgs.fingerprint
    );

    response.setHeader('Set-Cookie', cookieWithJwtToken.cookie);

    return response.send({
      accessToken: cookieWithJwtToken.accessToken,
      refreshToken: cookieWithJwtToken.refreshToken,
    });
  }

  @ApiOkResponse({ type: SsoUserDto })
  @Get('profile')
  profile(@CurrentSsoRequest() ssoRequest: SsoRequest) {
    return {
      ...ssoRequest.ssoUser,
      password: '',
    };
  }

  @ApiOkResponse({ type: SsoUserDto })
  @Put('profile')
  updateProfile(
    @CurrentSsoRequest() ssoRequest: SsoRequest,
    @Body() updateProfileArgs: UpdateProfileArgs
  ) {
    return this.ssoService.update(
      {
        ...updateProfileArgs,
        id: ssoRequest.ssoUser.id,
      },
      ssoRequest.ssoProject.id
    );
  }
}
