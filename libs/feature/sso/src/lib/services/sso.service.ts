/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import ms from 'ms';
import { TranslatesAsyncLocalStorageContext } from 'nestjs-translates';
import { PrismaClient, SsoUser } from '../generated/prisma-client';
import {
  OperationName,
  SsoConfiguration,
  SsoSendNotificationOptions,
} from '../sso.configuration';
import { DEFAULT_EMAIL_TEMPLATE_BY_NAMES, SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import {
  CompleteForgotPasswordArgs,
  ForgotPasswordArgs,
} from '../types/forgot-password.dto';
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
    private readonly ssoTemplatesService: SsoTemplatesService
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

  async autoSignUp({
    email,
    password,
    username,
    projectId,
    firstname,
    lastname,
    picture,
  }: {
    email: string;
    password: string;
    username?: string;
    projectId: string;
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
      projectId,
      roles: this.ssoStaticEnvironments.userDefaultRoles,
    });
  }

  async signUp({
    signUpArgs,
    projectId,
    operationName,
  }: {
    signUpArgs: SignUpArgs;
    projectId: string;
    operationName: OperationName;
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
      const sendNotificationOptions: SsoSendNotificationOptions =
        operationName === OperationName.VERIFY_EMAIL
          ? await this.getCompleteSignUpOptions({ projectId, user, signUpArgs })
          : await this.getCompleteRegistrationUsingTheInvitationLinkOptions({
              projectId,
              user,
              signUpArgs,
            });

      if (this.ssoConfiguration.sendNotification) {
        const result = await this.ssoConfiguration.sendNotification(
          sendNotificationOptions
        );
        if (!result || this.ssoStaticEnvironments.disableEmailVerification) {
          user = await this.prismaClient.ssoUser.update({
            include: { SsoProject: true },
            data: {
              emailVerifiedAt: new Date(),
            },
            where: { id: user.id, projectId },
          });
          await this.ssoCacheService.clearCacheByUserId({ userId: user.id });
        }
      } else {
        this.logger.debug({
          sendNotification: sendNotificationOptions,
        });
      }
    }

    return user;
  }

  private async getCompleteSignUpOptions({
    projectId,
    user,
    signUpArgs,
  }: {
    projectId: string;
    user: SsoUser;
    signUpArgs: SignUpArgs;
  }) {
    const project = await this.prismaClient.ssoProject.findFirst({
      where: { id: { equals: projectId } },
    });
    const { operationName, subject, text, html } =
      await this.getSendNotificationOptions(
        OperationName.VERIFY_EMAIL,
        projectId
      );

    const code = this.ssoConfiguration.twoFactorCodeGenerate
      ? await this.ssoConfiguration.twoFactorCodeGenerate({
          user,
          operationName: OperationName.VERIFY_EMAIL,
        })
      : 'undefined';

    const link = signUpArgs.redirectUri
      ? `${this.ssoStaticEnvironments.clientUrl}/complete-sign-up?code=${code}&redirect_uri=${signUpArgs.redirectUri}&client_id=${project?.clientId}`
      : `${this.ssoStaticEnvironments.clientUrl}/complete-sign-up?code=${code}&client_id=${project?.clientId}`;
    const sendNotificationOptions: SsoSendNotificationOptions = {
      recipientUsers: [user],
      subject: this.translatesAsyncLocalStorageContext.get().translate(subject),
      text: this.translatesAsyncLocalStorageContext.get().translate(text),
      html: this.translatesAsyncLocalStorageContext.get().translate(html, {
        link,
      }),
      operationName,
      projectId,
    };
    return sendNotificationOptions;
  }

  private async getCompleteRegistrationUsingTheInvitationLinkOptions({
    projectId,
    user,
    signUpArgs,
  }: {
    projectId: string;
    user: SsoUser;
    signUpArgs: SignUpArgs;
  }) {
    const project = await this.prismaClient.ssoProject.findFirst({
      where: { id: { equals: projectId } },
    });
    const { operationName, subject, text, html } =
      await this.getSendNotificationOptions(
        OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK,
        projectId
      );

    const code = this.ssoConfiguration.twoFactorCodeGenerate
      ? await this.ssoConfiguration.twoFactorCodeGenerate({
          user,
          operationName:
            OperationName.COMPLETE_REGISTRATION_USING_THE_INVITATION_LINK,
        })
      : 'undefined';

    const link = signUpArgs.redirectUri
      ? `${this.ssoStaticEnvironments.clientUrl}/complete-invite?code=${code}&redirect_uri=${signUpArgs.redirectUri}&client_id=${project?.clientId}`
      : `${this.ssoStaticEnvironments.clientUrl}/complete-invite?code=${code}&client_id=${project?.clientId}`;
    const sendNotificationOptions: SsoSendNotificationOptions = {
      recipientUsers: [user],
      subject: this.translatesAsyncLocalStorageContext.get().translate(subject),
      text: this.translatesAsyncLocalStorageContext.get().translate(text),
      html: this.translatesAsyncLocalStorageContext.get().translate(html, {
        link,
      }),
      operationName,
      projectId,
    };
    return sendNotificationOptions;
  }

  private async getSendNotificationOptions(
    operationName: OperationName,
    projectId: string
  ) {
    const defaultLocale =
      this.translatesAsyncLocalStorageContext.get().config?.defaultLocale ||
      'en';
    const locale =
      this.translatesAsyncLocalStorageContext.get().locale || defaultLocale;

    const template = await this.ssoTemplatesService.getEmailTemplate({
      operationName,
      projectId,
    });
    const defaultTemplate = DEFAULT_EMAIL_TEMPLATE_BY_NAMES[operationName];

    const subject =
      (locale === defaultLocale
        ? template?.subject
        : (template?.subjectLocale as any)?.[locale]) ||
      defaultTemplate.subject;

    const text =
      (locale === defaultLocale
        ? template?.text
        : (template?.textLocale as any)?.[locale]) || defaultTemplate.text;
    const html =
      (locale === defaultLocale
        ? template?.html
        : (template?.htmlLocale as any)?.[locale]) || defaultTemplate.html;
    return { operationName, subject, text, html };
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
          operationName: OperationName.VERIFY_EMAIL,
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

    await this.ssoCacheService.clearCacheByUserId({
      userId: twoFactorCodeValidateResult.userId,
    });

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
    const project = await this.prismaClient.ssoProject.findFirst({
      where: { id: { equals: projectId } },
    });
    const user = await this.ssoUsersService.getByEmail({
      email: forgotPasswordArgs.email,
      projectId,
    });
    if (this.ssoConfiguration.twoFactorCodeGenerate) {
      const { operationName, subject, text, html } =
        await this.getSendNotificationOptions(
          OperationName.COMPLETE_FORGOT_PASSWORD,
          projectId
        );

      const code = await this.ssoConfiguration.twoFactorCodeGenerate({
        ...ssoRequest,
        user,
        operationName: OperationName.COMPLETE_FORGOT_PASSWORD,
      });

      const link = forgotPasswordArgs.redirectUri
        ? `${this.ssoStaticEnvironments.clientUrl}/complete-forgot-password?code=${code}&redirect_uri=${forgotPasswordArgs.redirectUri}&client_id=${project?.clientId}`
        : `${this.ssoStaticEnvironments.clientUrl}/complete-forgot-password?code=${code}&client_id=${project?.clientId}`;
      if (this.ssoConfiguration.sendNotification) {
        await this.ssoConfiguration.sendNotification({
          projectId,
          recipientUsers: [user],
          subject: this.translatesAsyncLocalStorageContext
            .get()
            .translate(subject),
          text: this.translatesAsyncLocalStorageContext.get().translate(text, {
            link,
          }),
          html: this.translatesAsyncLocalStorageContext.get().translate(html, {
            link,
          }),
          operationName,
        });
      }
    }
  }

  async completeForgotPassword({
    completeForgotPasswordArgs,
    projectId,
  }: {
    completeForgotPasswordArgs: CompleteForgotPasswordArgs;
    projectId: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fingerprint, confirmPassword, ...data } =
      completeForgotPasswordArgs;
    if (this.ssoConfiguration.twoFactorCodeValidate) {
      const result = await this.ssoConfiguration.twoFactorCodeValidate({
        code: completeForgotPasswordArgs.code,
        projectId,
        operationName: OperationName.COMPLETE_FORGOT_PASSWORD,
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
      | 'birthdate'
      | 'firstname'
      | 'lastname'
      | 'id'
      | 'picture'
      | 'gender'
      | 'lang'
      | 'timezone'
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
