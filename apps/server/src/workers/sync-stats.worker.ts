/**
 * Worker script для выполнения syncAllStats() в отдельном процессе.
 * Запускается через child_process.fork() из MetricsDynamicService.
 * Не блокирует event loop основного приложения.
 */

import { MetricsPrismaSdk } from '@site15/metrics';
import { setPrismaClient, setAppEnvironments } from '../app/services/global';
import { syncAllStats } from '../app/services/update-all-stats';
import { AppEnvironments } from '../app/app.environments';
import { isWritableMetricValue } from '../app/services/metric-value.utils';

async function bootstrap() {
  try {
    // Создаём Prisma client
    const prismaClient = new MetricsPrismaSdk.PrismaClient();
    setPrismaClient(prismaClient);

    // Загружаем env variables (они уже в process.env)
    const appEnvironments: AppEnvironments = {
      githubToken: process.env.SITE_15_GITHUB_TOKEN,
      devtoApiKey: process.env.SITE_15_DEVTO_API_KEY,
      youtubeApiKey: process.env.SITE_15_YOUTUBE_API_KEY,
      youtubeChannelId: process.env.SITE_15_YOUTUBE_CHANNEL_ID,
      httpProxyUrl: process.env.SITE_15_HTTP_PROXY_URL,
      landingBotToken: process.env.SITE_15_LANDING_BOT_TOKEN,
      landingChatId: process.env.SITE_15_LANDING_CHAT_ID,
    };
    setAppEnvironments(appEnvironments);

    // Выполняем синхронизацию
    const allStats = await syncAllStats();
    if (!allStats) {
      console.log('syncAllStats returned null, skipping DB write');
      await prismaClient.$disconnect();
      process.exit(0);
      return;
    }

    // Конвертируем в метрики и записываем в БД (та же логика, что в MetricsDynamicService.syncAllStats)
    const metrics = convertAllStatsToMetricsDynamic(allStats);
    for (const metric of metrics) {
      const key = {
        level1: metric.level1 || '',
        level2: metric.level2 || '',
        level3: metric.level3 || '',
      };
      const current = await prismaClient.metricsDynamic.findUnique({
        where: { level1_level2_level3: key },
        select: { value: true },
      });
      if (!isWritableMetricValue(current?.value ?? null, metric.value)) {
        console.log(`Skipping "${key.level1}|${key.level2}|${key.level3}": ${current?.value} → ${metric.value} (looks like a failure)`);
        continue;
      }
      await prismaClient.metricsDynamic.upsert({
        create: { ...key, value: metric.value },
        update: { value: metric.value },
        where: { level1_level2_level3: key },
      });
      const old = await prismaClient.metricsDynamicHistory.findFirst({
        where: key,
        orderBy: { createdAt: 'desc' },
        select: { value: true },
      });
      if (!old || old?.value !== metric.value) {
        await prismaClient.metricsDynamicHistory.create({
          data: { ...key, value: metric.value },
        });
      }
    }

    await prismaClient.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Worker failed:', error);
    process.exit(1);
  }
}

// Та же функция, что в MetricsDynamicService (дублирование, чтобы не импортировать сервис)
function convertAllStatsToMetricsDynamic(allStats: any): any[] {
  if (!allStats) return [];
  const result: any[] = [];
  const pushMetric = (level1: string, level2: string | null, level3: string | null, value: unknown) => {
    result.push({
      level1,
      level2,
      level3,
      value: value === null || value === undefined ? null : String(value),
    });
  };
  for (const [level1Key, level1Value] of Object.entries(allStats)) {
    if (Array.isArray(level1Value)) {
      for (const item of level1Value) {
        const level2 = item.id;
        for (const [field, val] of Object.entries(item.data)) {
          pushMetric(level1Key, level2, field, val);
        }
      }
      continue;
    }
    if (typeof level1Value === 'object' && level1Value !== null) {
      for (const [level2Key, level2Value] of Object.entries(level1Value)) {
        if (typeof level2Value === 'object' && level2Value !== null) {
          for (const [field, val] of Object.entries(level2Value)) {
            pushMetric(level1Key, level2Key, field, val);
          }
        } else {
          pushMetric(level1Key, null, level2Key, level2Value);
        }
      }
      continue;
    }
    pushMetric(level1Key, null, null, level1Value);
  }
  return result;
}

bootstrap();
