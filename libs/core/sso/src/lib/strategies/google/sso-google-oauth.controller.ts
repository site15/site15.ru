import {
  Controller,
  Get,
  Logger,
  Next,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { render } from 'mustache';
import passport from 'passport';
import { AllowEmptySsoUser } from '../../sso.decorators';
import { SsoGoogleOAuthStrategy } from './sso-google-oauth.strategy';

@ApiTags('Sso')
@AllowEmptySsoUser()
@Controller('/sso/oauth/google')
export class SsoGoogleOAuthController {
  logger = new Logger(SsoGoogleOAuthController.name);

  @Get()
  googleAuth(
    @Req() req: Request,
    @Res() res: Response,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Next() next: any,
    @Query('redirect_uri') redirectUrl: string
  ): void {
    passport.authenticate(SsoGoogleOAuthStrategy.oauthProviderName, {
      successRedirect: redirectUrl,
    })(req, res, next);
  }

  @Get('redirect')
  @UseGuards(AuthGuard(SsoGoogleOAuthStrategy.oauthProviderName))
  googleAuthRedirect(
    @Query() redirectUrl: string,
    @Req() req: { user: { verificationCode: string } },
    @Res() res: Response
  ): void {
    const domain = 'https://sso.nestjs-mod.com';
    const redirectUrlAfterLogin =
      '{{{domain}}}?verificationCode={{verificationCode}}';
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
      throw Error(
        `Error in render url from template: "${redirectUrlAfterLogin}",  context: "${context}"`
      );
    }
  }
}
