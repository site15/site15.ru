/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { METRICS_FEATURE, MetricsPrismaSdk } from '@site15/metrics';
import { fork } from 'child_process';
import { join } from 'path';

import { AppEnvironments } from '../app.environments';
import { customFetch } from './fetch-with-file-cache';
import { isWritableMetricValue } from './metric-value.utils';
import {
  LandingVideoDto,
  LandingVideosResponse,
  LandingVideoWithStatsDto,
  LandingVideoStatsResponse,
  VideoChannelStatsDto,
  LandingVideoShortDto,
} from './type';

export type VideoStatsProvider = 'youtube' | 'rutube' | 'vk';

/**
 * Сбор просмотров/лайков видео лендинга (YouTube / Rutube / VK Видео).
 *
 * Архитектура:
 *  - Шедулер (`refreshAll()`) периодически (раз в час) опрашивает внешние
 *    площадки и кладёт статистику в БД (metricsDynamic).
 *  - Фронтенд берёт данные только из БД (быстро, без внешних запросов).
 *  - Если данных нет в БД, возвращаем null — фронтенд покажет 0.
 *  - Каждое изменение пишется в metricsDynamicHistory — тренд по видео,
 *    ровно как по остальным метрикам проекта.
 *
 * Площадки не отдают статистику через CORS, поэтому за ними ходит сервер.
 */
