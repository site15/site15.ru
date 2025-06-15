import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { SsoRefreshSession } from '../generated/prisma-client';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoTokensService } from './sso-tokens.service';

@Injectable()
export class SsoCookieService {
  constructor(
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly ssoTokensService: SsoTokensService,
  ) {}

  async getCookieWithJwtToken({
    userId,
    userIp,
    userAgent,
    fingerprint,
    roles,
    projectId,
  }: {
    userId: string;
    userIp: string;
    userAgent: string;
    fingerprint: string;
    roles: string | null;
    projectId: string;
  }) {
    const tokens = await this.ssoTokensService.getAccessAndRefreshTokensByUserId(
      {
        fingerprint,
        roles,
        userAgent,
        userId,
        userIp,
      },
      projectId,
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      cookie: this.getCookie({
        name: 'refreshToken',
        value: tokens.refreshToken,
        options: {
          ['max-age']: Math.round(ms(this.ssoStaticEnvironments.jwtRefreshTokenExpiresIn) / 1000),
          // domain,
          path: '/',
          httponly: true,
          signed: true,
          sameSite: true,
        },
      }),
    };
  }

  getCookie({
    name,
    value,
    options,
  }: {
    name: string;
    value: string;
    options: {
      ['max-age']: number;
      // domain,
      path: string;
      httponly: boolean;
      signed: boolean;
      sameSite: boolean;
    };
  }): string {
    return `${name}=${value}; ${Object.keys(options)
      .map((key) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (options as any)[key] === 'boolean'
          ? key
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            `${key}=${(options as any)[key]}`,
      )
      .join('; ')}`;
  }

  async getCookieForSignOut({ refreshToken, projectId }: { refreshToken: string; projectId: string }): Promise<{
    refreshSession: SsoRefreshSession | null;
    cookie: string;
  }> {
    const refreshSession = await this.ssoTokensService.disableRefreshSessionByRefreshToken({
      refreshToken,
      projectId,
    });
    return {
      refreshSession,
      cookie: this.getCookie({
        name: 'refreshToken',
        value: '',
        options: {
          ['max-age']: 0,
          // domain,
          path: '/',
          httponly: true,
          signed: true,
          sameSite: true,
        },
      }),
    };
  }
}
