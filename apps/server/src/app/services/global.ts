import { MetricsPrismaSdk } from '@site15/metrics';
import { AppEnvironments } from '../app.environments';

export let globalPrismaClient: MetricsPrismaSdk.PrismaClient;
export let globalAppEnvironments: AppEnvironments;

export function setPrismaClient(prismaClient: MetricsPrismaSdk.PrismaClient) {
  globalPrismaClient = prismaClient;
}

export function setAppEnvironments(appEnvironments: AppEnvironments) {
  globalAppEnvironments = appEnvironments;
}
