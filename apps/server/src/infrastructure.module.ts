import { SSO_FEATURE, SSO_FOLDER, SsoPrismaSdk } from '@nestjs-mod-sso/sso';
import {
  InfrastructureMarkdownReportGenerator,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeMaildev,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_FOLDER,
} from '@nestjs-mod/notifications';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TWO_FACTOR_FEATURE, TWO_FACTOR_FOLDER } from '@nestjs-mod/two-factor';
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod/webhook';
import { PrismaPg } from '@prisma/adapter-pg';
import { join } from 'path';
import { appFolder, rootFolder } from './environments/environment';
export const INFRASTRUCTURE_MODULE_IMPORTS = [
  // report
  InfrastructureMarkdownReportGenerator.forRoot({
    staticConfiguration: {
      markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
      skipEmptySettings: true,
      style: 'pretty',
    },
  }),
  // pm2
  Pm2.forRoot({
    configuration: {
      ecosystemConfigFile: join(rootFolder, ECOSYSTEM_CONFIG_FILE),
      applicationScriptFile: join('dist/apps/server/main.js'),
    },
  }),
  // docker compose
  DockerCompose.forRoot({
    configuration: {
      dockerComposeFileVersion: '3',
      dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
    },
  }),
  // postgresql
  DockerComposePostgreSQL.forRoot(),
  // redis
  DockerComposeRedis.forRoot({
    staticConfiguration: { image: 'bitnami/redis:7.4.1' },
  }),
  // minio
  DockerComposeMinio.forRoot({
    staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
  }),
  // maildev
  DockerComposeMaildev.forRoot(),
  // sso
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: SSO_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(rootFolder, SSO_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: SSO_FEATURE,
      migrationsFolder: join(rootFolder, SSO_FOLDER, 'src', 'migrations'),
      nxProjectJsonFile: join(rootFolder, SSO_FOLDER, PROJECT_JSON_FILE),
    },
  }),
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

      provider: 'prisma-client',
      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new SsoPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      moduleFormat: 'cjs',
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
];
