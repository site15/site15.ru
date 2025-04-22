import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import { WebhookModule } from '@nestjs-mod-sso/webhook';
import {
  createNestModule,
  getFeatureDotEnvPropertyNameFormatter,
  NestModuleCategory,
} from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { PrismaModule } from '@nestjs-mod/prisma';
import { UseGuards } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TranslatesModule } from 'nestjs-translates';
import { SsoEmailTemplatesController } from './controllers/sso-email-templates.controller';
import { SsoOAuthController } from './controllers/sso-oauth.controller';
import { SsoProjectsController } from './controllers/sso-projects.controller';
import { SsoPublicProjectsController } from './controllers/sso-public-projects.controller';
import { SsoRolesController } from './controllers/sso-roles.controller';
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
import { SsoTemplatesService } from './services/sso-templates.service';
import { SsoTokensService } from './services/sso-tokens.service';
import { SsoUsersService } from './services/sso-users.service';
import { SsoService } from './services/sso.service';
import { SsoConfiguration, SsoStaticConfiguration } from './sso.configuration';
import { SSO_FEATURE, SSO_MODULE } from './sso.constants';
import { SsoStaticEnvironments } from './sso.environments';
import { SsoExceptionsFilter } from './sso.filter';
import { SsoGuard } from './sso.guard';
import { SsoGoogleOAuthController } from './strategies/google/sso-google-oauth.controller';
import { SsoGoogleOAuthStrategy } from './strategies/google/sso-google-oauth.strategy';
import { SSO_WEBHOOK_EVENTS } from './types/sso-webhooks';

export const { SsoModule } = createNestModule({
  moduleName: SSO_MODULE,
  moduleCategory: NestModuleCategory.core,
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
    WebhookModule.forFeature({
      featureModuleName: SSO_FEATURE,
      featureConfiguration: {
        events: SSO_WEBHOOK_EVENTS,
      },
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
  controllers: (asyncModuleOptions) =>
    [
      SsoController,
      SsoUsersController,
      SsoProjectsController,
      SsoRefreshSessionsController,
      SsoRolesController,
      SsoPublicProjectsController,
      SsoEmailTemplatesController,
      SsoOAuthController,
      SsoGoogleOAuthController,
    ].map((ctrl) => {
      if (asyncModuleOptions.staticEnvironments?.useGuards) {
        UseGuards(SsoGuard)(ctrl);
      }
      if (asyncModuleOptions.staticConfiguration?.mutateController) {
        asyncModuleOptions.staticConfiguration.mutateController(ctrl);
      }
      return ctrl;
    }),
  providers: (asyncModuleOptions) => [
    SsoServiceBootstrap,
    SsoGoogleOAuthStrategy,
    ...(asyncModuleOptions.staticEnvironments.useFilters
      ? [{ provide: APP_FILTER, useClass: SsoExceptionsFilter }]
      : []),
  ],
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
    SsoTemplatesService,
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
});
