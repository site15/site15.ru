import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, SsoUser } from '@prisma/sso-client';
import ms from 'ms';
import { TranslatesAsyncLocalStorageContext } from 'nestjs-translates';
import {
  SsoSendNotificationOptions,
  SsoConfiguration,
} from '../sso.configuration';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { ChangePasswordArgs } from '../types/change-password.dto';
import {
  CompleteForgotPasswordArgs,
  ForgotPasswordArgs,
} from '../types/forgot-password.dto';
import { SignInArgs } from '../types/sign-in.dto';
import { SignUpArgs } from '../types/sign-up.dto';
import { SsoRequest } from '../types/sso-request';
import { SsoCookieService } from './sso-cookie.service';
import { SsoTokensService } from './sso-tokens.service';
import { SsoUsersService } from './sso-users.service';

@Injectable()
export class SsoService {
  private logger = new Logger(SsoService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoUsersService: SsoUsersService,
    private readonly jwtService: JwtService,
    private readonly ssoCookieService: SsoCookieService,
    private readonly translatesAsyncLocalStorageContext: TranslatesAsyncLocalStorageContext,
    private readonly prismaToolsService: PrismaToolsService,
    private readonly ssoTokensService: SsoTokensService
  ) {}

  signIn({
    signInArgs,
    projectId,
  }: {
    signInArgs: SignInArgs;
    projectId: string;
  }) {
    return this.ssoUsersService.getByEmailAndPassword({
      email: signInArgs.email,
      password: signInArgs.password,
      projectId,
    });
  }

  async signUp({
    signUpArgs,
    projectId,
  }: {
    signUpArgs: SignUpArgs;
    projectId: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fingerprint, rePassword, ...data } = signUpArgs;
    const user = await this.ssoUsersService.create({
      user: {
        ...data,
        emailVerifiedAt: this.ssoConfiguration.twoFactorCodeGenerate
          ? null
          : new Date(),
      },
      projectId,
    });

    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const code = await this.ssoConfiguration.twoFactorCodeGenerate({
        user,
      });
      const sendNotificationOptions: SsoSendNotificationOptions = {
        recipientUsers: [user],
        subject: this.translatesAsyncLocalStorageContext
          .get()
          .translate('Verify your email'),
        html: [
          this.translatesAsyncLocalStorageContext
            .get()
            .translate(
              'Please navigate by a <a href="{{{domain}}}/verify-email?code={{code}}">link</a> to verify your email',
              {
                domain: this.ssoStaticEnvironments.templatesVarDomain,
                code: code,
              }
            ),
        ].join('<br/>'),
        context: {
          domain: this.ssoStaticEnvironments.templatesVarDomain,
          code: code,
        },
        projectId,
      };
      if (this.ssoConfiguration.sendNotification) {
        await this.ssoConfiguration.sendNotification(sendNotificationOptions);
      } else {
        this.logger.debug({
          sendNotification: sendNotificationOptions,
        });
      }
    }

    return user;
  }

  async completeSignUp({
    code,
    projectId,
  }: {
    code: string;
    projectId: string;
  }) {
    const result = this.ssoConfiguration.twoFactorCodeValidate
      ? await this.ssoConfiguration.twoFactorCodeValidate({
          code,
          projectId,
        })
      : null;

    if (!result) {
      return result;
    }

    return await this.prismaClient.ssoUser.update({
      where: { id: result.userId, projectId },
      data: { emailVerifiedAt: new Date(), updatedAt: new Date() },
    });
  }

  changePassword({
    userId,
    changePasswordArgs,
    projectId,
  }: {
    userId: string;
    changePasswordArgs: ChangePasswordArgs;
    projectId: string;
  }) {
    return this.ssoUsersService.changePassword({
      id: userId,
      password: changePasswordArgs.password,
      projectId,
    });
  }

  async forgotPassword({
    forgotPasswordArgs,
    ssoRequest,
    projectId,
  }: {
    forgotPasswordArgs: ForgotPasswordArgs;
    ssoRequest: SsoRequest;
    projectId: string;
  }) {
    const user = await this.ssoUsersService.getByEmail({
      email: forgotPasswordArgs.email,
      projectId,
    });
    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const code = await this.ssoConfiguration.twoFactorCodeGenerate({
        ...ssoRequest,
        user,
      });

      if (this.ssoConfiguration.sendNotification) {
        await this.ssoConfiguration.sendNotification({
          projectId,
          recipientUsers: [user],
          subject: this.translatesAsyncLocalStorageContext
            .get()
            .translate('Restore forgotten password link'),
          html: [
            this.translatesAsyncLocalStorageContext
              .get()
              .translate(
                'Please navigate by a <a href="{{{domain}}}/complete-forgot-password?code={{code}}">link</a> to set new password',
                {
                  domain: this.ssoStaticEnvironments.templatesVarDomain,
                  code: code,
                }
              ),
          ].join('<br/>'),
          context: {
            domain: this.ssoStaticEnvironments.templatesVarDomain,
            code: code,
          },
        });
      }
    }
  }

  async completeForgotPassword({
    code,
    completeForgotPasswordArgs,
    projectId,
  }: {
    code: string;
    completeForgotPasswordArgs: CompleteForgotPasswordArgs;
    projectId: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fingerprint, rePassword, ...data } = completeForgotPasswordArgs;
    if (this.ssoConfiguration.twoFactorCodeValidate) {
      const result = await this.ssoConfiguration.twoFactorCodeValidate({
        code,
        projectId,
      });
      return this.ssoUsersService.changePassword({
        id: result.userId,
        password: data.password,
        projectId,
      });
    }
    return null;
  }

  update({
    user,
    projectId,
  }: {
    user: Pick<
      SsoUser,
      'birthdate' | 'firstname' | 'lastname' | 'id' | 'picture' | 'gender'
    >;
    projectId: string;
  }) {
    return this.ssoUsersService.update({
      user,
      projectId,
    });
  }

  async refreshTokens({
    refreshToken,
    userIp,
    userAgent,
    fingerprint,
    projectId,
  }: {
    refreshToken: string;
    userIp: string;
    userAgent: string;
    fingerprint: string;
    projectId: string;
  }) {
    const tokens =
      await this.ssoTokensService.getAccessAndRefreshTokensByRefreshToken({
        refreshToken,
        userIp,
        userAgent,
        fingerprint,
        projectId,
      });
    const cookie = this.ssoCookieService.getCookie({
      name: 'refreshToken',
      value: tokens.refreshToken,
      options: {
        ['max-age']: Math.round(
          ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn) / 1000
        ),
        path: '/',
        httponly: true,
        signed: true,
        sameSite: true,
      },
    });
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      cookie,
    };
  }
}
