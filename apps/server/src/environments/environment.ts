import KeyvRedis from '@keyv/redis';
import { AUTH_FEATURE } from '@nestjs-mod-sso/auth';
import { SSO_FEATURE, SSO_FOLDER } from '@nestjs-mod-sso/sso';
import { WEBHOOK_FEATURE, WebhookModule } from '@nestjs-mod-sso/webhook';
import {
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
} from '@nestjs-mod/common';
import { DockerComposePostgreSQL } from '@nestjs-mod/docker-compose';
import { KeyvModule } from '@nestjs-mod/keyv';
import { MinioModule } from '@nestjs-mod/minio';
import { PgFlyway } from '@nestjs-mod/pg-flyway';
import {
  InjectPrismaClient,
  PRISMA_SCHEMA_FILE,
  PrismaModule,
} from '@nestjs-mod/prisma';
import {
  TERMINUS_MODULE_NAME,
  TerminusHealthCheckConfiguration,
  TerminusHealthCheckModule,
} from '@nestjs-mod/terminus';
import { Injectable } from '@nestjs/common';
import { MemoryHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaClient as AppPrismaClient } from '@prisma/app-client';
import { PrismaClient as AuthPrismaClient } from '@prisma/auth-client';
import { PrismaClient as SsoPrismaClient } from '@prisma/sso-client';
import { PrismaClient as WebhookPrismaClient } from '@prisma/webhook-client';
import { existsSync } from 'fs';
import { getText } from 'nestjs-translates';
import { join } from 'path';
import { createClient } from 'redis';
import { APP_FEATURE } from '../app/app.constants';
import { SsoAppModule } from '../app/sso-app.module';

let rootFolder = join(__dirname, '..', '..', '..');

if (
  !existsSync(join(rootFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  rootFolder = join(__dirname);
}

let appFolder = join(rootFolder, 'apps', 'server');

if (!existsSync(join(appFolder, PACKAGE_JSON_FILE))) {
  appFolder = join(rootFolder, 'dist', 'apps', 'server');
}

if (
  !existsSync(join(appFolder, PACKAGE_JSON_FILE)) &&
  existsSync(join(__dirname, PACKAGE_JSON_FILE))
) {
  appFolder = join(__dirname);
}

export { appFolder, rootFolder };

export const AppModule = SsoAppModule;

export const MainKeyvModule = KeyvModule.forRoot({
  staticConfiguration: {
    storeFactoryByEnvironmentUrl: (uri) => {
      return isInfrastructureMode()
        ? undefined
        : [new KeyvRedis(createClient({ url: uri }))];
    },
  },
});

export const MainMinioModule = MinioModule.forRoot();

export const MainWebhookModule = WebhookModule.forRootAsync({
  staticEnvironments: { checkHeaders: false },
  configuration: {
    syncMode: false,
    events: [
      {
        eventName: 'app-demo.create',
        description: getText('Event that will be triggered after creation'),
        example: {
          id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
          name: 'demo name',
          createdAt: '2024-10-02T18:49:07.992Z',
          updatedAt: '2024-10-02T18:49:07.992Z',
        },
      },
      {
        eventName: 'app-demo.update',
        description: getText('Event that will trigger after the update'),
        example: {
          id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
          name: 'demo name',
          createdAt: '2024-10-02T18:49:07.992Z',
          updatedAt: '2024-10-02T18:49:07.992Z',
        },
      },
      {
        eventName: 'app-demo.delete',
        description: getText('Event that will fire after deletion'),
        example: {
          id: 'e4be9194-8c41-4058-bf70-f52a30bccbeb',
          name: 'demo name',
          createdAt: '2024-10-02T18:49:07.992Z',
          updatedAt: '2024-10-02T18:49:07.992Z',
        },
      },
    ],
  },
});

@Injectable()
export class PrismaTerminusHealthCheckConfiguration
  implements TerminusHealthCheckConfiguration
{
  standardHealthIndicators = [
    {
      name: 'memory_heap',
      check: () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', 150 * 1024 * 1024),
    },
    {
      name: `database_${APP_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${APP_FEATURE}`,
          this.appPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${AUTH_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${AUTH_FEATURE}`,
          this.authPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${WEBHOOK_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${WEBHOOK_FEATURE}`,
          this.webhookPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
    {
      name: `database_${SSO_FEATURE}`,
      check: () =>
        this.prismaHealthIndicator.pingCheck(
          `database_${SSO_FEATURE}`,
          this.ssoPrismaClient,
          { timeout: 60 * 1000 }
        ),
    },
  ];

  constructor(
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    @InjectPrismaClient(APP_FEATURE)
    private readonly appPrismaClient: AppPrismaClient,
    @InjectPrismaClient(AUTH_FEATURE)
    private readonly authPrismaClient: AuthPrismaClient,
    @InjectPrismaClient(WEBHOOK_FEATURE)
    private readonly webhookPrismaClient: WebhookPrismaClient,
    @InjectPrismaClient(SSO_FEATURE)
    private readonly ssoPrismaClient: SsoPrismaClient
  ) {}
}

export const MainTerminusHealthCheckModule =
  TerminusHealthCheckModule.forRootAsync({
    imports: [
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: APP_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: AUTH_FEATURE,
      }),
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: WEBHOOK_FEATURE,
      }),
      // todo: move to standalone module with forFeature configuration
      PrismaModule.forFeature({
        featureModuleName: TERMINUS_MODULE_NAME,
        contextName: SSO_FEATURE,
      }),
    ],
    configurationClass: PrismaTerminusHealthCheckConfiguration,
  });

export const infrastructuresModules = [
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
];

export const coreModules = [
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
      ],
    },
  }),
];
