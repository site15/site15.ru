/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import ms from 'ms';
import { TranslatesAsyncLocalStorageContext } from 'nestjs-translates';
import { PrismaClient, SsoUser } from '../generated/prisma-client';
import { OperationName, SsoConfiguration, SsoSendNotificationOptions } from '../sso.configuration';
import { DEFAULT_EMAIL_TEMPLATE_BY_NAMES, SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { CompleteForgotPasswordArgs, ForgotPasswordArgs } from '../types/forgot-password.dto';
import { SignInArgs } from '../types/sign-in.dto';
import { SignUpArgs } from '../types/sign-up.dto';
import { SsoRequest } from '../types/sso-request';
import { SsoCacheService } from './sso-cache.service';
import { SsoCookieService } from './sso-cookie.service';
import { SsoTemplatesService } from './sso-templates.service';
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
    private readonly ssoCookieService: SsoCookieService,
    private readonly translatesAsyncLocalStorageContext: TranslatesAsyncLocalStorageContext,
    private readonly ssoTokensService: SsoTokensService,
    private readonly ssoCacheService: SsoCacheService,
    private readonly ssoTemplatesService: SsoTemplatesService,
  ) {}

  signIn({ signInArgs, tenantId }: { signInArgs: SignInArgs; tenantId: string }) {
    return this.ssoUsersService.getByEmailAndPassword({
      email: signInArgs.email,
      password: signInArgs.password,
      tenantId,
    });
  }

  async autoSignUp({
    email,
    password,
    username,
    tenantId,
    firstname,
    lastname,
    picture,
  }: {
    email: string;
    password: string;
    username?: string;
    tenantId: string;
    firstname?: string;
    lastname?: string;
    picture?: string;
  }) {
    return await this.ssoUsersService.create({
      user: {
        email,
        username,
        password,
        emailVerifiedAt: new Date(),
        firstname,
        lastname,
        picture,
      },
      tenantId,
      roles: this.ssoStaticEnvironments.userDefaultRoles,
    });
  }

  async signUp({
    signUpArgs,
    tenantId,
    operationName,
    xSkipEmailVerification,
  }: {
    signUpArgs: SignUpArgs;
    tenantId: string;
    operationName: OperationName;
    xSkipEmailVerification?: boolean;
  }) {
    const { email, password, appData, username } = signUpArgs;

    let user = await this.ssoUsersService.create({
      user: {
        email,
        password,
        appData,
        username,
        emailVerifiedAt:
          !xSkipEmailVerification &&
          this.ssoConfiguration.twoFactorCodeGenerate &&
          this.ssoConfiguration.sendNotification
            ? null
            : new Date(),
      },
      tenantId,
      roles: this.ssoStaticEnvironments.userDefaultRoles,
    });

    if (!xSkipEmailVerification && this.ssoConfiguration.twoFactorCodeGenerate) {
      const options =
        operationName === OperationName.VERIFY_EMAIL
          ? await this.getCompleteSignUpOptions({ tenantId, user, signUpArgs })
          : await this.getCompleteRegistrationUsingTheInvitationLinkOptions({
              tenantId,
              user,
              signUpArgs,
            });

      if (this.ssoConfiguration.sendNotification && options?.sendNotificationOptions) {
        const result = await this.ssoConfiguration.sendNotification(options?.sendNotificationOptions);
        if (!result || this.ssoStaticEnvironments.disableEmailVerification) {
          user = await this.prismaClient.ssoUser.update({
            include: { SsoTenant: true },
            data: {
              emailVerifiedAt: new Date(),
            },
            where: { id: user.id, tenantId },
          });
          await this.ssoCacheService.clearCacheByUserId({ userId: user.id });
        }
      } else {
        this.logger.debug({
          code: options?.code,
          timeout: options?.timeout,
          sendNotification: options?.sendNotificationOptions,
        });
      }
      return { user, code: options?.code, timeout: options?.timeout };
    }
    return { user, code: '', timeout: 0 };
  }

  private async getCompleteSignUpOptions({
    tenantId,
    user,
    signUpArgs,
  }: {
    tenantId: string;
    user: SsoUser;
    signUpArgs: SignUpArgs;
  }) {
    const tenant = await this.prismaClient.ssoTenant.findFirst({
      where: { id: { equals: tenantId } },
    });
    const { operationName, subject, text, html } = await this.getSendNotificationOptions(
      OperationName.VERIFY_EMAIL,
      tenantId,
    );
    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const { code, timeout } = await this.ssoConfiguration.twoFactorCodeGenerate({
        user,
        operationName: OperationName.VERIFY_EMAIL,
      });

      const link = signUpArgs.redirectUri
        ? `${this.ssoStaticEnvironments.clientUrl}/complete-sign-up?code=${code}&redirect_uri=${signUpArgs.redirectUri}&client_id=${tenant?.clientId}`
        : `${this.ssoStaticEnvironments.clientUrl}/complete-sign-up?code=${code}&client_id=${tenant?.clientId}`;
      const sendNotificationOptions: SsoSendNotificationOptions = {
        recipientUsers: [user],
        subject: this.translatesAsyncLocalStorageContext.get().translate(subject, {
          link,
          timeoutSeconds: Math.floor(timeout / 1000),
          timeoutMinutes: Math.floor(timeout / 1000 / 60),
          timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
        }),
        text: this.translatesAsyncLocalStorageContext.get().translate(text, {
          link,
          timeoutSeconds: Math.floor(timeout / 1000),
          timeoutMinutes: Math.floor(timeout / 1000 / 60),
          timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
        }),
        html: this.translatesAsyncLocalStorageContext.get().translate(html, {
          link,
          timeoutSeconds: Math.floor(timeout / 1000),
          timeoutMinutes: Math.floor(timeout / 1000 / 60),
          timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
        }),
        operationName,
        tenantId,
      };
      return { sendNotificationOptions, code, timeout };
    }
    return undefined;
  }

  private async getCompleteRegistrationUsingTheInvitationLinkOptions({
    tenantId,
    user,
    signUpArgs,
  }: {
    tenantId: string;
    user: SsoUser;
    signUpArgs: SignUpArgs;
  }) {
    const tenant = await this.prismaClient.ssoTenant.findFirst({
      where: { id: { equals: tenantId } },
    });
    const { operationName, subject, text, html } = await this.getSendNotificationOptions(
      OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK,
      tenantId,
    );
    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const { code, timeout } = await this.ssoConfiguration.twoFactorCodeGenerate({
        user,
        operationName: OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK,
      });

      const link = signUpArgs.redirectUri
        ? `${this.ssoStaticEnvironments.clientUrl}/complete-invite?code=${code}&redirect_uri=${signUpArgs.redirectUri}&client_id=${tenant?.clientId}`
        : `${this.ssoStaticEnvironments.clientUrl}/complete-invite?code=${code}&client_id=${tenant?.clientId}`;
      const sendNotificationOptions: SsoSendNotificationOptions = {
        recipientUsers: [user],
        subject: this.translatesAsyncLocalStorageContext.get().translate(subject, {
          link,
          timeoutSeconds: Math.floor(timeout / 1000),
          timeoutMinutes: Math.floor(timeout / 1000 / 60),
          timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
        }),
        text: this.translatesAsyncLocalStorageContext.get().translate(text, {
          link,
          timeoutSeconds: Math.floor(timeout / 1000),
          timeoutMinutes: Math.floor(timeout / 1000 / 60),
          timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
        }),
        html: this.translatesAsyncLocalStorageContext.get().translate(html, {
          link,
          timeoutSeconds: Math.floor(timeout / 1000),
          timeoutMinutes: Math.floor(timeout / 1000 / 60),
          timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
        }),
        operationName,
        tenantId,
      };
      return { sendNotificationOptions, code, timeout };
    }
    return undefined;
  }

  private async getSendNotificationOptions(operationName: OperationName, tenantId: string) {
    const defaultLocale = this.translatesAsyncLocalStorageContext.get().config?.defaultLocale || 'en';
    const locale = this.translatesAsyncLocalStorageContext.get().locale || defaultLocale;

    const template = await this.ssoTemplatesService.getEmailTemplate({
      operationName,
      tenantId,
    });
    const defaultTemplate = DEFAULT_EMAIL_TEMPLATE_BY_NAMES[operationName];

    const subject =
      (locale === defaultLocale ? template?.subject : (template?.subjectLocale as any)?.[locale]) ||
      defaultTemplate.subject;

    const text =
      (locale === defaultLocale ? template?.text : (template?.textLocale as any)?.[locale]) || defaultTemplate.text;
    const html =
      (locale === defaultLocale ? template?.html : (template?.htmlLocale as any)?.[locale]) || defaultTemplate.html;
    return { operationName, subject, text, html };
  }

  async completeSignUp({ code, tenantId }: { code: string; tenantId: string }) {
    const twoFactorCodeValidateResult = this.ssoConfiguration.twoFactorCodeValidate
      ? await this.ssoConfiguration.twoFactorCodeValidate({
          code,
          tenantId,
          operationName: OperationName.VERIFY_EMAIL,
        })
      : null;

    if (!twoFactorCodeValidateResult) {
      return twoFactorCodeValidateResult;
    }

    this.logger.debug({
      completeSignUp: {
        code,
        tenantId,
        result: twoFactorCodeValidateResult,
      },
    });

    const result = await this.prismaClient.ssoUser.update({
      where: { id: twoFactorCodeValidateResult.userId, tenantId },
      data: { emailVerifiedAt: new Date(), updatedAt: new Date() },
    });

    await this.ssoCacheService.clearCacheByUserId({
      userId: twoFactorCodeValidateResult.userId,
    });

    return result;
  }

  async forgotPassword({
    forgotPasswordArgs,
    ssoRequest,
    tenantId,
  }: {
    forgotPasswordArgs: ForgotPasswordArgs;
    ssoRequest: SsoRequest;
    tenantId: string;
  }) {
    const tenant = await this.prismaClient.ssoTenant.findFirst({
      where: { id: { equals: tenantId } },
    });
    const user = await this.ssoUsersService.getByEmail({
      email: forgotPasswordArgs.email,
      tenantId,
    });
    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const { operationName, subject, text, html } = await this.getSendNotificationOptions(
        OperationName.COMPLETE_FORGOT_PASSWORD,
        tenantId,
      );

      const { code, timeout } = await this.ssoConfiguration.twoFactorCodeGenerate({
        ...ssoRequest,
        user,
        operationName: OperationName.COMPLETE_FORGOT_PASSWORD,
      });

      const link = forgotPasswordArgs.redirectUri
        ? `${this.ssoStaticEnvironments.clientUrl}/complete-forgot-password?code=${code}&redirect_uri=${forgotPasswordArgs.redirectUri}&client_id=${tenant?.clientId}`
        : `${this.ssoStaticEnvironments.clientUrl}/complete-forgot-password?code=${code}&client_id=${tenant?.clientId}`;
      if (this.ssoConfiguration.sendNotification) {
        await this.ssoConfiguration.sendNotification({
          tenantId,
          recipientUsers: [user],
          subject: this.translatesAsyncLocalStorageContext.get().translate(subject, {
            link,
            timeoutSeconds: Math.floor(timeout / 1000),
            timeoutMinutes: Math.floor(timeout / 1000 / 60),
            timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
          }),
          text: this.translatesAsyncLocalStorageContext.get().translate(text, {
            link,
            timeoutSeconds: Math.floor(timeout / 1000),
            timeoutMinutes: Math.floor(timeout / 1000 / 60),
            timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
          }),
          html: this.translatesAsyncLocalStorageContext.get().translate(html, {
            link,
            timeoutSeconds: Math.floor(timeout / 1000),
            timeoutMinutes: Math.floor(timeout / 1000 / 60),
            timeoutHours: Math.floor(timeout / 1000 / 60 / 60),
          }),
          operationName,
        });
      }
    }
  }

  async completeForgotPassword({
    completeForgotPasswordArgs,
    tenantId,
  }: {
    completeForgotPasswordArgs: CompleteForgotPasswordArgs;
    tenantId: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fingerprint, confirmPassword, ...data } = completeForgotPasswordArgs;
    if (this.ssoConfiguration.twoFactorCodeValidate) {
      const result = await this.ssoConfiguration.twoFactorCodeValidate({
        code: completeForgotPasswordArgs.code,
        tenantId,
        operationName: OperationName.COMPLETE_FORGOT_PASSWORD,
      });
      return this.ssoUsersService.changePassword({
        id: result.userId,
        password: data.password,
        tenantId,
      });
    }
    return null;
  }

  update({
    user,
    tenantId,
  }: {
    user: Pick<SsoUser, 'birthdate' | 'firstname' | 'lastname' | 'id' | 'picture' | 'gender' | 'lang' | 'timezone'> & {
      password: string | null;
      oldPassword: string | null;
    };
    tenantId: string;
  }) {
    return this.ssoUsersService.update({
      user,
      tenantId,
    });
  }

  async refreshTokens({
    refreshToken,
    userIp,
    userAgent,
    fingerprint,
    tenantId,
  }: {
    refreshToken: string;
    userIp: string;
    userAgent: string;
    fingerprint: string;
    tenantId: string;
  }) {
    const tokens = await this.ssoTokensService.getAccessAndRefreshTokensByRefreshToken({
      refreshToken,
      userIp,
      userAgent,
      fingerprint,
      tenantId,
    });
    const cookie = this.ssoCookieService.getCookie({
      name: 'refreshToken',
      value: tokens.refreshToken,
      options: {
        ['max-age']: Math.round(ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn) / 1000),
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
