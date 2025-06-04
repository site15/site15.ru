import { SsoModule } from '@nestjs-mod-sso/sso';
import { createNestModule } from '@nestjs-mod/common';
import { FilesModule } from '@nestjs-mod/files';
import { NotificationsModule } from '@nestjs-mod/notifications';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { TwoFactorModule } from '@nestjs-mod/two-factor';
import { ValidationModule } from '@nestjs-mod/validation';
import { WebhookModule } from '@nestjs-mod/webhook';
import { AppModule } from './app/app.module';
import { MainKeyvModule, MainMinioModule } from './environments/environment';
import { filesModuleForRootAsyncOptions } from './integrations/minio-files-integration.configuration';
import { notificationsModuleForRootAsyncOptions } from './integrations/notifications-integration.configuration';
import { ssoModuleForRootAsyncOptions } from './integrations/sso-integration.configuration';
import { terminusHealthCheckModuleForRootAsyncOptions } from './integrations/terminus-health-check-integration.configuration';
import { webhookModuleForRootAsyncOptions } from './integrations/webhook-integration.configuration';

export const FEATURE_MODULE_IMPORTS = [
  NestjsPinoLoggerModule.forRoot(),
  TerminusHealthCheckModule.forRootAsync(
    terminusHealthCheckModuleForRootAsyncOptions()
  ),
  PrismaToolsModule.forRoot(),
  // redis cache
  MainKeyvModule,
  // minio
  MainMinioModule,
  ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
  FilesModule.forRootAsync(filesModuleForRootAsyncOptions()),
  TwoFactorModule.forRoot(),
  NotificationsModule.forRootAsync(notificationsModuleForRootAsyncOptions()),
  WebhookModule.forRootAsync(webhookModuleForRootAsyncOptions()),
  SsoModule.forRootAsync(ssoModuleForRootAsyncOptions()),
  AppModule.forRoot(),
];

export const { FeatureModule } = createNestModule({
  moduleName: 'FeatureModule',
  imports: FEATURE_MODULE_IMPORTS,
});
