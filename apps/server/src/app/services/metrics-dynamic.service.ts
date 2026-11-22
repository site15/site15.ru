/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { METRICS_FEATURE, MetricsDynamic, MetricsPrismaSdk } from '@site15/metrics';
import { join } from 'path';

import { AppEnvironments } from '../app.environments';
import { isBlankOrZeroMetricValue } from './metric-value.utils';
import { withReadTimeout } from './read-timeout.utils';
import { setAppEnvironments, setPrismaClient } from './global';
import { StatsWorkerLauncher } from './stats-worker-launcher';
import { AllStats, MetricHistoryItemDto } from './type';

type ShortMetricsDynamic = Pick<MetricsDynamic, 'level1' | 'level2' | 'level3' | 'value'>;

type MetricKey = { level1: string; level2: string; level3: string };

type MetricsHistoryRow = { level1: string | null; level2: string | null; level3: string | null; value: string | null };

function formatMetricKey(key: MetricKey): string {
  return `${key.level1}|${key.level2}|${key.level3}`;
}

function matchesMetricKey(row: MetricsHistoryRow, key: MetricKey): boolean {
  return (
    (row.level1 ?? '') === key.level1 &&
    (row.level3 ?? '') === key.level3 &&
    (!key.level2 || (row.level2 ?? '') === key.level2)
  );
}

/** Разумные границы числа точек истории: фронт может попросить что угодно. */
function clampHistoryLimit(limit: number, fallback: number, max: number): number {
  const parsed = Math.trunc(Number(limit));
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
}

