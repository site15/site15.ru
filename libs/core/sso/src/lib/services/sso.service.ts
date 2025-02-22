import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/sso-client';
import ms from 'ms';
import { TranslatesService } from 'nestjs-translates';
import { randomUUID } from 'node:crypto';
import { SsoRefreshSession } from '../generated/rest/dto/sso-refresh-session.entity';
import { SsoUser } from '../generated/rest/dto/sso-user.entity';
import { SSO_FEATURE } from '../sso.constants';
import { SsoEnvironments } from '../sso.environments';
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
    private readonly ssoEnvironments: SsoEnvironments,
    private readonly ssoUsersService: SsoUsersService,
    private readonly jwtService: JwtService,
    private readonly ssoCookieService: SsoCookieService,
    private readonly ssoMailService: SsoMailService,
    private readonly translatesService: TranslatesService,
    private readonly ssoTwoFactorService: SsoTwoFactorService,
    private readonly prismaToolsService: PrismaToolsService
  ) {}

  signIn(signInArgs: SignInArgs, projectId: string) {
    return this.ssoUsersService.getByEmailAndPassword(
      signInArgs.email,
      signInArgs.password,
      projectId
    );
  }

  signUp(signUpArgs: SignUpArgs, projectId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fingerprint, rePassword, ...data } = signUpArgs;
    return this.ssoUsersService.create(
      {
        ...data,
        username: signUpArgs.username || '',
      },
      projectId
    );
  }

  changePassword(userId: string, changePasswordArgs: ChangePasswordArgs) {
    return this.ssoUsersService.changePassword({
      id: userId,
      password: changePasswordArgs.password,
    });
  }

  async forgotPassword(
    forgotPasswordArgs: ForgotPasswordArgs,
    projectId: string,
    ssoRequest: SsoRequest
  ) {
    const user = await this.ssoUsersService.getByEmail(
      forgotPasswordArgs.email,
      projectId
    );

    const code = this.ssoTwoFactorService.generate({ ...ssoRequest, user });

    if (!this.translatesService.translatesConfig) {
      throw new SsoError('translatesConfig not set ');
    }
    await this.ssoMailService.sendMail({
      to: user.email,
      subject: this.translatesService.translate(
        'Restore forgotten password link',
        this.translatesService.translatesConfig.requestLocaleDetector(
          ssoRequest
        )
      ),
      html: [
        this.translatesService.translate(
          'Please navigate by a <a href="{{{domain}}}/complete-forgot-password?code={{code}}">link</a> to set new password',
          this.translatesService.translatesConfig.requestLocaleDetector(
            ssoRequest
          ),
          {
            domain: this.ssoEnvironments.templatesVarDomain,
            code: code,
          }
        ),
      ].join('<br/>'),
    });
  }

  async completeForgotPassword(
    checkCode: string,
    completeForgotPasswordArgs: CompleteForgotPasswordArgs
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fingerprint, rePassword, ...data } = completeForgotPasswordArgs;
    const result = await this.ssoTwoFactorService.validateOnlyTwoFactorCode(
      checkCode
    );
    return this.ssoUsersService.changePassword({
      id: result.user.id,
      ...data,
    });
  }

  async verifyRefreshSession(
    oldRefreshSession: SsoRefreshSession,
    newFingerprint: string,
    newIp: string
  ) {
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

  update(
    user: Pick<
      SsoUser,
      | 'email'
      | 'birthdate'
      | 'firstname'
      | 'lastname'
      | 'id'
      | 'password'
      | 'picture'
      | 'username'
    >,
    projectId: string
  ) {
    return this.ssoUsersService.update(user, projectId);
  }

  async refreshTokens(
    refreshToken: string,
    userIp: string,
    userAgent: string,
    fingerprint: string
  ) {
    const refTokenExpiresInMilliseconds =
      new Date().getTime() + ms(this.ssoEnvironments.jwtRefreshTokenExpiresIn);

    let currentRefreshSession: SsoRefreshSession;
    try {
      currentRefreshSession =
        await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
          where: { refreshToken },
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
        where: { refreshToken },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      //
    }
    await this.verifyRefreshSession(currentRefreshSession, fingerprint, userIp);

    const session = await this.prismaClient.ssoRefreshSession.create({
      data: {
        refreshToken: randomUUID(),
        userId: currentRefreshSession.userId,
        userIp,
        userAgent,
        fingerprint,
        expiresIn: refTokenExpiresInMilliseconds,
      },
    });

    const accessToken = this.jwtService.sign(
      { userId: session.userId },
      {
        expiresIn: this.ssoEnvironments.jwtAccessTokenExpiresIn,
      }
    );

    const cookie = this.ssoCookieService.getCookie(
      'refreshToken',
      session.refreshToken,
      {
        ['max-age']: Math.round(
          ms(this.ssoEnvironments.jwtRefreshTokenExpiresIn) / 1000
        ),
        path: '/',
        httponly: true,
        signed: true,
        sameSite: true,
      }
    );
    return {
      accessToken,
      refreshToken: session.refreshToken,
      cookie,
    };
  }
}
