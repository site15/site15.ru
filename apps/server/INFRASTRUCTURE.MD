# server
> Version: 1.15.0

Boilerplate for creating application on NestJS and Angular
## System modules

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`applicationPackageJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/apps/server/package.json```|
|`packageJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/package.json```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/apps/server/project.json```|
|`envFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer.

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`bufferLogs`|**optional**|```true```|

### TerminusHealthCheckModule
Terminus integration provides readiness/liveness health checks for NestJS-mod (Wrapper for https://www.npmjs.com/package/@nestjs/terminus)

#### Shared providers
`TerminusHealthCheckService`

#### Shared imports
`TerminusModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`standardHealthIndicators`|**optional**|[ ```{"name":"memory_heap"}```, ```{"name":"database_webhook"}```, ```{"name":"database_sso"}```, ```{"name":"database_two-factor"}```, ```{"name":"database_notifications"}``` ]|

## Core modules

### PrismaToolsModule
#### Shared providers
`PrismaToolsService`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_PRISMA_TOOLS_USE_FILTERS']`|**optional**|```true```|
|`paginationInitialPage`|`obj['paginationInitialPage']`, `process.env['SERVER_PRISMA_TOOLS_PAGINATION_INITIAL_PAGE']`|**optional**|```1```|
|`paginationPerPageSteps`|`obj['paginationPerPageSteps']`, `process.env['SERVER_PRISMA_TOOLS_PAGINATION_PER_PAGE_STEPS']`|**optional**|-|
|`paginationPerPage`|`obj['paginationPerPage']`, `process.env['SERVER_PRISMA_TOOLS_PAGINATION_PER_PAGE']`|**optional**|```5```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(auth)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

#### Static configuration(auth)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```auth```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**isNotEmpty** (prismaModule should not be empty)|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/project.json```|

### KeyvModule
Simple key-value storage with support for multiple backends, and a consistent interface for NestJS-mod (Wrapper for https://www.npmjs.com/package/keyv)

#### Shared providers
`KeyvService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`url`|`obj['url']`, `process.env['SERVER_KEYV_URL']`|**optional**|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`storeFactoryByEnvironmentUrl`|**optional**|```storeFactoryByEnvironmentUrl```|

### MinioModule
Minio client for NestJS-mod (Wrapper for https://www.npmjs.com/package/nestjs-minio)

#### Shared providers
`MinioService`, `MinioFilesService`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioServerHost`|`obj['minioServerHost']`, `process.env['SERVER_MINIO_SERVER_HOST']`|**isNotEmpty** (minioServerHost should not be empty)|```localhost```|
|`minioServerPort`|`obj['minioServerPort']`, `process.env['SERVER_MINIO_SERVER_PORT']`|**optional**|```9000```|
|`minioAccessKey`|`obj['minioAccessKey']`, `process.env['SERVER_MINIO_ACCESS_KEY']`|**isNotEmpty** (minioAccessKey should not be empty)|```FWGmrAGaeMKM```|
|`minioSecretKey`|`obj['minioSecretKey']`, `process.env['SERVER_MINIO_SECRET_KEY']`|**isNotEmpty** (minioSecretKey should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|
|`minioUseSSL`|`obj['minioUseSSL']`, `process.env['SERVER_MINIO_USE_SSL']`|**optional**|```false```|
|`minioDefaultUserId`|`obj['minioDefaultUserId']`, `process.env['SERVER_MINIO_DEFAULT_USER_ID']`|**optional**|```default```|

### ValidationModule
#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_VALIDATION_USE_PIPES']`|**optional**|```false```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_VALIDATION_USE_FILTERS']`|**optional**|```true```|

### SsoModule
#### Shared providers
`SsoService`, `SsoUsersService`, `SsoCookieService`, `SsoEventsService`, `SsoPasswordService`, `SsoCacheService`, `SsoTokensService`, `SsoProjectService`, `SsoAdminService`, `JwtService`

#### Shared imports
`KeyvModule`, `PrismaModule`, `PrismaToolsModule`, `TranslatesModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`twoFactorCodeGenerate`|**optional**|```twoFactorCodeGenerate```|
|`twoFactorCodeValidate`|**optional**|```twoFactorCodeValidate```|
|`sendNotification`|**optional**|```sendNotification```|
|`defaultPublicProjects`|**optional**|[ ```{"name":"Beijing","nameLocale":{"ru":"Пекин"},"clientId":"Jq6GQ6Rzz6x8HNOD4x2Hc2eM0cfiCVUzGfsi","clientSecret":"X6nk0OZXQJboSEfugnH35e9oSeg5RFlV0DQprtYyYDQjNli9mA"}```, ```{"name":"Moscow","nameLocale":{"ru":"Москва"},"clientId":"OceX08HGZ89PTkPpg9KDk5ErY1uMfDcfFKkw","clientSecret":"VJztpDIwvqG6IkTVEIDEw1Ed2Wu5oHu6zfBe7CCJFrCtyWO2Yv"}```, ```{"name":"USA","nameLocale":{"ru":"США"},"clientId":"4OGD25Rmn3W3MP0kMd7c90rGP1WwK8u4wL1w","clientSecret":"qm8nc9MgKyvd6Hgl3jY5BjgDFSBqNvxcu6o52kDjIC168OsM1R"}``` ]|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_SSO_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_SSO_USE_FILTERS']`|**optional**|```true```|
|`templatesVarSsoServerUrl`|`obj['templatesVarSsoServerUrl']`, `process.env['SERVER_SSO_TEMPLATES_VAR_SSO_SERVER_URL']`|**isNotEmpty** (templatesVarSsoServerUrl should not be empty)|```http://localhost```|
|`userAvailableRoles`|`obj['userAvailableRoles']`, `process.env['SERVER_SSO_USER_AVAILABLE_ROLES']`|**optional**|[ ```admin```, ```manager```, ```user``` ]|
|`userDefaultRoles`|`obj['userDefaultRoles']`, `process.env['SERVER_SSO_USER_DEFAULT_ROLES']`|**optional**|[ ```user``` ]|
|`adminDefaultRoles`|`obj['adminDefaultRoles']`, `process.env['SERVER_SSO_ADMIN_DEFAULT_ROLES']`|**optional**|[ ```admin``` ]|
|`managerDefaultRoles`|`obj['managerDefaultRoles']`, `process.env['SERVER_SSO_MANAGER_DEFAULT_ROLES']`|**optional**|[ ```manager``` ]|
|`jwtSecretKey`|`obj['jwtSecretKey']`, `process.env['SERVER_SSO_JWT_SECRET_KEY']`|**optional**|```AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ```|
|`jwtAccessTokenExpiresIn`|`obj['jwtAccessTokenExpiresIn']`, `process.env['SERVER_SSO_JWT_ACCESS_TOKEN_EXPIRES_IN']`|**isNotEmpty** (jwtAccessTokenExpiresIn should not be empty)|```30m```|
|`jwtRefreshTokenExpiresIn`|`obj['jwtRefreshTokenExpiresIn']`, `process.env['SERVER_SSO_JWT_REFRESH_TOKEN_EXPIRES_IN']`|**isNotEmpty** (jwtRefreshTokenExpiresIn should not be empty)|```24h```|
|`adminSecret`|`obj['adminSecret']`, `process.env['SERVER_SSO_ADMIN_SECRET']`|**optional**|```VfKSfPPljhHBXCEohnitursmgDxfAyiD```|
|`defaultClientName`|`obj['defaultClientName']`, `process.env['SERVER_SSO_DEFAULT_CLIENT_NAME']`|**optional**|```default```|
|`defaultClientId`|`obj['defaultClientId']`, `process.env['SERVER_SSO_DEFAULT_CLIENT_ID']`|**optional**|```KzMRNEZTetzatIgQPVSDYfeGyaZrbLzkcxNc```|
|`defaultClientSecret`|`obj['defaultClientSecret']`, `process.env['SERVER_SSO_DEFAULT_CLIENT_SECRET']`|**optional**|```qaHkVpAtUVIpDdLXMlAOzsBfMRJblWoHpXguYQRBuSEBpGKbWt```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`mutateController`|**optional**|```mutateController```|

### NotificationsModule
#### Shared providers
`NotificationsService`

#### Shared imports
`PrismaModule`, `PrismaToolsModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`checkAccessValidator`|**optional**|```checkAccessValidator```|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_NOTIFICATIONS_USE_FILTERS']`|**optional**|```true```|
|`mailTransport`|`obj['mailTransport']`, `process.env['SERVER_NOTIFICATIONS_MAIL_TRANSPORT']`|**optional**|-|
|`mailDefaultSenderName`|`obj['mailDefaultSenderName']`, `process.env['SERVER_NOTIFICATIONS_MAIL_DEFAULT_SENDER_NAME']`|**optional**|-|
|`mailDefaultSenderEmail`|`obj['mailDefaultSenderEmail']`, `process.env['SERVER_NOTIFICATIONS_MAIL_DEFAULT_SENDER_EMAIL']`|**optional**|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`guards`|**optional**|-|
|`mutateController`|**optional**|```mutateController```|

## Feature modules

### AppModule
### WebhookModule
#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`HttpModule`, `PrismaModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"app-demo.create","description":"Event that will be triggered after creation","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.update","description":"Event that will trigger after the update","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}```, ```{"eventName":"app-demo.delete","description":"Event that will fire after deletion","example":{"id":"e4be9194-8c41-4058-bf70-f52a30bccbeb","name":"demo name","createdAt":"2024-10-02T18:49:07.992Z","updatedAt":"2024-10-02T18:49:07.992Z"}}``` ]|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|
|`searchTenantIdInHeaders`|`obj['searchTenantIdInHeaders']`, `process.env['SERVER_WEBHOOK_SEARCH_TENANT_ID_IN_HEADERS']`|**optional**|```false```|
|`searchUserIdInHeaders`|`obj['searchUserIdInHeaders']`, `process.env['SERVER_WEBHOOK_SEARCH_USER_ID_IN_HEADERS']`|**optional**|```false```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|
|`superAdminExternalUserId`|`obj['superAdminExternalUserId']`, `process.env['SERVER_WEBHOOK_SUPER_ADMIN_EXTERNAL_USER_ID']`|**optional**|```248ec37f-628d-43f0-8de2-f58da037dd0f```|

## Integration modules

### DefaultNestApplicationListener
Default NestJS application listener.

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`port`|`obj['port']`, `process.env['SERVER_PORT']`|**optional**|```3000```|
|`hostname`|`obj['hostname']`, `process.env['SERVER_HOSTNAME']`|**optional**|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`mode`|**optional**|```silent```|
|`preListen`|**optional**|```preListen```|

## Infrastructure modules

### Pm2
Production process manager for Node.JS applications with a built-in load balancer for NestJS-mod (Generator ecosystem.config.json for https://www.npmjs.com/package/pm2)

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`ecosystemConfigFile`|**isNotEmpty** (ecosystemConfigFile should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/ecosystem.config.json```|
|`applicationScriptFile`|**isNotEmpty** (applicationScriptFile should not be empty)|```dist/apps/server/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dockerComposeFile`|**isNotEmpty** (dockerComposeFile should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/apps/server/docker-compose.yml```|

#### Modules that use feature configuration
##### Feature module name: SERVER_POSTGRE_SQL

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-postgre-sql":{"image":"bitnami/postgresql:15.5.0","container_name":"server-postgre-sql","volumes":["server-postgre-sql-volume:/bitnami/postgresql"],"ports":["5432:5432"],"networks":["server-network"],"healthcheck":{"test":["CMD-SHELL","pg_isready -U postgres"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-postgre-sql-volume":{"name":"server-postgre-sql-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_REDIS

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-redis":{"image":"bitnami/redis:7.4.1","container_name":"server-redis","volumes":["server-redis-volume:/bitnami/redis/data"],"ports":["6379:6379"],"networks":["server-network"],"environment":{"REDIS_DATABASE":"0","REDIS_PASSWORD":"CHmeOQrZWUHwgahrfzsrzuREOxgAENsC","REDIS_DISABLE_COMMANDS":"FLUSHDB,FLUSHALL","REDIS_IO_THREADS":2,"REDIS_IO_THREADS_DO_READS":"yes"},"keysOfEnvironmentsWithStaticValue":["disableCommands","featureName","image","ioThreads","ioThreadsDoReads","networks"],"healthcheck":{"test":["CMD-SHELL","redis-cli --no-auth-warning -a $$REDIS_PASSWORD ping | grep PONG"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-redis-volume":{"name":"server-redis-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_MINIO

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-minio":{"image":"bitnami/minio:2024.11.7","container_name":"server-minio","volumes":["server-minio-volume:/bitnami/minio/data"],"ports":["9000:9000","9001:9001"],"networks":["server-network"],"environment":{"MINIO_ROOT_USER":"FWGmrAGaeMKM","MINIO_ROOT_PASSWORD":"QatVJuLoZRARlJguoZMpoKvZMJHzvuOR"},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","nginxBucketsLocations","nginxConfigContent","nginxConfigFolder","nginxLogsFolder"],"healthcheck":{"test":["CMD-SHELL","mc","ready","local"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-minio-volume":{"name":"server-minio-volume"}}```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/apps/server/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|```true```|
|`style`|**optional**|```pretty```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`rootDatabaseUrl`|`obj['rootDatabaseUrl']`, `process.env['SERVER_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|```postgres://postgres:postgres_password@localhost:5432/postgres?schema=public```|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature configuration
##### Feature module name: sso

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/sso/project.json```|

#### Modules that use feature configuration
##### Feature module name: two-factor

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/two-factor/project.json```|

#### Modules that use feature configuration
##### Feature module name: notifications

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Modules that use feature configuration
##### Feature module name: webhook

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/feature/webhook/project.json```|

#### Modules that use feature configuration
##### Feature module name: auth

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/nestjs-mod/nestjs-mod-sso/libs/core/auth/project.json```|

#### Modules that use feature environments
##### Feature module name: sso

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Modules that use feature environments
##### Feature module name: two-factor

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Modules that use feature environments
##### Feature module name: notifications

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Modules that use feature environments
##### Feature module name: webhook

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Modules that use feature environments
##### Feature module name: auth

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_AUTH_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://auth:auth_password@localhost:5432/auth?schema=public```|

### DockerComposeRedis
The open-source, in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. (Generator for redis in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`redisUrl`|`obj['redisUrl']`, `process.env['SERVER_REDIS_URL']`|**isNotEmpty** (redisUrl should not be empty)|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/redis:7.4.1```|

### DockerComposeMinio
MinIO is a high-performance, S3 compatible object storage. (Generator for minio in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioRootUser`|`obj['minioRootUser']`, `process.env['SERVER_MINIO_ROOT_USER']`|**isNotEmpty** (minioRootUser should not be empty)|```FWGmrAGaeMKM```|
|`minioRootPassword`|`obj['minioRootPassword']`, `process.env['SERVER_MINIO_ROOT_PASSWORD']`|**isNotEmpty** (minioRootPassword should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/minio:2024.11.7```|
