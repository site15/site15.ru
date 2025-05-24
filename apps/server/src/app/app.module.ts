import {
  createNestModule,
  getRequestFromExecutionContext,
  NestModuleCategory,
} from '@nestjs-mod/common';

import { SSO_FEATURE, SsoModule, SsoRequest } from '@nestjs-mod-sso/sso';
import { ValidationError, ValidationErrorEnum } from '@nestjs-mod/validation';
import { PrismaModule } from '@nestjs-mod/prisma';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TranslatesModule } from 'nestjs-translates';
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
    PrismaModule.forFeature({
      contextName: SSO_FEATURE,
      featureModuleName: APP_FEATURE,
    }),
    TranslatesModule.forRootDefault({
      localePaths: [
        join(__dirname, 'assets', 'i18n'),
        join(__dirname, 'assets', 'i18n', 'getText'),
        join(__dirname, 'assets', 'i18n', 'cv-messages'),
        join(__dirname, 'assets', 'i18n', 'nestjs-mod-prisma-tools'),
        join(__dirname, 'assets', 'i18n', 'nestjs-mod-validation'),
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
          limit: 60,
          ttl: 24 * 60 * 60 * 1000,
          skipIf: (ctx) => {
            const req: SsoRequest = getRequestFromExecutionContext(ctx);
            return req.skipThrottle === true;
          },
        },
      ],
    }),
    ...(process.env.SINGLE_SIGN_ON_DISABLE_SERVE_STATIC
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
