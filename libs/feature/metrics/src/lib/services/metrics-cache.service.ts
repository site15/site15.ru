import { KeyvService } from '@nestjs-mod/keyv';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable } from '@nestjs/common';
import { MetricsUser } from '../generated/prisma-client';
import { METRICS_FEATURE } from '../metrics.constants';
import { MetricsStaticEnvironments } from '../metrics.environments';
import { MetricsPrismaSdk } from '../metrics.prisma-sdk';

@Injectable()
export class MetricsCacheService {
  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: MetricsPrismaSdk.PrismaClient,
    private readonly metricsStaticEnvironments: MetricsStaticEnvironments,
    private readonly keyvService: KeyvService,
  ) {}

  async clearCacheByExternalUserId(externalUserId: string) {
    const metricsUsers = await this.prismaClient.metricsUser.findMany({
      where: { externalUserId },
    });
    for (const metricsUser of metricsUsers) {
      await this.keyvService.delete(this.getUserCacheKey(metricsUser));
    }
  }

  async getCachedUserByExternalUserId(externalUserId: string, tenantId?: string) {
    const cached = await this.keyvService.get<MetricsUser>(
      this.getUserCacheKey({
        externalUserId,
        tenantId,
      }),
    );
    if (cached) {
      return cached as MetricsUser;
    }
    const user = await this.prismaClient.metricsUser.findFirst({
      where: {
        externalUserId,
        ...(tenantId ? { tenantId } : {}),
      },
    });
    if (user) {
      await this.keyvService.set(
        this.getUserCacheKey({ tenantId, externalUserId }),
        user,
        this.metricsStaticEnvironments.cacheTTL,
      );
      return user;
    }
    return null;
  }

  private getUserCacheKey({
    tenantId,
    externalUserId,
  }: {
    tenantId: string | undefined;
    externalUserId: string;
  }): string {
    return `metricsUser.${tenantId}_${externalUserId}`;
  }
}
