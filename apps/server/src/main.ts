process.env.TZ = 'UTC';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import {
  bootstrapNestApplication,
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  isInfrastructureMode,
  PACKAGE_JSON_FILE,
  PROJECT_JSON_FILE,
  ProjectUtils,
} from '@nestjs-mod/common';
import { FILES_EXTRA_MODELS } from '@nestjs-mod/files';
import { NOTIFICATIONS_EXTRA_MODELS } from '@nestjs-mod/notifications';
import { VALIDATION_EXTRA_MODELS } from '@nestjs-mod/validation';
import { WEBHOOK_EXTRA_MODELS } from '@nestjs-mod/webhook';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { METRICS_EXTRA_MODELS } from '@site15/metrics';
import { SSO_EXTRA_MODELS } from '@site15/sso';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'fs';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { createAndFillDatabases, fillAllNeedDatabaseEnvsFromOneMain } from './create-and-fill-databases';
import { appFolder, rootFolder } from './environments/environment';
import { FEATURE_MODULE_IMPORTS, FeatureModule } from './feature.module';
import { INFRASTRUCTURE_MODULE_IMPORTS } from './infrastructure.module';
import { replaceEnvs } from './replace-envs';

fillAllNeedDatabaseEnvsFromOneMain();

/**
 * NestJS-mod way for run application
 */
bootstrapNestApplication({
  project: {
    name: 'site15',
    description: 'Personal website of Khamitov Ilshat (EndyKaufman)',
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
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'silent' : 'listen',
          async preListen(options) {
            if (options.app) {
              options.app.use(cookieParser());

              const swaggerConf = new DocumentBuilder().addBearerAuth().build();
              const document = SwaggerModule.createDocument(options.app, swaggerConf, {
                extraModels: [
                  ...FILES_EXTRA_MODELS,
                  ...NOTIFICATIONS_EXTRA_MODELS,
                  ...SSO_EXTRA_MODELS,
                  ...VALIDATION_EXTRA_MODELS,
                  ...WEBHOOK_EXTRA_MODELS,
                  ...METRICS_EXTRA_MODELS,
                ],
              });
              SwaggerModule.setup('swagger', options.app, document);

              options.app.useWebSocketAdapter(new WsAdapter(options.app));

              if (isInfrastructureMode()) {
                writeFileSync(join(rootFolder, 'swagger.json'), JSON.stringify(document));
              } else {
                await replaceEnvs();
                await createAndFillDatabases();
              }
            }
          },
        },
      }),
    ],
    feature: FEATURE_MODULE_IMPORTS,
    infrastructure: INFRASTRUCTURE_MODULE_IMPORTS,
  },
});
