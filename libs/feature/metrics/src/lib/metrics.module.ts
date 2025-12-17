import { createNestModule, getFeatureDotEnvPropertyNameFormatter, NestModuleCategory } from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { PrismaModule } from '@nestjs-mod/prisma';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { UseGuards } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { TranslatesModule } from 'nestjs-translates';
import { MetricsGithubMetricsController } from './controllers/metrics-github-metrics.controller';
import { MetricsGithubRepositoriesController } from './controllers/metrics-github-repositories.controller';
import { MetricsGithubRepositoryStatisticsController } from './controllers/metrics-github-repository-statistics.controller';
import { MetricsGithubTeamRepositoriesController } from './controllers/metrics-github-team-repositories.controller';
import { MetricsGithubTeamUsersController } from './controllers/metrics-github-team-users.controller';
import { MetricsGithubTeamsController } from './controllers/metrics-github-teams.controller';
import { MetricsGithubUserRepositoriesController } from './controllers/metrics-github-user-repositories.controller';
import { MetricsGithubUserStatisticsController } from './controllers/metrics-github-user-statistics.controller';
import { MetricsGithubUsersController } from './controllers/metrics-github-users.controller';
import { MetricsSettingsController } from './controllers/metrics-settings.controller';
import { MetricsUsersController } from './controllers/metrics-users.controller';
import { METRICS_FEATURE, METRICS_MODULE } from './metrics.constants';
import { MetricsStaticEnvironments } from './metrics.environments';
import { MetricsExceptionsFilter } from './metrics.filter';
import { MetricsGuard } from './metrics.guard';
import { MetricsPrismaSdk } from './metrics.prisma-sdk';
import { MetricsCacheService } from './services/metrics-cache.service';
import { MetricsGithubStatisticsSyncService } from './services/metrics-github-statistics-sync.service';

export const { MetricsModule } = createNestModule({
  moduleName: METRICS_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: MetricsStaticEnvironments,
  imports: [
    KeyvModule.forFeature({ featureModuleName: METRICS_FEATURE }),
    PrismaModule.forFeature({
      contextName: METRICS_FEATURE,
      featureModuleName: METRICS_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: METRICS_FEATURE,
    }),
    TranslatesModule,
    PrismaModule.forRoot({
      contextName: METRICS_FEATURE,
      staticConfiguration: {
        featureName: METRICS_FEATURE,
        provider: 'prisma-client',
        prismaClientFactory: async (options) => {
          const { url, ...otherOoptions } = options;
          const adapter = new PrismaPg({ connectionString: url });
          return new MetricsPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
        },
        moduleFormat: 'cjs',
      },
    }),
  ],
  sharedImports: [
    KeyvModule.forFeature({ featureModuleName: METRICS_FEATURE }),
    PrismaModule.forFeature({
      contextName: METRICS_FEATURE,
      featureModuleName: METRICS_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: METRICS_FEATURE,
    }),
    TranslatesModule,
  ],
  controllers: (asyncModuleOptions) =>
    [
      MetricsGithubMetricsController,
      MetricsGithubRepositoriesController,
      MetricsGithubRepositoryStatisticsController,
      MetricsGithubTeamsController,
      MetricsGithubTeamRepositoriesController,
      MetricsGithubTeamUsersController,
      MetricsGithubUsersController,
      MetricsGithubUserRepositoriesController,
      MetricsGithubUserStatisticsController,
      MetricsSettingsController,
      MetricsUsersController,
    ].map((ctrl) => {
      if (asyncModuleOptions.staticEnvironments?.useGuards) {
        UseGuards(MetricsGuard)(ctrl);
      }
      return ctrl;
    }),
  providers: (asyncModuleOptions) => [
    ...(asyncModuleOptions.staticEnvironments.useFilters
      ? [{ provide: APP_FILTER, useClass: MetricsExceptionsFilter }]
      : []),
  ],
  sharedProviders: [MetricsCacheService, MetricsGithubStatisticsSyncService],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(METRICS_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: METRICS_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
