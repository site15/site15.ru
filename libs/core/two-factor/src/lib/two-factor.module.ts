import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { Provider } from '@nestjs/common';
import { TwoFactorConfiguration } from './two-factor.configuration';
import { TWO_FACTOR_FEATURE, TWO_FACTOR_MODULE } from './two-factor.constants';
import { TwoFactorStaticEnvironments } from './two-factor.environments';

export const { TwoFactorModule } = createNestModule({
  moduleName: TWO_FACTOR_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: TwoFactorConfiguration,
  staticEnvironmentsModel: TwoFactorStaticEnvironments,
  providers: ({ staticEnvironments }) => {
    const providers: Provider[] = [];
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
