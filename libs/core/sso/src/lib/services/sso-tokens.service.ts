import { PrismaToolsService } from '@nestjs-mod-sso/prisma-tools';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, SsoRefreshSession, SsoUser } from '@prisma/sso-client';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { randomUUID } from 'node:crypto';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoError, SsoErrorEnum } from '../sso.errors';
import { SsoAccessTokenData } from '../types/sso-request';

@Injectable()
export class SsoTokensService {
  private logger = new Logger(SsoTokensService.name);

  constructor(
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly jwtService: JwtService,
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly prismaToolsService: PrismaToolsService
  ) {}

  async getAccessAndRefreshTokensByRefreshToken({
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
    const expiresAt = addMilliseconds(
      new Date(),
      ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn)
    );
    let currentRefreshSession: SsoRefreshSession & { SsoUser: SsoUser };
    try {
      currentRefreshSession =
        await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
          include: { SsoUser: true },
          where: { fingerprint, refreshToken, projectId, enabled: true },
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (this.prismaToolsService.isErrorOfRecordNotFound(err)) {
        this.logger.debug({
          fingerprint,
          refreshToken,
          projectId,
          enabled: true,
        });
        throw new SsoError(SsoErrorEnum.RefreshTokenNotProvided);
      }
      this.logger.error(err, err.stack);
      throw err;
    }
    try {
      await this.prismaClient.ssoRefreshSession.updateMany({
        data: { enabled: false },
        where: { fingerprint, refreshToken, projectId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
    await this.verifyRefreshSession({
      oldRefreshSession: currentRefreshSession,
      newFingerprint: fingerprint,
      newIp: userIp,
    });

    const session = await this.prismaClient.ssoRefreshSession.create({
      include: { SsoUser: true },
      data: {
        refreshToken: randomUUID(),
        userId: currentRefreshSession.userId,
        userIp,
        userAgent,
        fingerprint,
        expiresAt,
        projectId,
        enabled: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = this.jwtService.sign(
      {
        userId: session.userId,
        ...(currentRefreshSession.SsoUser.roles
          ? { roles: currentRefreshSession.SsoUser.roles }
          : {}),
      },
      {
        expiresIn: this.ssoStaticEnvironments.jwtAccessTokenExpiresIn,
        secret: this.ssoStaticEnvironments.jwtSecretKey,
      }
    );

    return {
      accessToken,
      refreshToken: session.refreshToken,
      user: session.SsoUser,
    };
  }

  async verifyRefreshSession({
    oldRefreshSession,
    newFingerprint,
    newIp,
  }: {
    oldRefreshSession: SsoRefreshSession;
    newFingerprint?: string;
    newIp?: string;
  }) {
    const nowTime = new Date();

    if (!oldRefreshSession.expiresAt || nowTime > oldRefreshSession.expiresAt) {
      this.logger.debug({
        nowTime,
        oldRefreshSession,
      });
      throw new SsoError(SsoErrorEnum.SessionExpired);
    }
    if (newFingerprint && newIp) {
      if (
        oldRefreshSession.userIp !== newIp ||
        oldRefreshSession.fingerprint !== newFingerprint
      ) {
        this.logger.debug({ oldRefreshSession, newFingerprint, newIp });
        throw new SsoError(SsoErrorEnum.InvalidRefreshSession);
      }
    }
  }

  async getAccessAndRefreshTokensByUserId(
    {
      userId,
      userIp,
      userAgent,
      fingerprint,
      roles,
    }: {
      userId: string;
      userIp: string;
      userAgent: string;
      fingerprint: string;
      roles: string | null;
    },
    projectId: string
  ) {
    const expiresAt = addMilliseconds(
      new Date(),
      ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn)
    );
    try {
      await this.prismaClient.ssoRefreshSession.updateMany({
        data: {
          enabled: false,
        },
        where: {
          userId,
          fingerprint,
          projectId,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err, err.stack);
    }
    const session = await this.prismaClient.ssoRefreshSession.create({
      data: {
        refreshToken: randomUUID(),
        userId,
        userIp,
        userAgent,
        fingerprint,
        expiresAt,
        projectId,
        enabled: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userData: { roles } as any,
      },
    });
    return {
      accessToken: this.jwtService.sign(
        { userId, ...(roles ? { roles } : {}) },
        {
          expiresIn: this.ssoStaticEnvironments.jwtAccessTokenExpiresIn,
          secret: this.ssoStaticEnvironments.jwtSecretKey,
        }
      ),
      refreshToken: session.refreshToken,
    };
  }

  async disableRefreshSessionByRefreshToken({
    refreshToken,
    projectId,
  }: {
    refreshToken: string;
    projectId: string;
  }) {
    try {
      const refreshSession =
        await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
          where: { refreshToken, projectId, enabled: true },
        });

      await this.verifyRefreshSession({
        oldRefreshSession: refreshSession,
      });

      this.prismaClient.ssoRefreshSession.updateMany({
        data: { enabled: false },
        where: { refreshToken, projectId },
      });
      return refreshSession;
    } catch (err) {
      this.logger.debug({ refreshToken, projectId });
      throw new SsoError(SsoErrorEnum.RefreshTokenNotProvided);
    }
  }

  async verifyAndDecodeAccessToken(accessToken: string | undefined) {
    if (accessToken === 'undefined') {
      accessToken = undefined;
    }
    try {
      return accessToken
        ? await this.jwtService.verifyAsync<SsoAccessTokenData>(accessToken, {
            secret: this.ssoStaticEnvironments.jwtSecretKey,
          })
        : undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message.includes('jwt expired')) {
        throw new SsoError(SsoErrorEnum.AccessTokenExpired);
      }
      this.logger.error(err, err.stack);
      throw new SsoError(SsoErrorEnum.BadAccessToken);
    }
  }
}
