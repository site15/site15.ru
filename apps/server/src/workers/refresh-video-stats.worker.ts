/**
 * Worker script для выполнения refreshAll() в отдельном процессе.
 * Запускается через child_process.fork() из VideoStatsService.
 * Не блокирует event loop основного приложения.
 */

import { MetricsPrismaSdk } from '@site15/metrics';
import { setPrismaClient, setAppEnvironments } from '../app/services/global';
import { AppEnvironments } from '../app/app.environments';
import { VideoStatsService } from '../app/services/video-stats.service';

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

    // Создаём сервис и вызываем refreshAll()
    const videoStatsService = new VideoStatsService(prismaClient, appEnvironments);
    await videoStatsService.refreshAll();

    await prismaClient.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Worker failed:', error);
    process.exit(1);
  }
}

bootstrap();
