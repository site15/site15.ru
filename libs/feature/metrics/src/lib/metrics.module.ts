import { createNestModule, getFeatureDotEnvPropertyNameFormatter, NestModuleCategory } from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { PrismaModule } from '@nestjs-mod/prisma';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { UseGuards } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { TranslatesModule } from 'nestjs-translates';
import { MetricsGithubRepositoryController } from './controllers/metrics-github-repository.controller';
import { METRICS_FEATURE, METRICS_MODULE } from './metrics.constants';
import { MetricsStaticEnvironments } from './metrics.environments';
import { MetricsExceptionsFilter } from './metrics.filter';
import { MetricsGuard } from './metrics.guard';
import { MetricsPrismaSdk } from './metrics.prisma-sdk';
import { MetricsCacheService } from './services/metrics-cache.service';

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
    [MetricsGithubRepositoryController].map((ctrl) => {
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
  sharedProviders: [MetricsCacheService],
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
