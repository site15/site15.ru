/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInfrastructureMode } from '@nestjs-mod/common';
import { InjectPrismaClient } from '@nestjs-mod/prisma';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { METRICS_FEATURE, MetricsDynamic, MetricsPrismaSdk } from '@site15/metrics';
import { AppEnvironments } from '../app.environments';
import { setAppEnvironments, setPrismaClient } from './global';
import { AllStats } from './type';
import { syncAllStats } from './update-all-stats';

type ShortMetricsDynamic = Pick<MetricsDynamic, 'level1' | 'level2' | 'level3' | 'value'>;

@Injectable()
export class MetricsDynamicService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MetricsDynamicService.name);

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

    if (this.appEnvironments.syncAllStatsByInterval) {
      setInterval(() => this.syncAllStats().then(), 1000 * 60 * 60 * 3);
    }

    if (this.appEnvironments.syncAllStatsAfterStart) {
      this.syncAllStats().then();
    }
  }

  async getAllSync() {
    return this.convertMetricsDynamicToAllStats(await this.prismaClient.metricsDynamic.findMany({}));
  }

  private async syncAllStats() {
    this.logger.log('syncAllStats: start');
    try {
      const allStats = await syncAllStats();
      const metrics = this.convertAllStatsToMetricsDynamic(allStats);
      for (const metric of metrics) {
        await this.prismaClient.metricsDynamic.upsert({
          create: {
            level1: metric.level1 || '',
            level2: metric.level2 || '',
            level3: metric.level3 || '',
            value: metric.value,
          },
          update: {
            value: metric.value,
          },
          where: {
            level1_level2_level3: {
              level1: metric.level1 || '',
              level2: metric.level2 || '',
              level3: metric.level3 || '',
            },
          },
        });
        const old = await this.prismaClient.metricsDynamicHistory.findFirst({
          where: {
            level1: metric.level1 || '',
            level2: metric.level2 || '',
            level3: metric.level3 || '',
          },
          orderBy: { createdAt: 'desc' },
        });
        if (!old || old?.value !== metric.value) {
          await this.prismaClient.metricsDynamicHistory.create({
            data: {
              level1: metric.level1 || '',
              level2: metric.level2 || '',
              level3: metric.level3 || '',
              value: metric.value,
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(err, err.stack);
    }
    this.logger.log('syncAllStats: end');
  }

  private convertAllStatsToMetricsDynamic(allStats: AllStats | null): ShortMetricsDynamic[] {
    if (!allStats) return [];

    const result: ShortMetricsDynamic[] = [];

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
        // telegramDataStats
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
