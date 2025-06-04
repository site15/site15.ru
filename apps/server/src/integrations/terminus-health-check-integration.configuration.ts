import { TWO_FACTOR_FEATURE, TwoFactorPrismaSdk } from '@nestjs-mod/two-factor';

import {
  NOTIFICATIONS_FEATURE,
  NotificationsPrismaSdk,
} from '@nestjs-mod/notifications';
import { SSO_FEATURE, SsoPrismaSdk } from '@nestjs-mod-sso/sso';
import { WEBHOOK_FEATURE, WebhookPrismaSdk } from '@nestjs-mod/webhook';
import { InjectPrismaClient, PrismaModule } from '@nestjs-mod/prisma';
import {
  TERMINUS_MODULE_NAME,
  TerminusHealthCheckConfiguration,
  TerminusHealthCheckModule,
} from '@nestjs-mod/terminus';
import { Injectable } from '@nestjs/common';
import { MemoryHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class TerminusHealthCheckIntegrationConfiguration
  implements TerminusHealthCheckConfiguration
{
  standardHealthIndicators = [
    /*
    {
      name: 'memory_heap',
      check: () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
    },
    {
      name: `database_${WEBHOOK_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${WEBHOOK_FEATURE}`,
          this.webhookPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${SSO_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${SSO_FEATURE}`,
          this.ssoPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${TWO_FACTOR_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${TWO_FACTOR_FEATURE}`,
          this.twoFactorPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${NOTIFICATIONS_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${NOTIFICATIONS_FEATURE}`,
          this.notificationsPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },*/
  ];

  constructor(
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly webhookPrismaClient: WebhookPrismaSdk.PrismaClient,
    @InjectPrismaClient(SSO_FEATURE)
    private readonly ssoPrismaClient: SsoPrismaSdk.PrismaClient,
    @InjectPrismaClient(TWO_FACTOR_FEATURE)
    private readonly twoFactorPrismaClient: TwoFactorPrismaSdk.PrismaClient,
    @InjectPrismaClient(NOTIFICATIONS_FEATURE)
    private readonly notificationsPrismaClient: NotificationsPrismaSdk.PrismaClient
  ) {}
}

export function terminusHealthCheckModuleForRootAsyncOptions(): Parameters<
  typeof TerminusHealthCheckModule.forRootAsync
>[0] {
  return {
    imports: [
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: WEBHOOK_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: SSO_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: TWO_FACTOR_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: NOTIFICATIONS_FEATURE,
      }),
    ],
    configurationClass: TerminusHealthCheckIntegrationConfiguration,
  };
}
