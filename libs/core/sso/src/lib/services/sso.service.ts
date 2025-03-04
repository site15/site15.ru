import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, SsoUser } from '@prisma/sso-client';
import ms from 'ms';
import { TranslatesAsyncLocalStorageContext } from 'nestjs-translates';
import {
  SsoConfiguration,
  SsoSendNotificationOptions,
  SsoSendNotificationOptionsOperationName,
  SsoTwoFactorCodeOptionsOperationName,
} from '../sso.configuration';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
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
import { SsoCacheService } from './sso-cache.service';

@Injectable()
export class SsoService {
  private logger = new Logger(SsoService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoConfiguration: SsoConfiguration,
    private readonly ssoUsersService: SsoUsersService,
    private readonly ssoCookieService: SsoCookieService,
    private readonly translatesAsyncLocalStorageContext: TranslatesAsyncLocalStorageContext,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoCacheService: SsoCacheService
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
    const { fingerprint, confirmPassword, ...data } = signUpArgs;
    let user = await this.ssoUsersService.create({
      user: {
        ...data,
        emailVerifiedAt:
          this.ssoConfiguration.twoFactorCodeGenerate &&
          this.ssoConfiguration.sendNotification
            ? null
            : new Date(),
      },
      projectId,
      roles: this.ssoStaticEnvironments.userDefaultRoles,
    });

    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const code = await this.ssoConfiguration.twoFactorCodeGenerate({
        user,
        operationName: SsoTwoFactorCodeOptionsOperationName.VERIFY_EMAIL,
      });
      const sendNotificationOptions: SsoSendNotificationOptions = {
        recipientUsers: [user],
        subject: this.translatesAsyncLocalStorageContext
          .get()
          .translate('Verify your email'),
        text: this.translatesAsyncLocalStorageContext
          .get()
          .translate(
            'Please navigate by a {{{domain}}}/verify-email?code={{code}} to verify your email',
            {
              domain: this.ssoStaticEnvironments.templatesVarSsoServerUrl,
              code: code,
            }
          ),
        html: this.translatesAsyncLocalStorageContext
          .get()
          .translate(
            'Please navigate by a <a href="{{{domain}}}/verify-email?code={{code}}">link</a> to verify your email',
            {
              domain: this.ssoStaticEnvironments.templatesVarSsoServerUrl,
              code: code,
            }
          ),
        operationName: SsoSendNotificationOptionsOperationName.VERIFY_EMAIL,
        projectId,
      };
      if (this.ssoConfiguration.sendNotification) {
        const result = await this.ssoConfiguration.sendNotification(
          sendNotificationOptions
        );
        if (!result) {
          user = await this.prismaClient.ssoUser.update({
            data: {
              emailVerifiedAt: new Date(),
            },
            where: { id: user.id, projectId },
          });
        }
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
    const twoFactorCodeValidateResult = this.ssoConfiguration
      .twoFactorCodeValidate
      ? await this.ssoConfiguration.twoFactorCodeValidate({
          code,
          projectId,
          operationName: SsoTwoFactorCodeOptionsOperationName.VERIFY_EMAIL,
        })
      : null;

    if (!twoFactorCodeValidateResult) {
      return twoFactorCodeValidateResult;
    }

    this.logger.debug({
      completeSignUp: {
        code,
        projectId,
        result: twoFactorCodeValidateResult,
      },
    });

    const result = await this.prismaClient.ssoUser.update({
      where: { id: twoFactorCodeValidateResult.userId, projectId },
      data: { emailVerifiedAt: new Date(), updatedAt: new Date() },
    });

    await this.ssoCacheService.clearCacheByUserId(
      twoFactorCodeValidateResult.userId
    );

    return result;
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
        operationName:
          SsoTwoFactorCodeOptionsOperationName.COMPLETE_FORGOT_PASSWORD,
      });

      if (this.ssoConfiguration.sendNotification) {
        await this.ssoConfiguration.sendNotification({
          projectId,
          recipientUsers: [user],
          subject: this.translatesAsyncLocalStorageContext
            .get()
            .translate('Restore forgotten password link'),
          text: this.translatesAsyncLocalStorageContext
            .get()
            .translate(
              'Please navigate by a {{{domain}}}/complete-forgot-password?code={{code}} to set new password',
              {
                domain: this.ssoStaticEnvironments.templatesVarSsoServerUrl,
                code: code,
              }
            ),
          html: this.translatesAsyncLocalStorageContext
            .get()
            .translate(
              'Please navigate by a <a href="{{{domain}}}/complete-forgot-password?code={{code}}">link</a> to set new password',
              {
                domain: this.ssoStaticEnvironments.templatesVarSsoServerUrl,
                code: code,
              }
            ),
          operationName:
            SsoSendNotificationOptionsOperationName.COMPLETE_FORGOT_PASSWORD,
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
    const { fingerprint, confirmPassword, ...data } =
      completeForgotPasswordArgs;
    if (this.ssoConfiguration.twoFactorCodeValidate) {
      const result = await this.ssoConfiguration.twoFactorCodeValidate({
        code,
        projectId,
        operationName:
          SsoTwoFactorCodeOptionsOperationName.COMPLETE_FORGOT_PASSWORD,
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
    > & { password: string | null; oldPassword: string | null };
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
      user: tokens.user,
    };
  }
}
