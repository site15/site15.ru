import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { PrismaModule } from '@nestjs-mod/prisma';
import { JwtModule } from '@nestjs/jwt';
import { TranslatesModule } from 'nestjs-translates';
import { SsoProjectsController } from './controllers/sso-projects.controller';
import { SsoUsersController } from './controllers/sso-users.controller';
import { SsoController } from './controllers/sso.controller';
import { SsoCookieService } from './services/sso-cookie.service';
import { SsoEventsService } from './services/sso-events.service';
import { SsoMailService } from './services/sso-mail.service';
import { SsoPasswordService } from './services/sso-password.service';
import { SsoTwoFactorService } from './services/sso-two-factor.service';
import { SsoUsersService } from './services/sso-users.service';
import { SsoService } from './services/sso.service';
import { SSO_FEATURE, SSO_MODULE } from './sso.constants';
import { SsoEnvironments } from './sso.environments';

export const { SsoModule } = createNestModule({
  moduleName: SSO_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: SsoEnvironments,
  imports: [
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: SSO_FEATURE,
    }),
    TranslatesModule,
    JwtModule,
  ],
  sharedImports: [
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: SSO_FEATURE,
    }),
    TranslatesModule,
    JwtModule,
  ],
  sharedProviders: [
    SsoService,
    SsoUsersService,
    SsoCookieService,
    SsoEventsService,
    SsoMailService,
    SsoPasswordService,
    SsoTwoFactorService,
  ],
  controllers: [SsoUsersController, SsoProjectsController, SsoController],
  wrapForRootAsync: (asyncModuleOptions) => {
    if (!asyncModuleOptions) {
      asyncModuleOptions = {};
    }
    const FomatterClass = getFeatureDotEnvPropertyNameFormatter(SSO_FEATURE);
    Object.assign(asyncModuleOptions, {
      environmentsOptions: {
        propertyNameFormatters: [new FomatterClass()],
        name: SSO_FEATURE,
      },
    });

    return { asyncModuleOptions };
  },
});
