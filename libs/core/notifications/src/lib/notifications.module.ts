import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_MODULE,
} from './notifications.constants';
import { NotificationsStaticEnvironments } from './notifications.environments';
import { NotificationsExceptionsFilter } from './notifications.filter';
import { NotificationsService } from './notifications.service';
import { NotificationsServiceBootstrap } from './notifications-bootstrap.service';

export const { NotificationsModule } = createNestModule({
  moduleName: NOTIFICATIONS_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: NotificationsStaticEnvironments,
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
});
