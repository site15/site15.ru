import { MetricsUser } from '../generated/prisma-client';

export type MetricsRequest = {
  metricsUser?: MetricsUser | null;
  externalUserId: string;
  externalTenantId: string;
  headers: Record<string, string>;
};
