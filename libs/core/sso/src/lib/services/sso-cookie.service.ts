import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/sso-client';
import ms from 'ms';
import { randomUUID } from 'node:crypto';
import { SsoRefreshSession } from '../generated/rest/dto/sso-refresh-session.entity';
import { SSO_FEATURE } from '../sso.constants';
import { SsoEnvironments } from '../sso.environments';

@Injectable()
export class SsoCookieService {
  constructor(
    private readonly ssoEnvironments: SsoEnvironments,
    private readonly jwtService: JwtService,
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient
  ) {}

  async getCookieWithJwtToken(
    userId: string,
    userIp: string,
    userAgent: string,
    fingerprint: string
  ) {
    const refTokenExpiresInMilliseconds =
      new Date().getTime() +
      ms(this.ssoEnvironments.ssoJwtRefreshTokenExpiresIn);
    const session = await this.prismaClient.ssoRefreshSession.create({
      data: {
        refreshToken: randomUUID(),
        userId,
        userIp,
        userAgent,
        fingerprint,
        expiresIn: refTokenExpiresInMilliseconds,
      },
    });
    return {
      accessToken: this.jwtService.sign(
        { userId },
        {
          expiresIn: this.ssoEnvironments.ssoJwtAccessTokenExpiresIn,
        }
      ),
      refreshToken: session.refreshToken,
      cookie: this.getCookie('refreshToken', session.refreshToken, {
        ['max-age']: Math.round(
          ms(this.ssoEnvironments.ssoJwtRefreshTokenExpiresIn) / 1000
        ),
        // domain,
        path: '/',
        httponly: true,
        signed: true,
        sameSite: true,
      }),
    };
  }

  getCookie(
    name: string,
    value: string,
    options: {
      ['max-age']: number;
      // domain,
      path: string;
      httponly: boolean;
      signed: boolean;
      sameSite: boolean;
    }
  ): string {
    return `${name}=${value}; ${Object.keys(options)
      .map((key) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (options as any)[key] === 'boolean'
          ? key
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${key}=${(options as any)[key]}`
      )
      .join('; ')}`;
  }

  async getCookieForSignOut(refreshToken: string): Promise<{
    refreshSession: SsoRefreshSession | null;
    cookie: string;
  }> {
    const refreshSession =
      await this.prismaClient.ssoRefreshSession.findFirstOrThrow({
        where: { refreshToken },
      });
    this.prismaClient.ssoRefreshSession.deleteMany({
      where: { refreshToken },
    });
    return {
      refreshSession,
      cookie: this.getCookie('refreshToken', '', {
        ['max-age']: 0,
        // domain,
        path: '/',
        httponly: true,
        signed: true,
        sameSite: true,
      }),
    };
  }
}
