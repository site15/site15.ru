import {
  NOTIFICATIONS_FEATURE,
  NOTIFICATIONS_FOLDER,
} from '@nestjs-mod-sso/notifications';
import { SSO_FEATURE, SSO_FOLDER } from '@nestjs-mod-sso/sso';
import {
  TWO_FACTOR_FEATURE,
  TWO_FACTOR_FOLDER,
} from '@nestjs-mod-sso/two-factor';
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-sso/webhook';
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
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
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
  // two-factor
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: TWO_FACTOR_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(rootFolder, TWO_FACTOR_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: TWO_FACTOR_FEATURE,
      migrationsFolder: join(
        rootFolder,
        TWO_FACTOR_FOLDER,
        'src',
        'migrations'
      ),
      nxProjectJsonFile: join(rootFolder, TWO_FACTOR_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  // notify
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: NOTIFICATIONS_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(
        rootFolder,
        NOTIFICATIONS_FOLDER,
        PROJECT_JSON_FILE
      ),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: NOTIFICATIONS_FEATURE,
      migrationsFolder: join(
        rootFolder,
        NOTIFICATIONS_FOLDER,
        'src',
        'migrations'
      ),
      nxProjectJsonFile: join(
        rootFolder,
        NOTIFICATIONS_FOLDER,
        PROJECT_JSON_FILE
      ),
    },
  }),
  // webhook
  DockerComposePostgreSQL.forFeatureAsync({
    featureModuleName: WEBHOOK_FEATURE,
    featureConfiguration: {
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
    },
  }),
  PgFlyway.forRoot({
    staticConfiguration: {
      featureName: WEBHOOK_FEATURE,
      migrationsFolder: join(rootFolder, WEBHOOK_FOLDER, 'src', 'migrations'),
      nxProjectJsonFile: join(rootFolder, WEBHOOK_FOLDER, PROJECT_JSON_FILE),
    },
  }),
];
