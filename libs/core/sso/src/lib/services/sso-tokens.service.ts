import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/sso-client';
import ms from 'ms';
import { randomUUID } from 'node:crypto';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoAccessTokenData } from '../types/sso-request';

@Injectable()
export class SsoTokensService {
  constructor(
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly jwtService: JwtService,
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient
  ) {}

  async getAccessAndRefreshTokens(
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
    const refTokenExpiresInMilliseconds =
      new Date().getTime() +
      ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn);
    const session = await this.prismaClient.ssoRefreshSession.create({
      data: {
        refreshToken: randomUUID(),
        userId,
        userIp,
        userAgent,
        fingerprint,
        expiresIn: refTokenExpiresInMilliseconds,
        projectId,
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

  async deleteRefreshSessionByRefreshToken({
    refreshToken,
    projectId,
  }: {
    refreshToken: string;
    projectId: string;
  }) {
    const refreshSession =
      await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
        where: { refreshToken, projectId },
      });
    this.prismaClient.ssoRefreshSession.deleteMany({
      where: { refreshToken, projectId },
    });
    return refreshSession;
  }

  async verifyAndDecodeAccessToken(accessToken: string | undefined) {
    if (accessToken === 'undefined') {
      accessToken = undefined;
    }
    return accessToken
      ? await this.jwtService.verifyAsync<SsoAccessTokenData>(accessToken, {
          secret: this.ssoStaticEnvironments.jwtSecretKey,
        })
      : undefined;
  }
}
