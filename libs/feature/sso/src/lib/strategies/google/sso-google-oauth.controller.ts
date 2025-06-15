import { Controller, Get, Logger, Next, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { render } from 'mustache';
import passport from 'passport';
import { AllowEmptySsoUser } from '../../sso.decorators';
import { SsoError } from '../../sso.errors';
import { SsoGoogleOAuthStrategy } from './sso-google-oauth.strategy';
import { SsoStaticEnvironments } from '../../sso.environments';

@ApiTags('Sso')
@AllowEmptySsoUser()
@Controller('/sso/oauth/google')
export class SsoGoogleOAuthController {
  logger = new Logger(SsoGoogleOAuthController.name);
  constructor(private readonly ssoStaticEnvironments: SsoStaticEnvironments) {}

  @Get()
  googleAuth(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Next() next: any,
    @Query('redirect_uri') redirectUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('client_id') clientId: string,
  ): void {
    try {
      passport.authenticate(SsoGoogleOAuthStrategy.oauthProviderName, {
        successRedirect: redirectUrl,
        failureRedirect: redirectUrl,
        passReqToCallback: true,
      })(req, res, next);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new SsoError(err.message);
    }
  }

  @Get('redirect')
  @UseGuards(AuthGuard(SsoGoogleOAuthStrategy.oauthProviderName))
  async googleAuthRedirect(
    @Query('redirect_uri') redirectUrl: string,
    @Query('client_id') clientId: string,
    @Req() req: { user: { verificationCode: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const domain = this.ssoStaticEnvironments.clientUrl;
    const redirectUrlAfterLogin = clientId
      ? `{{{domain}}}/complete-oauth-sign-up?verification_code={{verificationCode}}&client_id=${clientId}`
      : `{{{domain}}}/complete-oauth-sign-up?verification_code={{verificationCode}}`;
    const context = {
      verificationCode: req?.user?.verificationCode || 'Error',
      domain,
    };
    try {
      const url = render(redirectUrlAfterLogin, context);
      if (!req?.user?.verificationCode) {
        this.logger.error(`User verification code not detected`);
      }
      res.redirect(url);
    } catch (error) {
      throw Error(`Error in render url from template: "${redirectUrlAfterLogin}",  context: "${context}"`);
    }
  }
}
