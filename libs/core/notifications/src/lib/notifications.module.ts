import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { Provider, UseGuards } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { NotificationsServiceBootstrap } from './notifications-bootstrap.service';
import {
  NotificationsConfiguration,
  NotificationsStaticConfiguration,
} from './notifications.configuration';
import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_MODULE,
} from './notifications.constants';
import { NotificationsController } from './notifications.controller';
import { NotificationsStaticEnvironments } from './notifications.environments';
import { NotificationsExceptionsFilter } from './notifications.filter';
import { NotificationsGuard } from './notifications.guard';
import { NotificationsService } from './notifications.service';

export const { NotificationsModule } = createNestModule({
  moduleName: NOTIFICATIONS_MODULE,
  moduleCategory: NestModuleCategory.core,
  staticEnvironmentsModel: NotificationsStaticEnvironments,
  staticConfigurationModel: NotificationsStaticConfiguration,
  configurationModel: NotificationsConfiguration,
  imports: [
    PrismaModule.forFeature({
      contextName: NOTIFICATIONS_FEATURE,
      featureModuleName: NOTIFICATIONS_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: NOTIFICATIONS_FEATURE,
    }),
  ],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: NOTIFICATIONS_FEATURE,
      featureModuleName: NOTIFICATIONS_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: NOTIFICATIONS_FEATURE,
    }),
  ],
  sharedProviders: [NotificationsService],
  providers: ({ staticEnvironments }) => {
    const providers: Provider[] = [NotificationsServiceBootstrap];
    if (staticEnvironments.useFilters) {
      providers.push({
        provide: APP_FILTER,
        useClass: NotificationsExceptionsFilter,
      });
    }
    return providers;
  },
  controllers: [NotificationsController],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(
      NOTIFICATIONS_FEATURE
    );
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: NOTIFICATIONS_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
  preWrapApplication: async ({ current }) => {
    const staticConfiguration = current.staticConfiguration;

    // all routes
    for (const ctrl of [NotificationsController]) {
      UseGuards(
        ...(staticConfiguration?.guards || []),
        NotificationsGuard
      )(ctrl);

      if (staticConfiguration?.mutateController) {
        staticConfiguration.mutateController(ctrl);
      }
    }
  },
});
