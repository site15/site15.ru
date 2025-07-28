import { getRequestFromExecutionContext } from '@nestjs-mod/common';
import { searchIn } from '@nestjs-mod/misc';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isUUID } from 'class-validator';
import { MetricsRole } from './generated/prisma-client';
import { METRICS_FEATURE } from './metrics.constants';
import { CheckMetricsRole } from './metrics.decorators';
import { MetricsStaticEnvironments } from './metrics.environments';
import { MetricsError, MetricsErrorEnum } from './metrics.errors';
import { MetricsPrismaSdk } from './metrics.prisma-sdk';
import { MetricsCacheService } from './services/metrics-cache.service';
import { MetricsRequest } from './types/MetricsRequest';

@Injectable()
export class MetricsGuard implements CanActivate {
  private logger = new Logger(MetricsGuard.name);

  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: MetricsPrismaSdk.PrismaClient,
    private readonly reflector: Reflector,
    private readonly metricsStaticEnvironments: MetricsStaticEnvironments,
    private readonly metricsCacheService: MetricsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { checkMetricsRole } = this.getHandlersReflectMetadata(context);

      const req = this.getRequestFromExecutionContext(context);
      const externalUserId = this.getExternalUserIdFromRequest(req);
      const externalTenantId = this.getExternalTenantIdFromRequest(req);

      await this.tryGetOrCreateCurrentUserWithExternalUserId(req, externalTenantId, externalUserId);

      this.throwErrorIfCurrentUserNotSet(req);
      this.throwErrorIfCurrentUserNotHaveNeededRoles(checkMetricsRole, req);
    } catch (err) {
      this.throwAllGuardErrorsIfItNeeded(err);
    }
    return true;
  }

  private throwAllGuardErrorsIfItNeeded(err: unknown) {
    if (!this.metricsStaticEnvironments.skipGuardErrors) {
      throw err;
    } else {
      this.logger.error(err, (err as Error).stack);
    }
  }

  private throwErrorIfCurrentUserNotHaveNeededRoles(checkMetricsRole: MetricsRole[] | undefined, req: MetricsRequest) {
    if (checkMetricsRole && req.metricsUser && !searchIn(req.metricsUser.userRole, checkMetricsRole)) {
      throw new MetricsError(MetricsErrorEnum.FORBIDDEN);
    }
  }

  private throwErrorIfCurrentUserNotSet(req: MetricsRequest) {
    if (!req.metricsUser) {
      throw new MetricsError(MetricsErrorEnum.USER_NOT_FOUND);
    }
  }

  private async tryGetOrCreateCurrentUserWithExternalUserId(
    req: MetricsRequest,
    externalTenantId: string | undefined,
    externalUserId: string,
  ) {
    if (!req.metricsUser) {
      if (!externalTenantId || !isUUID(externalTenantId)) {
        throw new MetricsError(MetricsErrorEnum.FORBIDDEN);
      }
      if (this.metricsStaticEnvironments.autoCreateUser) {
        req.metricsUser = await this.metricsCacheService.getCachedUserByExternalUserId(
          externalUserId,
          externalTenantId,
        );

        if (!req.metricsUser) {
          await this.prismaClient.metricsUser.create({
            data: {
              tenantId: externalTenantId,
              externalUserId,
              userRole: MetricsRole.User,
            },
          });
        }
      }
      req.metricsUser = await this.metricsCacheService.getCachedUserByExternalUserId(externalUserId, externalTenantId);
    }
  }

  private getExternalTenantIdFromRequest(req: MetricsRequest) {
    return req.externalTenantId;
  }

  private getExternalUserIdFromRequest(req: MetricsRequest) {
    if (!req.externalUserId || !isUUID(req.externalUserId)) {
      throw new MetricsError(MetricsErrorEnum.FORBIDDEN);
    }
    return req.externalUserId;
  }

  private getRequestFromExecutionContext(context: ExecutionContext) {
    const req = getRequestFromExecutionContext(context) as MetricsRequest;
    req.headers = req.headers || {};
    return req;
  }

  private getHandlersReflectMetadata(context: ExecutionContext) {
    const checkMetricsRole =
      (typeof context.getHandler === 'function' && this.reflector.get(CheckMetricsRole, context.getHandler())) ||
      (typeof context.getClass === 'function' && this.reflector.get(CheckMetricsRole, context.getClass())) ||
      undefined;
    return { checkMetricsRole };
  }
}
