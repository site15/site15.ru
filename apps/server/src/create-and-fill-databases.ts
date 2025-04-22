import { isInfrastructureMode } from '@nestjs-mod/common';
import {
  createDatabaseHandler,
  PG_CREATE_DB_DEFAULT_CONFIG,
} from 'pg-create-db';
import { migrateHandler, PG_FLYWAY_DEFAULT_MIGRATE_CONFIG } from 'pg-flyway';

export async function createAndFillDatabases() {
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
