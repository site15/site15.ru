/**
 * Prisma client для worker-скриптов (sync-stats, refresh-video-stats).
 *
 * Воркер не поднимает NestJS DI-контейнер, поэтому PrismaModule со своим
 * `prismaClientFactory` (apps/server/src/infrastructure.module.ts) ему недоступен,
 * и клиент приходится собирать вручную.
 *
 * Схемы проекта сгенерированы с `previewFeatures = ["queryCompiler", "driverAdapters"]`,
 * то есть это клиент без engine'а: голой `new PrismaClient()` бросает
 * P2038 «Missing configured driver adapter» и падало НЕМЕДЛЕННО — фоновое
 * обновление статистики лендинга не доходило до площадок вообще, из-за чего
 * у свежедобавленного видео счётчики по всем платформам оставались нулевыми.
 * Отсюда обязательный адаптер PrismaPg — тот же, что у основного приложения.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { MetricsPrismaSdk } from '@site15/metrics';

/**
 * Имена переменных, из которых берётся URL БД метрик: первая непустая выигрывает.
 * `SITE_15_METRICS_DATABASE_URL` — имя из datasource'а schema.prisma, остальные —
 * страховка для окружений, где переменную назвали короче.
 */
const DATABASE_URL_ENV_KEYS = ['SITE_15_METRICS_DATABASE_URL', 'METRICS_DATABASE_URL', 'DATABASE_URL'];

export function metricsDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const envKey = DATABASE_URL_ENV_KEYS.find((key) => !!env[key]?.trim());
  if (!envKey) {
    throw new Error(`Worker: не задан URL БД метрик, ожидается один из ${DATABASE_URL_ENV_KEYS.join(' / ')}`);
  }
  return env[envKey]!.trim();
}

export function createMetricsPrismaClient(): MetricsPrismaSdk.PrismaClient {
  // connectionTimeoutMillis — тот же страховочный лимит, что у основного
  // приложения (infrastructure.module.ts): воркер переживает недоступную БД как
  // ошибку в логе, а не как вечный await, из-за которого следующий прогон
  // вообще не стартует.
  const adapter = new PrismaPg({ connectionString: metricsDatabaseUrl(), connectionTimeoutMillis: 5000 });
  return new MetricsPrismaSdk.PrismaClient({ adapter });
}
