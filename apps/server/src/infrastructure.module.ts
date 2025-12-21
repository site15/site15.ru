import { InfrastructureMarkdownReportGenerator, PROJECT_JSON_FILE } from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeMaildev,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { METRICS_FEATURE, METRICS_FOLDER, MetricsPrismaSdk } from '@site15/metrics';
import { SSO_FEATURE, SSO_FOLDER, SsoPrismaSdk } from '@site15/sso';
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
  DockerComposePostgreSQL.forRoot({
    staticConfiguration: { image: 'bitnami/postgresql:latest' },
  }),
  // redis
  DockerComposeRedis.forRoot({
    staticConfiguration: { image: 'bitnami/redis:latest' },
  }),
  // minio
  DockerComposeMinio.forRoot({
    staticConfiguration: { image: 'bitnami/minio:latest' },
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
      schemaFile: join(rootFolder, SSO_FOLDER, 'src', 'prisma', PRISMA_SCHEMA_FILE),
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
      output: join(rootFolder, SSO_FOLDER, 'src', 'lib', 'generated', 'prisma-client'),
    },
  }),
  PrismaModule.forRoot({
    contextName: METRICS_FEATURE,
    staticConfiguration: {
      featureName: METRICS_FEATURE,
      schemaFile: join(rootFolder, METRICS_FOLDER, 'src', 'prisma', PRISMA_SCHEMA_FILE),
      nxProjectJsonFile: join(rootFolder, METRICS_FOLDER, PROJECT_JSON_FILE),

      provider: 'prisma-client',
      prismaClientFactory: async (options) => {
        const { url, ...otherOoptions } = options;
        const adapter = new PrismaPg({ connectionString: url });
        return new MetricsPrismaSdk.PrismaClient({ adapter, ...otherOoptions });
      },
      addMigrationScripts: false,
      previewFeatures: ['queryCompiler', 'driverAdapters'],
      moduleFormat: 'cjs',
      output: join(rootFolder, METRICS_FOLDER, 'src', 'lib', 'generated', 'prisma-client'),
    },
  }),
];
