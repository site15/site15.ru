/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { METRICS_FEATURE, MetricsPrismaSdk } from '@site15/metrics';

import { AppEnvironments } from '../app.environments';
import { customFetch } from './fetch-with-file-cache';
import { LandingVideoStatsResponse, VideoChannelStatsDto } from './type';

export type VideoStatsProvider = 'youtube' | 'rutube' | 'vk';

/**
 * Сбор просмотров/лайков видео лендинга (YouTube / Rutube / VK Видео).
 *
 * Площадки не отдают статистику через CORS, поэтому за ними ходит сервер.
 * Чтобы не словить бан за частые обращения:
 *  - значения лежат в metricsDynamic (level1='videoStats',
 *    level2='провайдер:idВидео', level3='views'|'likes') и перевыбираются
 *    не чаще VIDEO_STATS_TTL_MS (метка checkedAt);
 *  - каждое изменение пишется в metricsDynamicHistory — тренд по видео,
 *    ровно как по остальным метрикам проекта;
 *  - параллельные запросы к одному видео дедуплицируются (inflight),
 *    а после ошибки работает backoff, чтобы не долбить площадку на рефреше.
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

  private readonly inflight = new Map<string, Promise<VideoChannelStatsDto | null>>();
  private readonly lastFailureAt = new Map<string, number>();

  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: MetricsPrismaSdk.PrismaClient,
    private readonly appEnvironments: AppEnvironments,
  ) {}

  onApplicationBootstrap() {
    if (isInfrastructureMode()) {
      return;
    }
    // Фоновое обновление известных видео по часам — тренд пополняется даже
    // без заходов на лендинг. Тот же гей, что у syncAllStats.
    if (this.appEnvironments.syncAllStatsByInterval) {
      setInterval(() => this.refreshAll().then(), VideoStatsService.TTL_MS);
    }
  }

  async getStats(query: { yt?: string; rutube?: string; vk?: string }): Promise<LandingVideoStatsResponse> {
    const [youtube, rutube, vk] = await Promise.all([
      query.yt ? this.getForVideo('youtube', query.yt) : Promise.resolve(null),
      query.rutube ? this.getForVideo('rutube', query.rutube) : Promise.resolve(null),
      query.vk ? this.getForVideo('vk', query.vk) : Promise.resolve(null),
    ]);
    return { youtube, rutube, vk };
  }

  /** Перебирает все когда-либо запрошенные видео и обновляет их в обход TTL. */
  async refreshAll(): Promise<void> {
    const rows = await this.prismaClient.metricsDynamic.findMany({
      where: { level1: VideoStatsService.LEVEL1, level3: 'views' },
    });
    for (const row of rows) {
      const [provider, ...idParts] = (row.level2 || '').split(':');
      const videoId = idParts.join(':');
      if (!this.isProvider(provider) || !videoId) {
        continue;
      }
      await this.getForVideo(provider, videoId, true).catch((error) =>
        this.logger.warn(`refreshAll failed for ${row.level2}: ${String(error)}`),
      );
    }
  }

  private isProvider(value: string | undefined): value is VideoStatsProvider {
    return value === 'youtube' || value === 'rutube' || value === 'vk';
  }

  private async getForVideo(
    provider: VideoStatsProvider,
    videoId: string,
    force = false,
  ): Promise<VideoChannelStatsDto | null> {
    if (!VideoStatsService.ID_PATTERNS[provider].test(videoId)) {
      return null;
    }

    const key = `${provider}:${videoId}`;
    const stored = await this.readStored(key);

    if (!force && stored && this.isFresh(stored)) {
      return this.toStats(stored);
    }

    // Inflight-дедуп: несколько одновременных запросов к одному видео
    // выбирают данные с площадки ровно один раз.
    const existing = this.inflight.get(key);
    if (existing) {
      await existing;
      const refreshed = await this.readStored(key);
      if (refreshed) {
        return this.toStats(refreshed);
      }
      return stored ? this.toStats(stored) : null;
    }

    const failureAt = this.lastFailureAt.get(key);
    if (!force && failureAt && Date.now() - failureAt < VideoStatsService.FAILURE_BACKOFF_MS) {
      return stored ? this.toStats(stored) : null;
    }

    const promise = this.fetchAndSave(provider, videoId, key).finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise);
    const fresh = await promise;
    return fresh ?? (stored ? this.toStats(stored) : null);
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
        this.lastFailureAt.set(key, Date.now());
        return null;
      }
      this.lastFailureAt.delete(key);
      await this.save(key, stats);
      return stats;
    } catch (error) {
      this.lastFailureAt.set(key, Date.now());
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

  private isFresh(stored: { checkedAt: string | null }): boolean {
    const checkedAt = Number(stored.checkedAt);
    return Number.isFinite(checkedAt) && Date.now() - checkedAt < VideoStatsService.TTL_MS;
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
      await this.prismaClient.metricsDynamic.upsert({
        create: {
          level1: VideoStatsService.LEVEL1,
          level2: key,
          level3,
          value,
        },
        update: { value },
        where: {
          level1_level2_level3: {
            level1: VideoStatsService.LEVEL1,
            level2: key,
            level3,
          },
        },
      });

      // checkedAt — служебная метка свежести, в тренд её не пишем.
      if (level3 === 'checkedAt') {
        continue;
      }

      const old = await this.prismaClient.metricsDynamicHistory.findFirst({
        where: { level1: VideoStatsService.LEVEL1, level2: key, level3 },
        orderBy: { createdAt: 'desc' },
      });
      if (!old || old.value !== value) {
        await this.prismaClient.metricsDynamicHistory.create({
          data: {
            level1: VideoStatsService.LEVEL1,
            level2: key,
            level3,
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
      { headers: { 'User-Agent': VideoStatsService.BROWSER_USER_AGENT }, proxy: false },
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
      { headers: { 'User-Agent': VideoStatsService.BROWSER_USER_AGENT }, proxy: false },
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
