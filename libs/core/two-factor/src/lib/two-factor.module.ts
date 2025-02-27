import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TwoFactorEventsService } from './two-factor-events.service';
import { TwoFactorConfiguration } from './two-factor.configuration';
import { TWO_FACTOR_FEATURE, TWO_FACTOR_MODULE } from './two-factor.constants';
import { TwoFactorStaticEnvironments } from './two-factor.environments';
import { TwoFactorExceptionsFilter } from './two-factor.filter';
import { TwoFactorService } from './two-factor.service';

export const { TwoFactorModule } = createNestModule({
  moduleName: TWO_FACTOR_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: TwoFactorConfiguration,
  staticEnvironmentsModel: TwoFactorStaticEnvironments,
  imports: [
    PrismaModule.forFeature({
      contextName: TWO_FACTOR_FEATURE,
      featureModuleName: TWO_FACTOR_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: TWO_FACTOR_FEATURE,
    }),
  ],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: TWO_FACTOR_FEATURE,
      featureModuleName: TWO_FACTOR_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: TWO_FACTOR_FEATURE,
    }),
  ],
  sharedProviders: [TwoFactorService, TwoFactorEventsService],
  providers: ({ staticEnvironments }) => {
    const providers: Provider[] = [];
    if (staticEnvironments.useFilters) {
      providers.push({
        provide: APP_FILTER,
        useClass: TwoFactorExceptionsFilter,
      });
    }
    return providers;
  },
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass =
      getFeatureDotEnvPropertyNameFormatter(TWO_FACTOR_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: TWO_FACTOR_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
