process.env.TZ = 'UTC';

import { AUTH_FEATURE, AUTH_FOLDER } from '@nestjs-mod-sso/auth';
import {
  NotificationsModule,
  NotificationsService,
  SendNotificationOptionsType,
} from '@nestjs-mod-sso/notifications';
import { PrismaToolsModule } from '@nestjs-mod-sso/prisma-tools';
import {
  SsoModule,
  SsoSendNotificationOptions,
  SsoTwoFactorCodeGenerateOptions,
  SsoTwoFactorCodeValidateOptions,
} from '@nestjs-mod-sso/sso';
import { TwoFactorModule, TwoFactorService } from '@nestjs-mod-sso/two-factor';
import { ValidationModule } from '@nestjs-mod-sso/validation';
import { WEBHOOK_FEATURE, WEBHOOK_FOLDER } from '@nestjs-mod-sso/webhook';
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
  DockerComposeMinio,
  DockerComposePostgreSQL,
  DockerComposeRedis,
} from '@nestjs-mod/docker-compose';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { PRISMA_SCHEMA_FILE, PrismaModule } from '@nestjs-mod/prisma';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { APP_FEATURE } from './app/app.constants';
import {
  appFolder,
  AppModule,
  coreModules,
  infrastructuresModules,
  MainKeyvModule,
  MainMinioModule,
  MainTerminusHealthCheckModule,
  MainWebhookModule,
  rootFolder,
} from './environments/environment';

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
      MainTerminusHealthCheckModule,
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          async preListen(options) {
            if (options.app) {
              options.app.setGlobalPrefix('api');

              const swaggerConf = new DocumentBuilder().addBearerAuth().build();
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
      PrismaModule.forRoot({
        contextName: APP_FEATURE,
        staticConfiguration: {
          featureName: APP_FEATURE,
          schemaFile: join(
            appFolder,
            'src',
            'prisma',
            `${APP_FEATURE}-${PRISMA_SCHEMA_FILE}`
          ),
          prismaModule: isInfrastructureMode()
            ? import(`@nestjs-mod/prisma`)
            : import(`@prisma/app-client`),
          addMigrationScripts: false,
          binaryTargets: [
            'native',
            'rhel-openssl-3.0.x',
            'linux-musl-openssl-3.0.x',
          ],
        },
      }),
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
          ],
        },
      }),
      // todo: remove
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
            : import(`@nestjs-mod/prisma`),
          addMigrationScripts: false,
          nxProjectJsonFile: join(rootFolder, AUTH_FOLDER, PROJECT_JSON_FILE),
          binaryTargets: [
            'native',
            'rhel-openssl-3.0.x',
            'linux-musl-openssl-3.0.x',
          ],
        },
      }),
      ...coreModules,
      MainKeyvModule,
      MainMinioModule,
      ValidationModule.forRoot({ staticEnvironments: { usePipes: false } }),
    ],
    feature: [
      SsoModule.forRootAsync({
        imports: [
          TwoFactorModule.forFeature({ featureModuleName: APP_FEATURE }),
          NotificationsModule.forFeature({ featureModuleName: APP_FEATURE }),
        ],
        inject: [TwoFactorService, NotificationsService],
        configurationFactory: (
          twoFactorService: TwoFactorService,
          notificationsService: NotificationsService
        ) => {
          return {
            sendNotification: async (options: SsoSendNotificationOptions) => {
              return await notificationsService.sendNotification({
                externalTenantId: options.projectId,
                html: options.html,
                operationName: 'any',
                recipients: options.recipientUsers.map((recipientUser) => ({
                  externalUserId: recipientUser.id,
                  email: recipientUser.email || undefined,
                  phone: recipientUser.phone || undefined,
                  name:
                    recipientUser.firstname && recipientUser.lastname
                      ? `${recipientUser.firstname} ${recipientUser.lastname}`
                      : undefined,
                })),
                subject: options.subject,
                type: options.recipientUsers[0].phoneVerifiedAt
                  ? SendNotificationOptionsType.phone
                  : SendNotificationOptionsType.email,
                sender: options.senderUser
                  ? {
                      externalUserId: options.senderUser.id,
                      email: options.senderUser.email || undefined,
                      phone: options.senderUser.phone || undefined,
                      name:
                        options.senderUser.firstname &&
                        options.senderUser.lastname
                          ? `${options.senderUser.firstname} ${options.senderUser.lastname}`
                          : undefined,
                    }
                  : undefined,
                text: options.text,
              });
            },
            twoFactorCodeGenerate: async (
              options: SsoTwoFactorCodeGenerateOptions
            ) => {
              const generatedCode = await twoFactorService.generateCode({
                externalTenantId: options.user.projectId,
                externalUserId: options.user.id,
                operationName: 'any',
                type: options.user.phoneVerifiedAt ? 'phone' : 'email',
              });
              return generatedCode.code;
            },
            twoFactorCodeValidate: async (
              options: SsoTwoFactorCodeValidateOptions
            ) => {
              const validatedCode = await twoFactorService.validateCode({
                externalTenantId: options.projectId,
                operationName: 'any',
                code: options.code,
              });
              return {
                userId: validatedCode.twoFactorUser.id,
              };
            },
          };
        },
      }),
      AppModule.forRoot(),
      MainWebhookModule,
    ],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(appFolder, 'INFRASTRUCTURE.MD'),
          skipEmptySettings: true,
          style: 'pretty',
        },
      }),
      Pm2.forRoot({
        configuration: {
          ecosystemConfigFile: join(rootFolder, ECOSYSTEM_CONFIG_FILE),
          applicationScriptFile: join('dist/apps/server/main.js'),
        },
      }),
      DockerCompose.forRoot({
        configuration: {
          dockerComposeFileVersion: '3',
          dockerComposeFile: join(appFolder, DOCKER_COMPOSE_FILE),
        },
      }),
      DockerComposePostgreSQL.forRoot(),
      DockerComposePostgreSQL.forFeature({
        featureModuleName: APP_FEATURE,
      }),
      ...infrastructuresModules,
      DockerComposeRedis.forRoot({
        staticConfiguration: { image: 'bitnami/redis:7.4.1' },
      }),
      DockerComposeMinio.forRoot({
        staticConfiguration: { image: 'bitnami/minio:2024.11.7' },
      }),
      PgFlyway.forRoot({
        staticConfiguration: {
          featureName: APP_FEATURE,
          migrationsFolder: join(appFolder, 'src', 'migrations'),
        },
      }),
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
    ],
  },
});