@Injectable()
export class VideoStatsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VideoStatsService.name);

  private static readonly LEVEL1 = 'videoStats';
  /** Минимальный интервал обращения к площадке за одним видео. */
  private static readonly TTL_MS = 1000 * 60 * 60; // 1 час
  /** Пауза перед повтором после неудачной выборки. */
  private static readonly FAILURE_BACKOFF_MS = 1000 * 60 * 10; // 10 минут
  // Rutube/VK отдают 403/заглушку без «браузерного» User-Agent.
  private static readonly BROWSER_USER_AGENT =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

  private static readonly ID_PATTERNS: Record<VideoStatsProvider, RegExp> = {
    youtube: /^[A-Za-z0-9_-]{11}$/,
    rutube: /^[a-f0-9]{32}$/,
    vk: /^-?\d+_\d+$/,
  };

  /**
   * Конфигурация коротких видео (shorts/clips). Привязаны к основным видео
   * через parentYoutubeId, отображаются на странице соответствующего видео.
   */
  private static readonly SHORTS: LandingVideoShortDto[] = [
    // Shorts для Части 1 (1MSIm8Te-QY) - Создание проекта
    {
      youtubeId: 'uge9-rne5yE',
      rutubeId: '5068253edb9c65cf53252976550ff20b',
      vkId: '-241775994_456239020',
      title: 'Удалил — сразу коммить! Правило чистого git',
      ytHref: 'https://youtu.be/uge9-rne5yE',
      rutubeHref: 'https://rutube.ru/shorts/5068253edb9c65cf53252976550ff20b/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239020',
      parentYoutubeId: '1MSIm8Te-QY',
    },
    {
      youtubeId: 'KtyUYsKRrso',
      rutubeId: '59956604ad7bcb96b64f86a9740712c0',
      title: 'Сайт с телефона: туннель вместо домена',
      ytHref: 'https://youtu.be/KtyUYsKRrso',
      rutubeHref: 'https://rutube.ru/shorts/59956604ad7bcb96b64f86a9740712c0/',
      parentYoutubeId: '1MSIm8Te-QY',
    },
    {
      youtubeId: 'NIzUM18PIrg',
      rutubeId: '645bf76817d488211fbc7ae1dc1b19f7',
      title: 'Нейронка сама добавила MinIO в проект',
      ytHref: 'https://youtu.be/NIzUM18PIrg',
      rutubeHref: 'https://rutube.ru/shorts/645bf76817d488211fbc7ae1dc1b19f7/',
      parentYoutubeId: '1MSIm8Te-QY',
    },

    // Shorts для Части 2 (6pSWtGoyS6I) - Тестирование с AI и HeyAPI
    {
      youtubeId: 'sdDt4CV7PfA',
      rutubeId: '1578d5b5f12b45b54c3ab3701eafe665',
      vkId: '-241775994_456239037',
      title: 'Тест прошёл, но ничего не проверил: нейросеть имитировала e2e',
      ytHref: 'https://youtu.be/sdDt4CV7PfA',
      rutubeHref: 'https://rutube.ru/shorts/1578d5b5f12b45b54c3ab3701eafe665/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239037',
      parentYoutubeId: '6pSWtGoyS6I',
    },
    {
      youtubeId: '6e0Q87kVMFs',
      rutubeId: '378b05492b85a90d25b07f4f332844bf',
      vkId: '-241775994_456239034',
      title: 'Дешевые vs дорогие LLM — когда какой режим',
      ytHref: 'https://youtu.be/6e0Q87kVMFs',
      rutubeHref: 'https://rutube.ru/shorts/378b05492b85a90d25b07f4f332844bf/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239034',
      parentYoutubeId: '6pSWtGoyS6I',
    },
    {
      youtubeId: '4q6y9sfaP9M',
      rutubeId: '9e5c4d48ddb6e97a1f294e610692f428',
      title: 'Я код не писал — только делал ревью',
      ytHref: 'https://youtu.be/4q6y9sfaP9M',
      rutubeHref: 'https://rutube.ru/shorts/9e5c4d48ddb6e97a1f294e610692f428/',
      parentYoutubeId: '6pSWtGoyS6I',
    },
    {
      youtubeId: 'ZRShYa_jkXE',
      rutubeId: 'adb216e88e70c9a43a89311cd9017da2',
      vkId: '-241775994_456239019',
      title: 'Нейронка запомнила паттерн DTO на будущее',
      ytHref: 'https://youtu.be/ZRShYa_jkXE',
      rutubeHref: 'https://rutube.ru/shorts/adb216e88e70c9a43a89311cd9017da2/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239019',
      parentYoutubeId: '6pSWtGoyS6I',
    },

    // Shorts для Части 3 (-VUl5p5xe3I) - CI/CD, GitHub Actions, MCP
    {
      youtubeId: 'CM7eMTTzNag',
      rutubeId: '89342e10ac2be657a72d9e53aca80d2c',
      vkId: '-241775994_456239035',
      title: 'AI починил CI/CD ошибку — скопировал ошибку в чат',
      ytHref: 'https://youtu.be/CM7eMTTzNag',
      rutubeHref: 'https://rutube.ru/shorts/89342e10ac2be657a72d9e53aca80d2c/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239035',
      parentYoutubeId: '-VUl5p5xe3I',
    },
    {
      youtubeId: 'W4salkv1j_I',
      rutubeId: '99ee34d5668ec54fcaf7075c643948d1',
      vkId: '-241775994_456239040',
      title: 'MinIO не скачивается в CI: официальный образ заархивировали',
      ytHref: 'https://youtu.be/W4salkv1j_I',
      rutubeHref: 'https://rutube.ru/shorts/99ee34d5668ec54fcaf7075c643948d1/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239040',
      parentYoutubeId: '-VUl5p5xe3I',
    },
    {
      youtubeId: 'GW8O9oonuC8',
      rutubeId: '4ed1578f616c199f1da934980b6f94af',
      vkId: '-241775994_456239036',
      title: 'AI сделает документацию через Playwright MCP',
      ytHref: 'https://youtu.be/GW8O9oonuC8',
      rutubeHref: 'https://rutube.ru/shorts/4ed1578f616c199f1da934980b6f94af/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239036',
      parentYoutubeId: '-VUl5p5xe3I',
    },
    {
      youtubeId: '746NYNgrLLs',
      rutubeId: '9eca48f12aa16b3019f108f14cd62431',
      vkId: '-241775994_456239028',
      title: 'MCP для PostgreSQL — read-only пользователи',
      ytHref: 'https://youtu.be/746NYNgrLLs',
      rutubeHref: 'https://rutube.ru/shorts/9eca48f12aa16b3019f108f14cd62431/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239028',
      parentYoutubeId: '-VUl5p5xe3I',
    },
    {
      youtubeId: 'hyU8zjHFc28',
      rutubeId: '98fba0f6ded90fa503e855742d3c2a07',
      vkId: '-241775994_456239021',
      title: 'Сказал удалить контроллер — нейронка вычистила ВСЁ связанное',
      ytHref: 'https://youtu.be/hyU8zjHFc28',
      rutubeHref: 'https://rutube.ru/shorts/98fba0f6ded90fa503e855742d3c2a07/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239021',
      parentYoutubeId: '-VUl5p5xe3I',
    },

    // Shorts для Части 4 (ceL0qmeQe84) - Продакшн, PM2, e2e
    {
      youtubeId: '9jbmuedo5Qw',
      rutubeId: '27460495c7790e1e772b4ae19d60f8aa',
      vkId: '-241775994_456239042',
      title: 'Прогон e2e в GitHub Actions: инфраструктура поднялась, тесты зелёные',
      ytHref: 'https://youtu.be/9jbmuedo5Qw',
      rutubeHref: 'https://rutube.ru/shorts/27460495c7790e1e772b4ae19d60f8aa/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239042',
      parentYoutubeId: 'ceL0qmeQe84',
    },
    {
      youtubeId: 'fXoAUVxamfA',
      rutubeId: 'a6749f8f3f8746f522f7b104e2fc5e51',
      vkId: '-241775994_456239027',
      title: 'E2E тесты на реальном бэкенде без тест-сервера',
      ytHref: 'https://youtu.be/fXoAUVxamfA',
      rutubeHref: 'https://rutube.ru/shorts/a6749f8f3f8746f522f7b104e2fc5e51/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239027',
      parentYoutubeId: 'ceL0qmeQe84',
    },
  ];

  /**
   * Конфигурация видео лендинга. ID-шники площадок, ссылки, описания —
   * всё живёт здесь; фронтенд получает единым запросом вместе со статистикой.
   */
  private static readonly VIDEOS: LandingVideoDto[] = [
    {
      youtubeId: '1MSIm8Te-QY',
      rutubeId: '5f0217394026e166e7a224fc12f5c748',
      vkId: '-241775994_456239017',
      label: 'Часть 1 · Видео',
      shortTitle: 'Часть 1',
      techTags: 'NestJS · Angular · Prisma · PostgreSQL',
      title: 'Строим настоящий Fullstack-проект с AI — Часть 1: Создание проекта',
      description:
        'Создаём приложение на NestJS + Angular с Prisma и PostgreSQL, используя AI в Qoder IDE. Разбираем весь процесс: от архитектуры до production-развёртывания.',
      detailUrl: './videos/part-1.html',
      repoUrl: 'https://github.com/kaufman-bot/kaufman-bot',
      ytHref: 'https://youtu.be/1MSIm8Te-QY',
      rutubeHref: 'https://rutube.ru/video/5f0217394026e166e7a224fc12f5c748/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239017',
      shorts: VideoStatsService.SHORTS.filter((s) => s.parentYoutubeId === '1MSIm8Te-QY'),
    },
    {
      youtubeId: '6pSWtGoyS6I',
      rutubeId: 'c70facc53f796801d96b6850f360a618',
      vkId: '-241775994_456239022',
      label: 'Часть 2 · Видео',
      shortTitle: 'Часть 2',
      techTags: 'LLM · HeyAPI · E2E · Swagger',
      title: 'Строим Fullstack-проект с AI — Часть 2: Тестирование с AI и HeyAPI',
      description:
        'Продолжаем серию. Создаём тесты с помощью LLM, разбираем HeyAPI, E2E-тесты и постепенную генерацию кода с AI.',
      detailUrl: './videos/part-2.html',
      repoUrl: 'https://github.com/kaufman-bot/kaufman-bot',
      ytHref: 'https://youtu.be/6pSWtGoyS6I',
      rutubeHref: 'https://rutube.ru/video/c70facc53f796801d96b6850f360a618/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239022',
      shorts: VideoStatsService.SHORTS.filter((s) => s.parentYoutubeId === '6pSWtGoyS6I'),
    },
    {
      youtubeId: '-VUl5p5xe3I',
      rutubeId: '8af7bfb3b9e759ca6732dbc8011293d9',
      vkId: '-241775994_456239023',
      label: 'Часть 3 · Видео',
      shortTitle: 'Часть 3',
      techTags: 'GitHub Actions · CI/CD · MCP · Jest',
      title: 'Настраиваем CI/CD с AI | GitHub Actions, тесты, MCP и скилл онбординга — Fullstack с AI — Часть 3',
      description:
        'Настраиваем CI/CD на GitHub Actions: пайплайны для бэкенда и фронтенда, линты, форматирование, билды, юнит-тесты. Разбираем MCP для GitHub и отладку упавших пайплайнов, скилл онбординга коммитов.',
      detailUrl: './videos/part-3.html',
      repoUrl: 'https://github.com/kaufman-bot/kaufman-bot',
      ytHref: 'https://youtu.be/-VUl5p5xe3I',
      rutubeHref: 'https://rutube.ru/video/8af7bfb3b9e759ca6732dbc8011293d9/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239023',
      shorts: VideoStatsService.SHORTS.filter((s) => s.parentYoutubeId === '-VUl5p5xe3I'),
    },
    {
      youtubeId: 'ceL0qmeQe84',
      rutubeId: '70858b2775dffb17c2e9c203937788ea',
      vkId: '-241775994_456239038',
      label: 'Часть 4 · Видео',
      shortTitle: 'Часть 4',
      techTags: 'PM2 · Playwright · E2E · GitHub Actions',
      title: 'Запускаем прод с AI | start:prod, PM2, фронт внутри бэкенда и e2e — Fullstack с AI — Часть 4',
      description:
        'Доводим запуск продакшена: скрипт start:prod, PM2 и его логи, фронтенд внутри бэкенда через ServerStatic и e2e-тесты в GitHub Actions на двух ветках — бэкенда и фронтенда.',
      detailUrl: './videos/part-4.html',
      repoUrl: 'https://github.com/kaufman-bot/kaufman-bot',
      ytHref: 'https://youtu.be/ceL0qmeQe84',
      rutubeHref: 'https://rutube.ru/video/70858b2775dffb17c2e9c203937788ea/',
      vkHref: 'https://vkvideo.ru/video-241775994_456239038',
      shorts: VideoStatsService.SHORTS.filter((s) => s.parentYoutubeId === 'ceL0qmeQe84'),
    },
  ];

  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: MetricsPrismaSdk.PrismaClient,
    private readonly appEnvironments: AppEnvironments,
  ) {}

  onApplicationBootstrap() {
    if (isInfrastructureMode()) {
      return;
    }
    // Фоновое обновление видео-статистики вынесено в отдельный процесс (child_process.fork),
    // чтобы не блокировать event loop основного приложения внешними запросами
    // (YouTube, Rutube, VK). Worker script: apps/server/src/workers/refresh-video-stats.worker.ts
    if (this.appEnvironments.syncAllStatsByInterval) {
      // Первоначальное заполнение БД через worker
      setImmediate(() => this.spawnRefreshVideoStatsWorker());
      // Периодическое обновление через worker
      setInterval(() => this.spawnRefreshVideoStatsWorker(), VideoStatsService.TTL_MS);
    }
  }

  /**
   * Запускает refreshAll() в отдельном процессе через child_process.fork().
   * Это полностью изолирует event loop основного приложения от долгих внешних запросов.
   */
  private spawnRefreshVideoStatsWorker() {
    const workerPath = join(__dirname, 'workers', 'refresh-video-stats.worker.js');
    this.logger.log(`Spawning refresh-video-stats worker: ${workerPath}`);

    const worker = fork(workerPath, [], {
      env: process.env,
      stdio: 'inherit',
    });

    worker.on('exit', (code) => {
      if (code === 0) {
        this.logger.log('refresh-video-stats worker completed successfully');
      } else {
        this.logger.error(`refresh-video-stats worker exited with code ${code}`);
      }
    });

    worker.on('error', (error) => {
      this.logger.error(`refresh-video-stats worker error: ${error.message}`);
    });
  }

  async getStats(query: { yt?: string; rutube?: string; vk?: string }): Promise<LandingVideoStatsResponse> {
    const [youtube, rutube, vk] = await Promise.all([
      query.yt ? this.getForVideo('youtube', query.yt) : Promise.resolve(null),
      query.rutube ? this.getForVideo('rutube', query.rutube) : Promise.resolve(null),
      query.vk ? this.getForVideo('vk', query.vk) : Promise.resolve(null),
    ]);
    return { youtube, rutube, vk };
  }

  /**
   * Все видео лендинга из конфига + статистика по каждой площадке.
   * Один запрос вместо N вызовов video-stats — фронтенд получает
   * ссылки, описания и счётчики разом.
   */
  async getAllVideosWithStats(): Promise<LandingVideosResponse> {
    const videos: LandingVideoWithStatsDto[] = await Promise.all(
      VideoStatsService.VIDEOS.map(async (video) => {
        const [youtubeStats, rutubeStats, vkStats] = await Promise.all([
          video.youtubeId ? this.getForVideo('youtube', video.youtubeId) : Promise.resolve(null),
          video.rutubeId ? this.getForVideo('rutube', video.rutubeId) : Promise.resolve(null),
          video.vkId ? this.getForVideo('vk', video.vkId) : Promise.resolve(null),
        ]);

        // Получаем статистику для shorts (если есть)
        let shortsStats: Array<{
          youtubeStats?: VideoChannelStatsDto | null;
          rutubeStats?: VideoChannelStatsDto | null;
          vkStats?: VideoChannelStatsDto | null;
        }> | null = null;

        if (video.shorts && video.shorts.length > 0) {
          shortsStats = await Promise.all(
            video.shorts.map(async (short) => {
              const [ytStats, rtStats, vkStats] = await Promise.all([
                short.youtubeId ? this.getForVideo('youtube', short.youtubeId) : Promise.resolve(null),
                short.rutubeId ? this.getForVideo('rutube', short.rutubeId) : Promise.resolve(null),
                short.vkId ? this.getForVideo('vk', short.vkId) : Promise.resolve(null),
              ]);
              return { youtubeStats: ytStats, rutubeStats: rtStats, vkStats: vkStats };
            }),
          );
        }

        return { video, youtubeStats, rutubeStats, vkStats, shortsStats };
      }),
    );
    return { videos };
  }

  /**
   * Шедулер: перебирает все видео из конфига и обновляет их статистику
   * внешними запросами к площадкам. Вызывается по интервалу и при старте.
   */
  async refreshAll(): Promise<void> {
    // Обновляем статистику основных видео
    for (const video of VideoStatsService.VIDEOS) {
      if (video.youtubeId) {
        await this.fetchAndSave('youtube', video.youtubeId, `youtube:${video.youtubeId}`).catch((error) =>
          this.logger.warn(`refreshAll failed for youtube:${video.youtubeId}: ${String(error)}`),
        );
      }
      if (video.rutubeId) {
        await this.fetchAndSave('rutube', video.rutubeId, `rutube:${video.rutubeId}`).catch((error) =>
          this.logger.warn(`refreshAll failed for rutube:${video.rutubeId}: ${String(error)}`),
        );
      }
      if (video.vkId) {
        await this.fetchAndSave('vk', video.vkId, `vk:${video.vkId}`).catch((error) =>
          this.logger.warn(`refreshAll failed for vk:${video.vkId}: ${String(error)}`),
        );
      }
    }

    // Обновляем статистику shorts (один раз, т.к. shorts общие для всех видео)
    for (const short of VideoStatsService.SHORTS) {
      if (short.youtubeId) {
        await this.fetchAndSave('youtube', short.youtubeId, `youtube:${short.youtubeId}`).catch((error) =>
          this.logger.warn(`refreshAll failed for youtube short:${short.youtubeId}: ${String(error)}`),
        );
      }
      if (short.rutubeId) {
        await this.fetchAndSave('rutube', short.rutubeId, `rutube:${short.rutubeId}`).catch((error) =>
          this.logger.warn(`refreshAll failed for rutube short:${short.rutubeId}: ${String(error)}`),
        );
      }
      if (short.vkId) {
        await this.fetchAndSave('vk', short.vkId, `vk:${short.vkId}`).catch((error) =>
          this.logger.warn(`refreshAll failed for vk short:${short.vkId}: ${String(error)}`),
        );
      }
    }
  }

  private isProvider(value: string | undefined): value is VideoStatsProvider {
    return value === 'youtube' || value === 'rutube' || value === 'vk';
  }

  /**
   * Чтение статистики видео из БД. Внешние запросы НЕ делаются — только шедулер
   * (`refreshAll()`) периодически опрашивает площадки и обновляет БД.
   * Если данных нет в БД, возвращаем null — фронтенд покажет 0.
   */
  private async getForVideo(provider: VideoStatsProvider, videoId: string): Promise<VideoChannelStatsDto | null> {
    if (!VideoStatsService.ID_PATTERNS[provider].test(videoId)) {
      return null;
    }

    const key = `${provider}:${videoId}`;
    const stored = await this.readStored(key);

    if (!stored) {
      return null;
    }

    return this.toStats(stored);
  }

  private async fetchAndSave(
    provider: VideoStatsProvider,
    videoId: string,
    key: string,
  ): Promise<VideoChannelStatsDto | null> {
    try {
      const stats =
        provider === 'youtube'
          ? await this.fetchYouTubeStats(videoId)
          : provider === 'rutube'
            ? await this.fetchRutubeStats(videoId)
            : await this.fetchVkStats(videoId);
      if (!stats) {
        return null;
      }
      await this.save(key, stats);
      return stats;
    } catch (error) {
      this.logger.warn(`video-stats fetch failed for ${key}: ${String(error)}`);
      return null;
    }
  }

  private async readStored(
    key: string,
  ): Promise<{ views: string | null; likes: string | null; checkedAt: string | null } | null> {
    const rows = await this.prismaClient.metricsDynamic.findMany({
      where: { level1: VideoStatsService.LEVEL1, level2: key },
    });
    if (!rows.length) {
      return null;
    }
    const map: Record<string, string | null> = {};
    for (const row of rows) {
      if (row.level3) {
        map[row.level3] = row.value;
      }
    }
    return { views: map.views ?? null, likes: map.likes ?? null, checkedAt: map.checkedAt ?? null };
  }

  private toStats(stored: { views: string | null; likes: string | null }): VideoChannelStatsDto {
    return {
      views: stored.views !== null && stored.views !== '' ? Number(stored.views) : null,
      likes: stored.likes !== null && stored.likes !== '' ? Number(stored.likes) : null,
    };
  }

  /**
   * upsert в metricsDynamic + запись в metricsDynamicHistory при изменении —
   * та же схема, что у MetricsDynamicService.syncAllStats, поэтому видео
   * попадают в общий тренд метрик.
   */
  private async save(key: string, stats: VideoChannelStatsDto): Promise<void> {
    const fields: Array<[string, string | null]> = [
      ['views', stats.views === null || stats.views === undefined ? null : String(stats.views)],
      ['likes', stats.likes === null || stats.likes === undefined ? null : String(stats.likes)],
      ['checkedAt', String(Date.now())],
    ];

    for (const [level3, value] of fields) {
      const metricKey = {
        level1: VideoStatsService.LEVEL1,
        level2: key,
        level3,
      };

      // Просмотры/лайки, обнулённые сбоем площадки, не должны затирать
      // последнее достоверное значение и писать в историю ложное падение.
      if (level3 !== 'checkedAt') {
        const current = await this.prismaClient.metricsDynamic.findUnique({
          where: { level1_level2_level3: metricKey },
          select: { value: true },
        });
        if (!isWritableMetricValue(current?.value ?? null, value)) {
          this.logger.warn(`save: не пишу «${key}|${level3}»: ${current?.value} → ${value} похоже на сбой опроса`);
          continue;
        }
      }

      await this.prismaClient.metricsDynamic.upsert({
        create: {
          ...metricKey,
          value,
        },
        update: { value },
        where: { level1_level2_level3: metricKey },
      });

      // checkedAt — служебная метка свежести, в тренд её не пишем.
      if (level3 === 'checkedAt') {
        continue;
      }

      const old = await this.prismaClient.metricsDynamicHistory.findFirst({
        where: metricKey,
        orderBy: { createdAt: 'desc' },
        select: { value: true },
      });
      if (!old || old.value !== value) {
        await this.prismaClient.metricsDynamicHistory.create({
          data: {
            ...metricKey,
            value,
          },
        });
      }
    }
  }

  /* ---------------- выборка с площадок ---------------- */

  /**
   * YouTube, по убыванию надёжности: Data API v3 (точные просмотры + лайки,
   * googleapis.com достижим и без прокси, 1 unit квоты на видео) → публичный
   * RSS-фид канала (бесплатно, без ключа, точные просмотры, лайков нет) →
   * scraping watch-страницы. Последние два требуют доступного youtube.com
   * (в РФ — только через SITE_15_HTTP_PROXY_URL), причём сам прокси антибот-
   * заглушку watch-страницы не снимает, поэтому фид — основной бесплатный путь.
   */
  private async fetchYouTubeStats(videoId: string): Promise<VideoChannelStatsDto | null> {
    const apiKey = this.appEnvironments.youtubeApiKey;
    if (apiKey) {
      const viaApi = await this.fetchYouTubeStatsViaDataApi(videoId, apiKey);
      if (viaApi) {
        return viaApi;
      }
    }
    // Бесплатный путь без ключа: точные просмотры из публичного RSS-фида канала.
    const viaFeed = await this.fetchYouTubeStatsViaFeed(videoId);
    if (viaFeed) {
      return viaFeed;
    }
    return this.fetchYouTubeStatsViaHtml(videoId);
  }

  /**
   * Ключ передаётся заголовком x-goog-api-key, а не параметром URL: URL тут
   * ещё и ключ кэша, а текст axios-ошибки попадает в лог — в query-строке
   * ключ бы светился в обоих местах.
   */
  private async fetchYouTubeStatsViaDataApi(videoId: string, apiKey: string): Promise<VideoChannelStatsDto | null> {
    const response = await customFetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`,
      { headers: { 'x-goog-api-key': apiKey }, timeout: 15000 },
      true,
    );
    if (!response.ok) {
      this.logger.warn(`youtube stats: Data API HTTP ${response.status} for ${videoId}`);
      return null;
    }
    const data = await response.json();
    const statistics = data?.items?.[0]?.statistics;
    if (!statistics) {
      this.logger.warn(`youtube stats: Data API has no statistics for ${videoId} (wrong id or private video)`);
      return null;
    }
    return {
      views: statistics.viewCount !== undefined ? Number(statistics.viewCount) : null,
      // likes отсутствуют, если автор скрыл счётчик
      likes: statistics.likeCount !== undefined ? Number(statistics.likeCount) : null,
    };
  }

  /**
   * Публичный RSS-фид канала (`<media:statistics views="43"/>`): отдаётся даже
   * датацентровому IP без логина, тогда как watch-страница с прокси приходит с
   * playabilityStatus LOGIN_REQUIRED и без числовых счётчиков. Минусы: в фиде
   * нет лайков (только просмотры) и последние ~100 видео канала.
   */
  private async fetchYouTubeStatsViaFeed(videoId: string): Promise<VideoChannelStatsDto | null> {
    const channelId = this.appEnvironments.youtubeChannelId;
    if (!channelId || !/^UC[0-9A-Za-z_-]{22}$/.test(channelId)) {
      return null;
    }
    const response = await customFetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { 'User-Agent': VideoStatsService.BROWSER_USER_AGENT }, timeout: 15000 },
      true,
    );
    if (!response.ok) {
      this.logger.warn(`youtube stats: channel feed HTTP ${response.status} for ${channelId}`);
      return null;
    }
    const xml = await response.text();
    const entry = xml.split(/<entry[\s>]/).find((chunk) => chunk.includes(`<yt:videoId>${videoId}</yt:videoId>`));
    if (!entry) {
      this.logger.warn(`youtube stats: ${videoId} is not in the channel feed window`);
      return null;
    }
    const views = entry.match(/views="(\d+)"/)?.[1];
    if (!views) {
      this.logger.warn(`youtube stats: channel feed entry for ${videoId} has no views attribute`);
      return null;
    }
    return { views: Number(views), likes: null };
  }

  private async fetchYouTubeStatsViaHtml(videoId: string): Promise<VideoChannelStatsDto | null> {
    const response = await customFetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers: { 'User-Agent': VideoStatsService.BROWSER_USER_AGENT }, timeout: 15000 },
      true, // свой TTL (1 час) вместо общего кэша в 24 часа
    );
    if (!response.ok) {
      this.logger.warn(`youtube stats: HTTP ${response.status} for ${videoId}`);
      return null;
    }
    const html = await response.text();
    // Точные значения лежат в ytInitialPlayerResponse.videoDetails; с прокси
    // (датацентровый IP) YouTube их вырезает, остаётся локализованная строка.
    const views =
      html.match(/"viewCount":"(\d+)"/)?.[1] ??
      this.parseCountText(
        html.match(/"videoViewCountRenderer":\{"viewCount":\{"simpleText":"([^"]{1,40})"/)?.[1] ?? '',
      )?.toString();
    const likes = html.match(/"likeCount":"(\d+)"/)?.[1];
    if (!views && !likes) {
      // 200 без счётчиков = антибот-заглушка (LOGIN_REQUIRED). Нужен
      // SITE_15_YOUTUBE_API_KEY или SITE_15_YOUTUBE_CHANNEL_ID (RSS-фид).
      this.logger.warn(`youtube stats: counters not found in HTML for ${videoId} (${html.length} bytes)`);
      return null;
    }
    return { views: views ? Number(views) : null, likes: likes ? Number(likes) : null };
  }

  /**
   * Число из локализованной строки ("42 views" / "42 Aufrufe" / "42 просмотра").
   * Сокращённые формы ("1.2M", "42K", "1,2 млн") НЕ угадываем: вместо приблизительного
   * значения отдаём null, чтобы лендинг просто скрыл счётчик.
   */
  private parseCountText(text: string): number | null {
    const match = text.match(/^([\d.,\s\u00a0]+)(.*)$/u);
    if (!match) {
      return null;
    }
    const digits = match[1].replace(/[\s\u00a0]/g, '');
    const unit = match[2].trim().toLowerCase();
    // дробное число = сокращение (разделители группирования всегда по 3 цифры)
    if (/[.,]\d{1,2}$/.test(digits)) {
      return null;
    }
    // \b не подходит: он определён через ASCII-\w и не видит границу кириллического слова
    if (/^(mrd|mio|tsd|tys|tis|kys|thousand|million|billion|тысяч|тыс|тис|млн|млрд|k|m|b|t)(?![a-zа-яё])/i.test(unit)) {
      return null;
    }
    const value = digits.replace(/\D/g, '');
    return value ? Number(value) : null;
  }

  private async fetchRutubeStats(videoId: string): Promise<VideoChannelStatsDto | null> {
    const response = await customFetch(
      `https://rutube.ru/api/video/${videoId}/?format=json`,
      // proxy: false — площадка доступна напрямую, прокси (нужен только для
      // YouTube) уводит запрос на зарубежный IP.
      { headers: { 'User-Agent': VideoStatsService.BROWSER_USER_AGENT }, proxy: false, timeout: 15000 },
      true,
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    // Лайки Rutube доступны только под авторизацией (api/reactions — 401),
    // наружу отдаём только просмотры.
    return { views: typeof data.hits === 'number' ? data.hits : null, likes: null };
  }

  private async fetchVkStats(videoRef: string): Promise<VideoChannelStatsDto | null> {
    const [oid, id] = videoRef.split('_');
    const response = await customFetch(
      `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2`,
      { headers: { 'User-Agent': VideoStatsService.BROWSER_USER_AGENT }, proxy: false, timeout: 15000 },
      true,
    );
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const views = html.match(/"views":(\d+),"local_views"/)?.[1];
    const likes = html.match(/"likes":\{"count":(\d+)/)?.[1];
    if (!views && !likes) {
      return null;
    }
    return { views: views ? Number(views) : null, likes: likes ? Number(likes) : null };
  }
}
