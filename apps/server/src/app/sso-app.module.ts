import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { AUTH_MODULE, AuthModule } from '@nestjs-mod-sso/auth';
import { FilesModule } from '@nestjs-mod-sso/files';
import { SSO_FEATURE, SsoController, SsoModule } from '@nestjs-mod-sso/sso';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-sso/validation';
import { WebhookModule } from '@nestjs-mod-sso/webhook';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PrismaModule } from '@nestjs-mod/prisma';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE } from './app.constants';
import { AuthorizerController } from './controllers/sso/authorizer.controller';
import { AppController } from './controllers/sso/sso-app.controller';
import { FakeEndpointController } from './controllers/sso/sso-fake-endoint.controller';
import { TimeController } from './controllers/sso/sso-time.controller';
import { SsoWithMinioFilesConfiguration } from './integrations/sso/sso-with-minio-files.configuration';
import { AppService } from './services/app.service';

export const { AppModule: SsoAppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    FilesModule.forRootAsync({
      imports: [SsoModule.forFeature(), MinioModule.forFeature()],
      configurationClass: SsoWithMinioFilesConfiguration,
    }),
    // todo: remove
    AuthModule.forRootAsync({
      imports: [
        SsoModule.forFeature(),
        PrismaModule.forFeature({
          contextName: SSO_FEATURE,
          featureModuleName: AUTH_MODULE,
        }),
      ],
      staticEnvironments: {
        useFilters: false,
        useGuards: false,
        useInterceptors: false,
        usePipes: false,
      },
      configuration: { createAdmin: async () => null },
    }),
    SsoModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    WebhookModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: APP_FEATURE,
    }),
    PrismaModule.forFeature({
      contextName: APP_FEATURE,
      featureModuleName: APP_FEATURE,
    }),
    TranslatesModule.forRootDefault({
      localePaths: [
        join(__dirname, 'assets', 'i18n'),
        join(__dirname, 'assets', 'i18n', 'getText'),
        join(__dirname, 'assets', 'i18n', 'class-validator-messages'),
      ],
      vendorLocalePaths: [join(__dirname, 'assets', 'i18n')],
      locales: ['en', 'ru'],
      validationPipeOptions: {
        transform: true,
        whitelist: true,
        validationError: {
          target: false,
          value: false,
        },
        exceptionFactory: (errors) =>
          new ValidationError(ValidationErrorEnum.COMMON, undefined, errors),
      },
      usePipes: true,
      useInterceptors: true,
    }),
    KeyvModule.forFeature({ featureModuleName: APP_FEATURE }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'browser'),
          }),
        ]),
  ],
  controllers: [
    AppController,
    TimeController,
    FakeEndpointController,
    SsoController,
    // todo: remove
    AuthorizerController,
  ],
  providers: [
    // { provide: APP_GUARD, useClass: SsoGuard },
    // { provide: APP_FILTER, useClass: AuthExceptionsFilter },
    AppService,
    TimeController,
  ],
});
