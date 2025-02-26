import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, SsoRefreshSession, SsoUser } from '@prisma/sso-client';
import ms from 'ms';
import { TranslatesAsyncLocalStorageContext } from 'nestjs-translates';
import { randomUUID } from 'node:crypto';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { ChangePasswordArgs } from '../types/change-password.dto';
import {
  CompleteForgotPasswordArgs,
  ForgotPasswordArgs,
} from '../types/forgot-password.dto';
import { SignInArgs } from '../types/sign-in.dto';
import { SignUpArgs } from '../types/sign-up.dto';
import { SsoRequest } from '../types/sso-request';
import { SsoCookieService } from './sso-cookie.service';
import { SsoMailService } from './sso-mail.service';
import { SsoTwoFactorService } from './sso-two-factor.service';
import { SsoUsersService } from './sso-users.service';

@Injectable()
export class SsoService {
  private logger = new Logger(SsoService.name);

  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoUsersService: SsoUsersService,
    private readonly jwtService: JwtService,
    private readonly ssoCookieService: SsoCookieService,
    private readonly ssoMailService: SsoMailService,
    private readonly translatesAsyncLocalStorageContext: TranslatesAsyncLocalStorageContext,
    private readonly ssoTwoFactorService: SsoTwoFactorService,
    private readonly prismaToolsService: PrismaToolsService
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
        emailVerifiedAt: null,
      },
      projectId,
    });

    const code = await this.ssoTwoFactorService.generate({ user });

    await this.ssoMailService.sendMail({
      to: user.email,
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
    });
    return user;
  }

  async completeSignUp({
    code,
    projectId,
  }: {
    code: string;
    projectId: string;
  }) {
    const result = await this.ssoTwoFactorService.validateOnlyTwoFactorCode(
      code
    );
    return await this.prismaClient.ssoUser.update({
      where: { id: result.user.id, projectId },
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

    const code = await this.ssoTwoFactorService.generate({
      ...ssoRequest,
      user,
    });

    await this.ssoMailService.sendMail({
      to: user.email,
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
    });
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
    const result = await this.ssoTwoFactorService.validateOnlyTwoFactorCode(
      code
    );
    return this.ssoUsersService.changePassword({
      id: result.user.id,
      password: data.password,
      projectId,
    });
  }

  async verifyRefreshSession({
    oldRefreshSession,
    newFingerprint,
    newIp,
  }: {
    oldRefreshSession: SsoRefreshSession;
    newFingerprint: string;
    newIp: string;
  }) {
    const nowTime = new Date().getTime();

    if (!oldRefreshSession.expiresIn || nowTime > oldRefreshSession.expiresIn) {
      throw new SsoError(SsoErrorEnum.SessionExpired);
    }
    if (
      oldRefreshSession.userIp !== newIp ||
      oldRefreshSession.fingerprint !== newFingerprint
    ) {
      this.logger.debug({ oldRefreshSession, newFingerprint, newIp });
      throw new SsoError(SsoErrorEnum.InvalidRefreshSession);
    }
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
    const refTokenExpiresInMilliseconds =
      new Date().getTime() +
      ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn);

    let currentRefreshSession: SsoRefreshSession;
    try {
      currentRefreshSession =
        await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
          where: { refreshToken, projectId },
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        throw new SsoError(SsoErrorEnum.RefreshTokenNotProvided);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
    try {
      await this.prismaClient.ssoRefreshSession.deleteMany({
        where: { refreshToken, projectId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      //
    }
    await this.verifyRefreshSession({
      oldRefreshSession: currentRefreshSession,
      newFingerprint: fingerprint,
      newIp: userIp,
    });

    const session = await this.prismaClient.ssoRefreshSession.create({
      data: {
        refreshToken: randomUUID(),
        userId: currentRefreshSession.userId,
        userIp,
        userAgent,
        fingerprint,
        expiresIn: refTokenExpiresInMilliseconds,
        projectId,
      },
    });

    const accessToken = this.jwtService.sign(
      { userId: session.userId },
      {
        expiresIn: this.ssoStaticEnvironments.jwtAccessTokenExpiresIn,
        secret: this.ssoStaticEnvironments.jwtSecretKey,
      }
    );

    const cookie = this.ssoCookieService.getCookie({
      name: 'refreshToken',
      value: session.refreshToken,
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
      accessToken,
      refreshToken: session.refreshToken,
      cookie,
    };
  }
}
