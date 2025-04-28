import KeyvRedis from '@keyv/redis';
import { FilesModule } from '@nestjs-mod-sso/files';
import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_FOLDER,
  NotificationsModule,
} from '@nestjs-mod-sso/notifications';
import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import { SSO_FEATURE, SSO_FOLDER, SsoModule } from '@nestjs-mod-sso/sso';
import {
  TWO_FACTOR_FEATURE,
  TWO_FACTOR_FOLDER,
  TwoFactorModule,
} from '@nestjs-mod-sso/two-factor';
import { ValidationModule } from '@nestjs-mod-sso/validation';
import {
  WEBHOOK_FEATURE,
  WEBHOOK_FOLDER,
  WebhookModule,
} from '@nestjs-mod-sso/webhook';
import {
  createNestModule,
  isInfrastructureMode,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { join } from 'path';
import { createClient } from 'redis';
import { AppModule } from './app/app.module';
import { rootFolder } from './environments/environment';
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
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/webhook-client`),
      addMigrationScripts: false,
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),

      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
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
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/sso-client`),
      addMigrationScripts: false,
      nxProjectJsonFile: join(rootFolder, SSO_FOLDER, PROJECT_JSON_FILE),

      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
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
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/two-factor-client`),
      addMigrationScripts: false,
      nxProjectJsonFile: join(rootFolder, TWO_FACTOR_FOLDER, PROJECT_JSON_FILE),

      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
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
      prismaModule: isInfrastructureMode()
        ? import(`@nestjs-mod/prisma`)
        : import(`@prisma/notifications-client`),
      addMigrationScripts: false,
      nxProjectJsonFile: join(
        rootFolder,
        NOTIFICATIONS_FOLDER,
        PROJECT_JSON_FILE
      ),

      binaryTargets: [
        'native',
        'rhel-openssl-3.0.x',
        'linux-musl-openssl-3.0.x',
        'linux-musl',
      ],
    },
  }),
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
  MinioModule.forRoot(),
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
