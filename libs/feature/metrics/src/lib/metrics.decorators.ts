import { getNestModuleDecorators, getRequestFromExecutionContext } from '@nestjs-mod/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MetricsRole } from './generated/prisma-client';
import { MetricsError, MetricsErrorEnum } from './metrics.errors';
import { METRICS_MODULE } from './metrics.constants';
import { MetricsRequest } from './types/MetricsRequest';

export const { InjectFeatures: InjectMETRICSFeatures } = getNestModuleDecorators({
  moduleName: METRICS_MODULE,
});

export const CheckMetricsRole = Reflector.createDecorator<MetricsRole[]>();

export const CurrentMetricsRequest = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as MetricsRequest;
  return req;
});

export const CurrentMetricsUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as MetricsRequest;
  return req.metricsUser;
});

export const CurrentMetricsExternalTenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = getRequestFromExecutionContext(ctx) as MetricsRequest;
  if (!req.externalTenantId && req.metricsUser?.userRole !== MetricsRole.Admin) {
    throw new MetricsError(MetricsErrorEnum.EXTERNAL_TENANT_ID_NOT_SET);
  }
  return req.externalTenantId;
});
