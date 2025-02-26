import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { Provider } from '@nestjs/common';
import { NotificationsConfiguration } from './notifications.configuration';
import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_MODULE,
} from './notifications.constants';
import { NotificationsStaticEnvironments } from './notifications.environments';

export const { NotificationsModule } = createNestModule({
  moduleName: NOTIFICATIONS_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: NotificationsConfiguration,
  staticEnvironmentsModel: NotificationsStaticEnvironments,
  providers: ({ staticEnvironments }) => {
    const providers: Provider[] = [];
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
