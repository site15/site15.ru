import { FilesModule } from '@nestjs-mod-sso/files';
import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_FOLDER,
  NotificationsModule,
  NotificationsPrismaSdk,
} from '@nestjs-mod-sso/notifications';
import {
  SSO_FEATURE,
  SSO_FOLDER,
  SsoModule,
  SsoPrismaSdk,
} from '@nestjs-mod-sso/sso';
import {
  TWO_FACTOR_FEATURE,
  TWO_FACTOR_FOLDER,
  TwoFactorModule,
  TwoFactorPrismaSdk,
} from '@nestjs-mod-sso/two-factor';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
  WebhookPrismaSdk,
} from '@nestjs-mod-sso/webhook';
import { createNestModule, PROJECT_JSON_FILE } from '@nestjs-mod/common';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { PrismaToolsModule } from '@nestjs-mod/prisma-tools';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { ValidationModule } from '@nestjs-mod/validation';
import { PrismaPg } from '@prisma/adapter-pg';
import { join } from 'path';
import { AppModule } from './app/app.module';
import {
  MainKeyvModule,
  MainMinioModule,
  rootFolder,
} from './environments/environment';
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
  // webhook
  PrismaModule.forRoot({
    contextName: WEBHOOK_FEATURE,
    staticConfiguration: {
      featureName: WEBHOOK_FEATURE,
      schemaFile: join(
        rootFolder,
        WEBHOOK_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),

      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new WebhookPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      output: join(
        rootFolder,
        WEBHOOK_FOLDER,
        'src',
        'lib',
        'generated',
        'prisma-client'
      ),
    },
  }),
  // sso
  PrismaModule.forRoot({
    contextName: SSO_FEATURE,
    staticConfiguration: {
      featureName: SSO_FEATURE,
      schemaFile: join(
        rootFolder,
        SSO_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),
      nxProjectJsonFile: join(rootFolder, SSO_FOLDER, PROJECT_JSON_FILE),

      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new SsoPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      output: join(
        rootFolder,
        SSO_FOLDER,
        'src',
        'lib',
        'generated',
        'prisma-client'
      ),
    },
  }),
  // two-factor
  PrismaModule.forRoot({
    contextName: TWO_FACTOR_FEATURE,
    staticConfiguration: {
      featureName: TWO_FACTOR_FEATURE,
      schemaFile: join(
        rootFolder,
        TWO_FACTOR_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),

      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new TwoFactorPrismaSdk.PrismaClient({
          adapter,
          ...otherOoptions,
        });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      output: join(
        rootFolder,
        TWO_FACTOR_FOLDER,
        'src',
        'lib',
        'generated',
        'prisma-client'
      ),
    },
  }),
  // notify
  PrismaModule.forRoot({
    contextName: NOTIFICATIONS_FEATURE,
    staticConfiguration: {
      featureName: NOTIFICATIONS_FEATURE,
      schemaFile: join(
        rootFolder,
        NOTIFICATIONS_FOLDER,
        'src',
        'prisma',
        PRISMA_SCHEMA_FILE
      ),

      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new NotificationsPrismaSdk.PrismaClient({
          adapter,
          ...otherOoptions,
        });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      output: join(
        rootFolder,
        NOTIFICATIONS_FOLDER,
        'src',
        'lib',
        'generated',
        'prisma-client'
      ),
    },
  }),
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
