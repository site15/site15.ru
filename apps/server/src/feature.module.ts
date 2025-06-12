import KeyvRedis from '@keyv/redis';
import { SsoModule } from '@nestjs-mod-sso/sso';
import { createNestModule, isInfrastructureMode } from '@nestjs-mod/common';
import { FilesModule } from '@nestjs-mod/files';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { NotificationsModule } from '@nestjs-mod/notifications';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { TwoFactorModule } from '@nestjs-mod/two-factor';
import { ValidationModule } from '@nestjs-mod/validation';
import { WebhookModule } from '@nestjs-mod/webhook';
import { createClient } from 'redis';
import { AppModule } from './app/app.module';
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
  KeyvModule.forRoot({
    staticConfiguration: {
      storeFactoryByEnvironmentUrl: (uri) => {
        return isInfrastructureMode()
          ? undefined
          : [new KeyvRedis(createClient({ url: uri }))];
      },
    },
  }),
  // minio
  MinioModule.forRoot({
    staticConfiguration: { region: 'eu-central-1' },
    staticEnvironments: {
      minioUseSSL: 'false',
    },
  }),
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
