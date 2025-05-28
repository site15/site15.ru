import { KeyvService } from '@nestjs-mod/keyv';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  SsoProject,
  SsoRefreshSession,
  SsoUser,
} from '../generated/prisma-client';
import { SSO_FEATURE } from '../sso.constants';
import { SsoStaticEnvironments } from '../sso.environments';

@Injectable()
export class SsoCacheService {
  constructor(
    @InjectPrismaClient(SSO_FEATURE)
    private readonly prismaClient: PrismaClient,
    private readonly ssoStaticEnvironments: SsoStaticEnvironments,
    private readonly keyvService: KeyvService
  ) {}

  async clearCacheByUserId({ userId }: { userId: string }) {
    await this.keyvService.delete(this.getUserCacheKey({ userId }));
  }

  async getCachedUser({ userId }: { userId: string }) {
    const cached = await this.keyvService.get<SsoUser>(
      this.getUserCacheKey({ userId })
    );
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
      await this.keyvService.set(
        this.getUserCacheKey({ userId }),
        cachedUser,
        this.ssoStaticEnvironments.cacheTTL
      );
      return cachedUser;
    }
    return undefined;
  }

  private getUserCacheKey({ userId }: { userId: string }): string {
    return `ssoUser.${userId}`;
  }

  //

  async clearCacheProjectByClientId(clientId: string) {
    await this.keyvService.delete(this.getProjectCacheKey(clientId));
  }

  async getCachedProject(clientId: string) {
    const cached = await this.keyvService.get<SsoProject>(
      this.getProjectCacheKey(clientId)
    );
    if (cached) {
      return cached as SsoProject;
    }
    const project = await this.prismaClient.ssoProject.findFirst({
      where: {
        clientId,
      },
    });
    if (project) {
      await this.keyvService.set(
        this.getProjectCacheKey(clientId),
        project,
        this.ssoStaticEnvironments.cacheTTL
      );
      return project;
    }
    return undefined;
  }

  private getProjectCacheKey(clientId: string): string {
    return `ssoProject.${clientId}`;
  }
  //

  async clearCacheByRefreshSession(refreshToken: string) {
    await this.keyvService.delete(this.getRefreshSessionCacheKey(refreshToken));
  }

  async getCachedRefreshSession(refreshToken: string) {
    const cached = await this.keyvService.get<SsoRefreshSession>(
      this.getRefreshSessionCacheKey(refreshToken)
    );
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
        this.ssoStaticEnvironments.cacheTTL
      );
      return refreshSession;
    }
    return undefined;
  }

  private getRefreshSessionCacheKey(refreshToken: string): string {
    return `ssoRefreshSession.${refreshToken}`;
  }
}
