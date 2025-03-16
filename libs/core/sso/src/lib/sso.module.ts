import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { PrismaModule } from '@nestjs-mod/prisma';
import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TranslatesModule } from 'nestjs-translates';
import { SsoProjectsController } from './controllers/sso-projects.controller';
import { SsoRefreshSessionsController } from './controllers/sso-sessions.controller';
import { SsoUsersController } from './controllers/sso-users.controller';
import { SsoController } from './controllers/sso.controller';
import { SsoAdminService } from './services/sso-admin.service';
import { SsoServiceBootstrap } from './services/sso-bootstrap.service';
import { SsoCacheService } from './services/sso-cache.service';
import { SsoCookieService } from './services/sso-cookie.service';
import { SsoEventsService } from './services/sso-events.service';
import { SsoPasswordService } from './services/sso-password.service';
import { SsoProjectService } from './services/sso-project.service';
import { SsoTokensService } from './services/sso-tokens.service';
import { SsoUsersService } from './services/sso-users.service';
import { SsoService } from './services/sso.service';
import { SsoConfiguration, SsoStaticConfiguration } from './sso.configuration';
import { SSO_FEATURE, SSO_MODULE } from './sso.constants';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoExceptionsFilter } from './sso.filter';
import { SsoGuard } from './sso.guard';
import { SsoRolesController } from './controllers/sso-roles.controller';

export const { SsoModule } = createNestModule({
  moduleName: SSO_MODULE,
  moduleCategory: NestModuleCategory.feature,
  staticEnvironmentsModel: SsoStaticEnvironments,
  staticConfigurationModel: SsoStaticConfiguration,
  configurationModel: SsoConfiguration,
  imports: [
    KeyvModule.forFeature({ featureModuleName: SSO_FEATURE }),
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: SSO_FEATURE,
    }),
    TranslatesModule,
  ],
  sharedImports: [
    KeyvModule.forFeature({ featureModuleName: SSO_FEATURE }),
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
    PrismaToolsModule.forFeature({
      featureModuleName: SSO_FEATURE,
    }),
    TranslatesModule,
  ],
  controllers: [
    SsoController,
    SsoUsersController,
    SsoProjectsController,
    SsoRefreshSessionsController,
    SsoRolesController,
  ],
  providers: [SsoServiceBootstrap],
  sharedProviders: [
    SsoService,
    SsoUsersService,
    SsoCookieService,
    SsoEventsService,
    SsoPasswordService,
    SsoCacheService,
    SsoTokensService,
    SsoProjectService,
    SsoAdminService,
    JwtService,
  ],
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
  preWrapApplication: async ({ current }) => {
    const staticEnvironments = current.staticEnvironments;
    const ssoStaticConfiguration = current.staticConfiguration;

    // all routes
    for (const ctrl of [
      SsoController,
      SsoUsersController,
      SsoProjectsController,
      SsoRefreshSessionsController,
      SsoRolesController,
    ]) {
      if (staticEnvironments?.useFilters) {
        UseFilters(SsoExceptionsFilter)(ctrl);
      }
      if (staticEnvironments?.useGuards) {
        UseGuards(SsoGuard)(ctrl);
      }
      if (ssoStaticConfiguration?.mutateController) {
        ssoStaticConfiguration.mutateController(ctrl);
      }
    }
  },
});
