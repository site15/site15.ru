process.env.TZ = 'UTC';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import KeyvRedis from '@keyv/redis';
import { AUTH_FEATURE, AUTH_FOLDER, AuthModule } from '@nestjs-mod-sso/auth';
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
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
} from '@nestjs-mod/common';
import {
  DOCKER_COMPOSE_FILE,
  DockerCompose,
  DockerComposeMaildev,
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createClient } from 'redis';
import { AppModule } from './app/app.module';
import { appFolder, rootFolder } from './environments/environment';
import { authModuleForRootAsyncOptions } from './integrations/auth-integration.configuration';
import { filesModuleForRootAsyncOptions } from './integrations/minio-files-integration.configuration';
import { notificationsModuleForRootAsyncOptions } from './integrations/notifications-integration.configuration';
import { ssoModuleForRootAsyncOptions } from './integrations/sso-integration.configuration';
import { terminusHealthCheckModuleForRootAsyncOptions } from './integrations/terminus-health-check-integration.configuration';
import {
  createDatabaseHandler,
  PG_CREATE_DB_DEFAULT_CONFIG,
} from 'pg-create-db';
import { migrateHandler, PG_FLYWAY_DEFAULT_MIGRATE_CONFIG } from 'pg-flyway';

async function createAndFillDatabases() {
  if (isInfrastructureMode()) {
    return;
  }
  const appEnvKeys = [
    'SERVER_WEBHOOK_DATABASE_URL',
    'SERVER_AUTH_DATABASE_URL',
    'SERVER_NOTIFICATIONS_DATABASE_URL',
    'SERVER_SSO_DATABASE_URL',
    'SERVER_TWO_FACTOR_DATABASE_URL',
  ];
  const appKeys = ['webhook', 'auth', 'notifications', 'sso', 'two-factor'];
  const appHistoryTables = [
    '__migrations_webhook',
    '__migrations_auth',
    '__migrations_notifications',
    '__migrations_sso',
    '__migrations_two_factor',
  ];
  const rootEnvKey = 'SERVER_ROOT_DATABASE_URL';

  for (let index = 0; index < appEnvKeys.length; index++) {
    const appEnvKey = appEnvKeys[index];
    const appKey = appKeys[index];
    const appHistoryTable = appHistoryTables[index];

    if (process.env[appEnvKey] && process.env[rootEnvKey]) {
      await createDatabaseHandler({
        ...PG_CREATE_DB_DEFAULT_CONFIG,
        appDatabaseUrl: process.env[appEnvKey],
        rootDatabaseUrl: process.env[rootEnvKey],
      });
      await migrateHandler({
        ...PG_FLYWAY_DEFAULT_MIGRATE_CONFIG,
        databaseUrl: process.env[appEnvKey],
        historyTable: appHistoryTable,
        locations: `./libs/core/${appKey}/src/migrations`,
      });
    }
  }
}

createAndFillDatabases().then(() =>
  bootstrapNestApplication({
    project: {
      name: 'server',
      description: 'Boilerplate for creating application on NestJS and Angular',
    },
    modules: {
      system: [
        ProjectUtils.forRoot({
          staticConfiguration: {
            applicationPackageJsonFile: join(appFolder, PACKAGE_JSON_FILE),
            packageJsonFile: join(rootFolder, PACKAGE_JSON_FILE),
            nxProjectJsonFile: join(appFolder, PROJECT_JSON_FILE),
            envFile: join(rootFolder, '.env'),
            printAllApplicationEnvs: true,
          },
        }),
        DefaultNestApplicationInitializer.forRoot({
          staticConfiguration: { bufferLogs: true },
        }),
        // NestjsPinoLoggerModule.forRoot(),
        TerminusHealthCheckModule.forRootAsync(
          terminusHealthCheckModuleForRootAsyncOptions()
        ),
        DefaultNestApplicationListener.forRoot({
          staticConfiguration: {
            // When running in infrastructure mode, the backend server does not start.
            mode: isInfrastructureMode() ? 'silent' : 'listen',
            async preListen(options) {
              if (options.app) {
                options.app.setGlobalPrefix('api');
                options.app.use(cookieParser());

                const swaggerConf = new DocumentBuilder()
                  .addBearerAuth()
                  .build();
                const document = SwaggerModule.createDocument(
                  options.app,
                  swaggerConf
                );
                SwaggerModule.setup('swagger', options.app, document);

                options.app.useWebSocketAdapter(new WsAdapter(options.app));

                if (isInfrastructureMode()) {
                  writeFileSync(
                    join(rootFolder, 'app-swagger.json'),
                    JSON.stringify(document)
                  );
                }
              }
            },
          },
        }),
      ],
      core: [
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
            nxProjectJsonFile: join(
              rootFolder,
              WEBHOOK_FOLDER,
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
        // auth
        PrismaModule.forRoot({
          contextName: AUTH_FEATURE,
          staticConfiguration: {
            featureName: AUTH_FEATURE,
            schemaFile: join(
              rootFolder,
              AUTH_FOLDER,
              'src',
              'prisma',
              PRISMA_SCHEMA_FILE
            ),
            prismaModule: isInfrastructureMode()
              ? import(`@nestjs-mod/prisma`)
              : import(`@prisma/auth-client`),
            addMigrationScripts: false,
            nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
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
            nxProjectJsonFile: join(
              rootFolder,
              TWO_FACTOR_FOLDER,
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
        AuthModule.forRootAsync(authModuleForRootAsyncOptions()),
        FilesModule.forRootAsync(filesModuleForRootAsyncOptions()),
        TwoFactorModule.forRoot(),
        NotificationsModule.forRootAsync(
          notificationsModuleForRootAsyncOptions()
        ),
        WebhookModule.forRootAsync({
          staticEnvironments: {
            searchUserIdInHeaders: false,
            searchTenantIdInHeaders: false,
          },
          imports: [
            // need for work global auth guards
            AuthModule.forFeature({ featureModuleName: AUTH_FEATURE }),
            PrismaModule.forFeature({
              featureModuleName: WEBHOOK_FEATURE,
              contextName: AUTH_FEATURE,
            }),
          ],
          configuration: { syncMode: false },
        }),
        SsoModule.forRootAsync(ssoModuleForRootAsyncOptions()),
      ],
      feature: [AppModule.forRoot()],
      infrastructure: [
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
            nxProjectJsonFile: join(
              rootFolder,
              TWO_FACTOR_FOLDER,
              PROJECT_JSON_FILE
            ),
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
            nxProjectJsonFile: join(
              rootFolder,
              TWO_FACTOR_FOLDER,
              PROJECT_JSON_FILE
            ),
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
            nxProjectJsonFile: join(
              rootFolder,
              WEBHOOK_FOLDER,
              PROJECT_JSON_FILE
            ),
          },
        }),
        PgFlyway.forRoot({
          staticConfiguration: {
            featureName: WEBHOOK_FEATURE,
            migrationsFolder: join(
              rootFolder,
              WEBHOOK_FOLDER,
              'src',
              'migrations'
            ),
            nxProjectJsonFile: join(
              rootFolder,
              WEBHOOK_FOLDER,
              PROJECT_JSON_FILE
            ),
          },
        }),
        // auth
        DockerComposePostgreSQL.forFeatureAsync({
          featureModuleName: AUTH_FEATURE,
          featureConfiguration: {
            nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
          },
        }),
        PgFlyway.forRoot({
          staticConfiguration: {
            featureName: AUTH_FEATURE,
            migrationsFolder: join(
              rootFolder,
              AUTH_FOLDER,
              'src',
              'migrations'
            ),
            nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
          },
        }),
      ],
    },
  })
);
