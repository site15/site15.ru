import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';

import { SSO_FEATURE, SsoModule } from '@nestjs-mod-sso/sso';
import {
  ValidationError,
  ValidationErrorEnum,
} from '@nestjs-mod-sso/validation';
import { WebhookModule } from '@nestjs-mod-sso/webhook';
import { PrismaModule } from '@nestjs-mod/prisma';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { getText, TranslatesModule } from 'nestjs-translates';
import { join } from 'path';
import { APP_FEATURE } from './app.constants';
import { AppExceptionsFilter } from './app.filter';
import { TimeController } from './controllers/time.controller';

export const { AppModule } = createNestModule({
  moduleName: 'AppModule',
  moduleCategory: NestModuleCategory.feature,
  imports: [
    SsoModule.forFeature({ featureModuleName: SSO_FEATURE }),
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: SSO_FEATURE,
    }),
    SsoModule.forFeature({
      featureModuleName: APP_FEATURE,
    }),
    WebhookModule.forFeature({
      featureModuleName: APP_FEATURE,
      featureConfiguration: {
        events: [
          {
            eventName: 'app-demo.create',
            description: getText('Event that will be triggered after creation'),
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          },
          {
            eventName: 'app-demo.update',
            description: getText('Event that will trigger after the update'),
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          },
          {
            eventName: 'app-demo.delete',
            description: getText('Event that will fire after deletion'),
            example: {
              id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
              name: 'demo name',
              createdAt: '2024-10-02T18:49:07.992Z',
              updatedAt: '2024-10-02T18:49:07.992Z',
            },
          },
        ],
      },
    }),
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 50,
          ttl: 24 * 60 * 60 * 1000,
        },
      ],
    }),
    ...(process.env.DISABLE_SERVE_STATIC
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client', 'browser'),
          }),
        ]),
  ],
  controllers: [TimeController],
  providers: [
    TimeController,
    { provide: APP_FILTER, useClass: AppExceptionsFilter },
  ],
});
