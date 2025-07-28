import { KeyvService } from '@nestjs-mod/keyv';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { SsoRefreshSession, SsoTenant, SsoUser } from '../generated/prisma-client';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';
import { SsoPrismaSdk } from '../sso.prisma-sdk';

@Injectable()
export class SsoCacheService {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: SsoPrismaSdk.PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly keyvService: KeyvService,
  ) {}

  async clearCacheByUserId({ userId }: { userId: string }) {
    await this.keyvService.delete(this.getUserCacheKey({ userId }));
  }

  async getCachedUser({ userId }: { userId: string }) {
    const cached = await this.keyvService.get<SsoUser>(this.getUserCacheKey({ userId }));
    if (cached) {
      return cached as SsoUser;
    }
    const user = await this.prismaClient.ssoUser.findFirst({
      where: {
        id: userId,
      },
    });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...cachedUser } = user;
      await this.keyvService.set(this.getUserCacheKey({ userId }), cachedUser, this.ssoStaticEnvironments.cacheTTL);
      return cachedUser;
    }
    return undefined;
  }

  private getUserCacheKey({ userId }: { userId: string }): string {
    return `ssoUser.${userId}`;
  }

  //

  async clearCacheTenantByClientId(clientId: string) {
    await this.keyvService.delete(this.getTenantCacheKey(clientId));
  }

  async getCachedTenant(clientId: string) {
    const cached = await this.keyvService.get<SsoTenant>(this.getTenantCacheKey(clientId));
    if (cached) {
      return cached as SsoTenant;
    }
    const tenant = await this.prismaClient.ssoTenant.findFirst({
      where: {
        clientId,
      },
    });
    if (tenant) {
      await this.keyvService.set(this.getTenantCacheKey(clientId), tenant, this.ssoStaticEnvironments.cacheTTL);
      return tenant;
    }
    return undefined;
  }

  private getTenantCacheKey(clientId: string): string {
    return `ssoTenant.${clientId}`;
  }
  //

  async clearCacheByRefreshSession(refreshToken: string) {
    await this.keyvService.delete(this.getRefreshSessionCacheKey(refreshToken));
  }

  async getCachedRefreshSession(refreshToken: string) {
    const cached = await this.keyvService.get<SsoRefreshSession>(this.getRefreshSessionCacheKey(refreshToken));
    if (cached) {
      return cached as SsoRefreshSession;
    }
    const refreshSession = await this.prismaClient.ssoRefreshSession.findFirst({
      where: {
        refreshToken,
      },
    });
    if (refreshSession) {
      await this.keyvService.set(
        this.getRefreshSessionCacheKey(refreshToken),
        refreshSession,
        this.ssoStaticEnvironments.cacheTTL,
      );
      return refreshSession;
    }
    return undefined;
  }

  private getRefreshSessionCacheKey(refreshToken: string): string {
    return `ssoRefreshSession.${refreshToken}`;
  }
}
