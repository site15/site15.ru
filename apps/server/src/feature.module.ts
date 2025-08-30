import KeyvRedis from '@keyv/redis';
import { createNestModule, isInfrastructureMode } from '@nestjs-mod/common';
import { FilesModule } from '@nestjs-mod/files';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { NotificationsModule } from '@nestjs-mod/notifications';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { TWO_FACTOR_FEATURE, TwoFactorModule } from '@nestjs-mod/two-factor';
import { ValidationModule } from '@nestjs-mod/validation';
import { WebhookModule } from '@nestjs-mod/webhook';
import { MetricsModule } from '@site15/metrics';
import { APP_DATA_TWO_FACTOR_TIMEOUT, SsoModule, SsoUsersService } from '@site15/sso';
import { createClient } from 'redis';
import { AppModule } from './app/app.module';
import { filesModuleForRootAsyncOptions } from './integrations/minio-files-integration.configuration';
import { notificationsModuleForRootAsyncOptions } from './integrations/notifications-integration.configuration';
import { ssoModuleForRootAsyncOptions } from './integrations/sso-integration.configuration';
import { terminusHealthCheckModuleForRootAsyncOptions } from './integrations/terminus-health-check-integration.configuration';
import { webhookModuleForRootAsyncOptions } from './integrations/webhook-integration.configuration';

export const FEATURE_MODULE_IMPORTS = [
  NestjsPinoLoggerModule.forRoot(),
  TerminusHealthCheckModule.forRootAsync(terminusHealthCheckModuleForRootAsyncOptions()),
  PrismaToolsModule.forRoot(),
  // redis cache
  KeyvModule.forRoot({
    staticConfiguration: {
      storeFactoryByEnvironmentUrl: (uri) => {
        return isInfrastructureMode() ? undefined : [new KeyvRedis(createClient({ url: uri }))];
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
  TwoFactorModule.forRootAsync({
    imports: [SsoModule.forFeature({ featureModuleName: TWO_FACTOR_FEATURE })],
    inject: [SsoUsersService],
    configurationFactory: (ssoUsersService: SsoUsersService) => ({
      getTimeoutValue: async (options) => {
        if (options) {
          const ssoUser = await ssoUsersService.getById({
            id: options.twoFactorUser.externalUserId,
            tenantId: options.twoFactorUser.externalTenantId,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const appData = (ssoUser.appData as any) || {};
          const appDataTwoFactorTimeout = +appData[APP_DATA_TWO_FACTOR_TIMEOUT];
          if (appDataTwoFactorTimeout && !isNaN(appDataTwoFactorTimeout)) {
            return appDataTwoFactorTimeout;
          }
        }
        return 15 * 60 * 1000;
      },
    }),
  }),
  NotificationsModule.forRootAsync(notificationsModuleForRootAsyncOptions()),
  WebhookModule.forRootAsync(webhookModuleForRootAsyncOptions()),
  MetricsModule.forRoot(),
  SsoModule.forRootAsync(ssoModuleForRootAsyncOptions()),
  AppModule.forRoot(),
];

export const { FeatureModule } = createNestModule({
  moduleName: 'FeatureModule',
  imports: FEATURE_MODULE_IMPORTS,
});