@Injectable()
export class MetricsDynamicService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MetricsDynamicService.name);
  /** Один фоновый worker за раз: повторный запуск, пока предыдущий жив, пропускается. */
  private readonly syncStatsWorkerLauncher = new StatsWorkerLauncher(this.logger, 'sync-stats');

  /** Разделитель в ключах метрик лендинга: `level1|level2|level3`. */
  private static readonly HISTORY_KEY_SEPARATOR = '|';
  /** Сколько метрик отдаём за один запрос (столько бейджей на лендинге, с запасом). */
  private static readonly HISTORY_MAX_KEYS = 200;
  /** Сколько последних точек истории возвращать по умолчанию. */
  private static readonly HISTORY_DEFAULT_LIMIT = 5;
  private static readonly HISTORY_MAX_LIMIT = 20;
  /**
   * Потолок строк, поднимаемых из таблицы: у metricsDynamicHistory нет индекса
   * по ключу, поэтому за один запрос лучше не читать больше разумного объёма.
   * Запас ×4 на то, что «болтливые» метрики (telegram-online, просмотры видео)
   * вытеснят из выборки тихие.
   */
  private static readonly HISTORY_ROWS_PER_KEY = 4;
  /**
   * Сколько ждём ответ от БД в публичных чтениях лендинга. Больше — и запрос
   * начинает выглядеть для браузера как зависнувший сервер: при недоступном
   * PostgreSQL node-postgres ждёт соединения сколько угодно, а счётчики
   * лендинга остаются в «Загрузка...» до бесконечности.
   */
  private static readonly READ_TIMEOUT_MS = 3000;
  /**
   * Последний успешный снимок метрик: отдаём его, если очередное чтение
   * не удалось или вышло за READ_TIMEOUT_MS, чтобы лендинг показывал
   * немного устаревшие, но реальные значения вместо пустоты.
   */
  private lastGoodSnapshot: AllStats | null = null;

  constructor(
    @InjectPrismaClient(METRICS_FEATURE)
    private readonly prismaClient: MetricsPrismaSdk.PrismaClient,
    private readonly appEnvironments: AppEnvironments,
  ) {
    setPrismaClient(this.prismaClient);
    setAppEnvironments(this.appEnvironments);
  }

  onApplicationBootstrap() {
    this.logger.debug('onApplicationBootstrap');

    if (isInfrastructureMode()) {
      return;
    }

    // Синхронизация статистики вынесена в отдельный процесс (child_process.fork),
    // чтобы не блокировать event loop основного приложения внешними запросами
    // (GitHub, NPM, Dev.to, и т.д.). Worker script: apps/server/src/workers/sync-stats.worker.ts
    if (this.appEnvironments.syncAllStatsByInterval) {
      setInterval(() => this.spawnSyncStatsWorker(), 1000 * 60 * 60 * 3);
    }

    if (this.appEnvironments.syncAllStatsAfterStart) {
      setImmediate(() => this.spawnSyncStatsWorker());
    }

    if (!this.appEnvironments.syncAllStatsByInterval && !this.appEnvironments.syncAllStatsAfterStart) {
      // Без этих гейтов статистика лендинга не обновляется вовсе: эндпоинты
      // /api/landing/* читают только БД и никогда не ходят на площадки.
      this.logger.warn(
        'sync-stats scheduler отключён: выставьте SITE_15_SYNC_ALL_STATS_BY_INTERVAL=true (или ..._AFTER_START=true), иначе метрики проектов и чатов устаревают',
      );
    }
  }

  /**
   * Запускает syncAllStats() в отдельном процессе через child_process.fork().
   * Это полностью изолирует event loop основного приложения от долгих внешних запросов.
   */
  private spawnSyncStatsWorker() {
    const workerPath = join(__dirname, 'workers', 'sync-stats.worker.js');
    this.syncStatsWorkerLauncher.spawn(workerPath);
  }

  async getAllSync() {
    const snapshot = await withReadTimeout<AllStats | null>(
      'GET /landing/stats',
      this.prismaClient.metricsDynamic.findMany({}).then((rows) => this.convertMetricsDynamicToAllStats(rows)),
      MetricsDynamicService.READ_TIMEOUT_MS,
      null,
    );

    if (snapshot === null) {
      return (this.lastGoodSnapshot ?? {}) as AllStats;
    }

    this.lastGoodSnapshot = snapshot;
    return snapshot;
  }

  /**
   * Последние точки истории метрик — для тренд-бейджей (↑/↓/★) и их модалок на
   * лендинге. Ключ задаётся как `level1|level2|level3`; у плоских метрик
   * (devToStats, habrStats, npmNestjsModStats…) level2 пустой, и в фильтре он
   * намеренно опускается: такие строки лежат в БД то с '', то с null.
   * Пустые и нулевые значения вырезаются — это шум от сбоев опроса площадок.
   *
   * Только чтение из metricsDynamicHistory — внешних запросов к площадкам здесь нет.
   */
  async getHistoryForKeys(
    keys: string[],
    limit = MetricsDynamicService.HISTORY_DEFAULT_LIMIT,
  ): Promise<MetricHistoryItemDto[]> {
    const wanted: MetricKey[] = [];
    const seen = new Set<string>();
    for (const rawKey of keys) {
      const key = this.parseMetricKey(rawKey);
      if (!key) {
        continue;
      }
      const formatted = formatMetricKey(key);
      if (seen.has(formatted)) {
        continue;
      }
      seen.add(formatted);
      wanted.push(key);
      if (wanted.length >= MetricsDynamicService.HISTORY_MAX_KEYS) {
        break;
      }
    }
    if (!wanted.length) {
      return [];
    }

    const take = clampHistoryLimit(
      limit,
      MetricsDynamicService.HISTORY_DEFAULT_LIMIT,
      MetricsDynamicService.HISTORY_MAX_LIMIT,
    );
    // level2 подставляем только когда он реально запрошен: для «плоских» метрик
    // строки в БД могут лежать и с '', и с null.
    // Пустой ответ по таймауту допустим: тренд-бейджи просто не отрисуются,
    // а счётчики останутся на своих местах (см. getAllSync).
    const rows = await withReadTimeout(
      'GET /landing/metric-history',
      this.prismaClient.metricsDynamicHistory.findMany({
        where: {
          OR: wanted.map((key) => ({
            level1: key.level1,
            level3: key.level3,
            ...(key.level2 ? { level2: key.level2 } : {}),
          })),
        },
        orderBy: { createdAt: 'desc' },
        take: wanted.length * take * MetricsDynamicService.HISTORY_ROWS_PER_KEY,
        select: { level1: true, level2: true, level3: true, value: true, createdAt: true },
      }),
      MetricsDynamicService.READ_TIMEOUT_MS,
      [],
    );

    return wanted.map((key) => ({
      key: formatMetricKey(key),
      points: rows
        .filter((row) => matchesMetricKey(row, key) && !isBlankOrZeroMetricValue(row.value))
        .slice(0, take)
        .map((row) => ({ value: row.value ?? null, createdAt: row.createdAt.toISOString() })),
    }));
  }

  private parseMetricKey(key: string): MetricKey | null {
    const parts = String(key ?? '')
      .split(MetricsDynamicService.HISTORY_KEY_SEPARATOR)
      .map((part) => part.trim());
    if (parts.length !== 3) {
      return null;
    }
    const [level1, level2, level3] = parts;
    if (!level1 || !level3) {
      return null;
    }
    return { level1, level2: level2 || '', level3 };
  }

  private convertMetricsDynamicToAllStats(metricsDynamics: ShortMetricsDynamic[]): AllStats {
    const result: any = {};

    for (const metric of metricsDynamics) {
      const { level1, level2, level3, value } = metric;
      if (!level1) continue;

      // telegramDataStats
      if (level1 === 'telegramDataStats' && level2 && level3) {
        result.telegramDataStats ??= [];

        let channel = result.telegramDataStats.find((c: any) => c.id === level2);

        if (!channel) {
          channel = { id: level2, data: {} };
          result.telegramDataStats.push(channel);
        }

        channel.data[level3] = value;
        continue;
      }

      if (!level2 && level3) {
        result[level1] ??= {};
        result[level1][level3] = parseValue(value);
        continue;
      }

      if (level2 && level3) {
        result[level1] ??= {};
        result[level1][level2] ??= {};
        result[level1][level2][level3] = parseValue(value);
      }
    }

    return result as AllStats;
  }
}

function parseValue(value: string | null): any {
  if (value === null) return null;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
