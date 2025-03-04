import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { AUTH_FEATURE, AUTH_MODULE, AuthModule } from '@nestjs-mod-sso/auth';
import { FilesModule } from '@nestjs-mod-sso/files';
import { SSO_FEATURE, SsoController, SsoModule } from '@nestjs-mod-sso/sso';
import { TwoFactorModule } from '@nestjs-mod-sso/two-factor';
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
import { SsoAuthConfiguration } from './integrations/sso/sso-auth.configuration';
import { SsoClientModule } from './integrations/sso/sso-client.guard';
import { SsoWithMinioFilesConfiguration } from './integrations/sso/sso-with-minio-files.configuration';
import { AppService } from './services/app.service';

export const { AppModule: SsoAppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    SsoClientModule.forRootAsync({
      imports: [
        WebhookModule.forFeature({ featureModuleName: SSO_FEATURE }),
        AuthModule.forFeature({ featureModuleName: SSO_FEATURE }),
      ],
    }),
    FilesModule.forRootAsync({
      imports: [SsoModule.forFeature(), MinioModule.forFeature()],
      configurationClass: SsoWithMinioFilesConfiguration,
    }),
    // todo: remove
    AuthModule.forRootAsync({
      imports: [
        SsoClientModule.forFeature({
          featureModuleName: AUTH_MODULE,
        }),
        SsoModule.forFeature({
          featureModuleName: AUTH_MODULE,
        }),
        PrismaModule.forFeature({
          contextName: SSO_FEATURE,
          featureModuleName: AUTH_MODULE,
        }),
        PrismaModule.forFeature({
          contextName: AUTH_FEATURE,
          featureModuleName: AUTH_FEATURE,
        }),
        WebhookModule.forFeature({
          featureModuleName: AUTH_MODULE,
        }),
      ],
      configurationClass: SsoAuthConfiguration,
    }),
    AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
    PrismaModule.forFeature({
      contextName: AUTH_FEATURE,
      featureModuleName: AUTH_FEATURE,
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
          //  target: false,
          value: false,
        },
        exceptionFactory: (errors) => {
          console.log(errors);
          return new ValidationError(
            ValidationErrorEnum.COMMON,
            undefined,
            errors
          );
        },
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
    TwoFactorModule.forRoot(),
  ],
  controllers: [
    AppController,
    TimeController,
    FakeEndpointController,
    SsoController,
    // todo: remove
    AuthorizerController,
  ],
  providers: [AppService, TimeController],
});
