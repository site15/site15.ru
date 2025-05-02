# server
> Version: 1.0.7

Single Sign-On on NestJS and Angular with webhooks and social authorization
## System modules

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`applicationPackageJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/apps/server/package.json```|
|`packageJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/package.json```|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/apps/server/project.json```|
|`envFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/.env```|

### DefaultNestApplicationInitializer
Default NestJS application initializer.

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`bufferLogs`|**optional**|```true```|

## Feature modules

### NestjsPinoLoggerModule
Pino logger for NestJS-mod (Wrapper for https://www.npmjs.com/package/nestjs-pino)

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

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```webhook```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/project.json```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```notifications```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`prismaModule`|**optional**|Promise|
|`featureName`|**optional**|```two-factor```|
|`schemaFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`binaryTargets`|**optional**|[ ```native```, ```rhel-openssl-3.0.x```, ```linux-musl-openssl-3.0.x```, ```linux-musl``` ]|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/project.json```|

### KeyvModule
Simple key-value storage with support for multiple backends, and a consistent interface for NestJS-mod (Wrapper for https://www.npmjs.com/package/keyv)

#### Shared providers
`KeyvService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`url`|`obj['url']`, `process.env['SERVER_KEYV_URL']`|**optional**|-|

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
|`minioServerHost`|`obj['minioServerHost']`, `process.env['SERVER_MINIO_SERVER_HOST']`|**isNotEmpty** (minioServerHost should not be empty)|-|
|`minioServerPort`|`obj['minioServerPort']`, `process.env['SERVER_MINIO_SERVER_PORT']`|**optional**|```9000```|
|`minioAccessKey`|`obj['minioAccessKey']`, `process.env['SERVER_MINIO_ACCESS_KEY']`|**isNotEmpty** (minioAccessKey should not be empty)|-|
|`minioSecretKey`|`obj['minioSecretKey']`, `process.env['SERVER_MINIO_SECRET_KEY']`|**isNotEmpty** (minioSecretKey should not be empty)|-|
|`minioUseSSL`|`obj['minioUseSSL']`, `process.env['SERVER_MINIO_USE_SSL']`|**optional**|```true```|
|`minioDefaultUserId`|`obj['minioDefaultUserId']`, `process.env['SERVER_MINIO_DEFAULT_USER_ID']`|**optional**|```default```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`region`|**optional**|```eu-central-1```|

### ValidationModule
#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_VALIDATION_USE_PIPES']`|**optional**|```false```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_VALIDATION_USE_FILTERS']`|**optional**|```true```|

### FilesModule
#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`getFromDownloadUrlWithoutBucketNames`|**optional**|```getFromDownloadUrlWithoutBucketNames```|
|`getPresignedUrls`|**optional**|```getPresignedUrls```|
|`deleteFile`|**optional**|```deleteFile```|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`filesDefaultUserId`|`obj['filesDefaultUserId']`, `process.env['SERVER_FILES_FILES_DEFAULT_USER_ID']`|**optional**|```default```|

### TwoFactorModule
#### Shared providers
`TwoFactorService`, `TwoFactorEventsService`

#### Shared imports
`PrismaModule`, `PrismaToolsModule`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_TWO_FACTOR_USE_FILTERS']`|**optional**|```true```|

### NotificationsModule
#### Shared providers
`NotificationsService`

#### Shared imports
`PrismaModule`, `PrismaToolsModule`, `WebhookModule`

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

### WebhookModule
#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`HttpModule`, `PrismaModule`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_WEBHOOK_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_WEBHOOK_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SERVER_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SERVER_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|
|`cacheTTL`|`obj['cacheTTL']`, `process.env['SERVER_WEBHOOK_CACHE_TTL']`|**optional**|```15000```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`guards`|**optional**|-|
|`mutateController`|**optional**|```mutateController```|

#### Modules that use feature configuration
##### Feature module name: files

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"files.delete","description":"Event that fires after a file is deleted","example":{"bucketName":"images","downloadUrl":"/files/images-file-id.jpg","objectName":"images-file-id","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab"}}``` ]|

#### Modules that use feature configuration
##### Feature module name: notifications

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"notifications.create","description":"Event that fires after a notification is created","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","createdAt":"2025-05-02T08:20:59.799Z","updatedAt":"2025-05-02T08:20:59.799Z"}}```, ```{"eventName":"notifications.update","description":"Event that fires after a notification is updated","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","createdAt":"2025-05-02T08:20:59.799Z","updatedAt":"2025-05-02T08:20:59.799Z"}}```, ```{"eventName":"notifications.sent","description":"Event that fires after a notification is sent","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","createdAt":"2025-05-02T08:20:59.799Z","updatedAt":"2025-05-02T08:20:59.799Z"}}```, ```{"eventName":"notifications.error","description":"Event that occurs when there is an error sending a notification","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","attempt":2,"error":"Error object","used":false,"createdAt":"2025-05-02T08:20:59.799Z","updatedAt":"2025-05-02T08:20:59.799Z"}}``` ]|

#### Modules that use feature configuration
##### Feature module name: sso

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"sso.sign-up","description":"An event that is triggered after a new user registers","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.sign-in","description":"An event that is triggered after a user login","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.complete-sign-up","description":"An event that is triggered after complete a new user registers","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.sign-out","description":"An event that is triggered after a user logout","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.forgot-password","description":"An event that is triggered after a user call forgot password method","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.complete-forgot-password","description":"An event that is triggered after a user calls to confirm a forgotten password change","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.update-profile","description":"An event that fires after user information is updated.","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2025-05-02T08:20:59.962Z","createdAt":"2025-05-02T08:20:59.962Z","email":"user@example.com","emailVerifiedAt":"2025-05-02T08:20:59.962Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2025-05-02T08:20:59.962Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2025-05-02T08:20:59.962Z","roles":"user","updatedAt":"2025-05-02T08:20:59.962Z","username":"nickname","lang":"en","timezone":0}}``` ]|

### SsoModule
#### Shared providers
`SsoService`, `SsoUsersService`, `SsoCookieService`, `SsoEventsService`, `SsoPasswordService`, `SsoCacheService`, `SsoTokensService`, `SsoProjectService`, `SsoTemplatesService`, `JwtService`, `SsoAsyncLocalStorageContext`, `SsoTimezoneService`

#### Shared imports
`KeyvModule`, `PrismaModule`, `PrismaToolsModule`, `TranslatesModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`twoFactorCodeGenerate`|**optional**|```twoFactorCodeGenerate```|
|`twoFactorCodeValidate`|**optional**|```twoFactorCodeValidate```|
|`sendNotification`|**optional**|```sendNotification```|
|`checkAccessValidator`|**optional**|```checkAccessValidator```|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SERVER_SSO_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SERVER_SSO_USE_FILTERS']`|**optional**|```true```|
|`useInterceptors`|`obj['useInterceptors']`, `process.env['SERVER_SSO_USE_INTERCEPTORS']`|**optional**|```true```|
|`usePipes`|`obj['usePipes']`, `process.env['SERVER_SSO_USE_PIPES']`|**optional**|```true```|
|`serverUrl`|`obj['serverUrl']`, `process.env['SERVER_SSO_SERVER_URL']`|**isNotEmpty** (serverUrl should not be empty)|-|
|`clientUrl`|`obj['clientUrl']`, `process.env['SERVER_SSO_CLIENT_URL']`|**isNotEmpty** (clientUrl should not be empty)|-|
|`adminSecret`|`obj['adminSecret']`, `process.env['SERVER_SSO_ADMIN_SECRET']`|**optional**|-|
|`adminEmail`|`obj['adminEmail']`, `process.env['SERVER_SSO_ADMIN_EMAIL']`|**optional**|```admin@example.com```|
|`adminUsername`|`obj['adminUsername']`, `process.env['SERVER_SSO_ADMIN_USERNAME']`|**isNotEmpty** (adminUsername should not be empty)|```admin```|
|`adminPassword`|`obj['adminPassword']`, `process.env['SERVER_SSO_ADMIN_PASSWORD']`|**optional**|-|
|`userAvailableRoles`|`obj['userAvailableRoles']`, `process.env['SERVER_SSO_USER_AVAILABLE_ROLES']`|**optional**|[ ```admin```, ```manager```, ```user``` ]|
|`userDefaultRoles`|`obj['userDefaultRoles']`, `process.env['SERVER_SSO_USER_DEFAULT_ROLES']`|**optional**|[ ```user``` ]|
|`adminDefaultRoles`|`obj['adminDefaultRoles']`, `process.env['SERVER_SSO_ADMIN_DEFAULT_ROLES']`|**optional**|[ ```admin``` ]|
|`managerDefaultRoles`|`obj['managerDefaultRoles']`, `process.env['SERVER_SSO_MANAGER_DEFAULT_ROLES']`|**optional**|[ ```manager``` ]|
|`jwtSecretKey`|`obj['jwtSecretKey']`, `process.env['SERVER_SSO_JWT_SECRET_KEY']`|**optional**|```AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ```|
|`jwtAccessTokenExpiresIn`|`obj['jwtAccessTokenExpiresIn']`, `process.env['SERVER_SSO_JWT_ACCESS_TOKEN_EXPIRES_IN']`|**optional**|```30m```|
|`jwtRefreshTokenExpiresIn`|`obj['jwtRefreshTokenExpiresIn']`, `process.env['SERVER_SSO_JWT_REFRESH_TOKEN_EXPIRES_IN']`|**optional**|```24h```|
|`cacheTTL`|`obj['cacheTTL']`, `process.env['SERVER_SSO_CACHE_TTL']`|**optional**|```15000```|
|`defaultPublicProjects`|`obj['defaultPublicProjects']`, `process.env['SERVER_SSO_DEFAULT_PUBLIC_PROJECTS']`|**optional**|-|
|`defaultProject`|`obj['defaultProject']`, `process.env['SERVER_SSO_DEFAULT_PROJECT']`|**optional**|-|
|`disableEmailVerification`|`obj['disableEmailVerification']`, `process.env['SERVER_SSO_DISABLE_EMAIL_VERIFICATION']`|**optional**|```true```|
|`googleOauthClientId`|`obj['googleOauthClientId']`, `process.env['SERVER_SSO_GOOGLE_OAUTH_CLIENT_ID']`|**optional**|-|
|`googleOauthClientSecretKey`|`obj['googleOauthClientSecretKey']`, `process.env['SERVER_SSO_GOOGLE_OAUTH_CLIENT_SECRET_KEY']`|**optional**|-|

### AppModule
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
|`ecosystemConfigFile`|**isNotEmpty** (ecosystemConfigFile should not be empty)|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/ecosystem.config.json```|
|`applicationScriptFile`|**isNotEmpty** (applicationScriptFile should not be empty)|```dist/apps/server/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dockerComposeFile`|**isNotEmpty** (dockerComposeFile should not be empty)|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/apps/server/docker-compose.yml```|

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
|`services`|**optional**|```{"server-redis":{"image":"bitnami/redis:7.4.1","container_name":"server-redis","volumes":["server-redis-volume:/bitnami/redis/data"],"ports":["6379:6379"],"networks":["server-network"],"environment":{"REDIS_DISABLE_COMMANDS":"FLUSHDB,FLUSHALL","REDIS_IO_THREADS":2,"REDIS_IO_THREADS_DO_READS":"yes"},"keysOfEnvironmentsWithStaticValue":["disableCommands","featureName","image","ioThreads","ioThreadsDoReads","networks"],"healthcheck":{"test":["CMD-SHELL","redis-cli ping | grep PONG"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-redis-volume":{"name":"server-redis-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_MINIO

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-minio":{"image":"bitnami/minio:2024.11.7","container_name":"server-minio","volumes":["server-minio-volume:/bitnami/minio/data"],"ports":["9000:9000","9001:9001"],"networks":["server-network"],"environment":{},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","nginxBucketsLocations","nginxConfigContent","nginxConfigFolder","nginxLogsFolder"],"healthcheck":{"test":["CMD-SHELL","mc","ready","local"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"server-minio-volume":{"name":"server-minio-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SERVER_MAILDEV

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"server-maildev":{"image":"maildev/maildev:2.2.1","container_name":"server-maildev","ports":["1025:1025","1080:1080"],"networks":["server-network"],"environment":{"MAILDEV_SMTP_PORT":1025,"MAILDEV_WEB_PORT":1080},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","smtpPort","webPort"],"healthcheck":{"test":"wget -O - http://localhost:${MAILDEV_WEB_PORT}${MAILDEV_BASE_PATHNAME}/healthz || exit 1","interval":"10s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"server-network":{"driver":"bridge"}}```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/apps/server/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|```true```|
|`style`|**optional**|```pretty```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`rootDatabaseUrl`|`obj['rootDatabaseUrl']`, `process.env['SERVER_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|-|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature configuration
##### Feature module name: sso

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/sso/project.json```|

#### Modules that use feature configuration
##### Feature module name: two-factor

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/two-factor/project.json```|

#### Modules that use feature configuration
##### Feature module name: notifications

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/notifications/project.json```|

#### Modules that use feature configuration
##### Feature module name: webhook

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/runner/work/nestjs-mod-sso/nestjs-mod-sso/libs/core/webhook/project.json```|

#### Modules that use feature environments
##### Feature module name: sso

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature environments
##### Feature module name: two-factor

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature environments
##### Feature module name: notifications

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature environments
##### Feature module name: webhook

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SERVER_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

### DockerComposeRedis
The open-source, in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. (Generator for redis in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`redisUrl`|`obj['redisUrl']`, `process.env['SERVER_REDIS_URL']`|**isNotEmpty** (redisUrl should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/redis:7.4.1```|

### DockerComposeMinio
MinIO is a high-performance, S3 compatible object storage. (Generator for minio in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioRootUser`|`obj['minioRootUser']`, `process.env['SERVER_MINIO_ROOT_USER']`|**isNotEmpty** (minioRootUser should not be empty)|-|
|`minioRootPassword`|`obj['minioRootPassword']`, `process.env['SERVER_MINIO_ROOT_PASSWORD']`|**isNotEmpty** (minioRootPassword should not be empty)|-|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```bitnami/minio:2024.11.7```|

### DockerComposeMaildev
MailDev is a simple way to test your projects generated email during development, with an easy to use web interface that runs on your machine. (Generator for maildev in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`maildevMailDirectory`|`obj['maildevMailDirectory']`, `process.env['SERVER_MAILDEV_MAIL_DIRECTORY']`|**optional**|-|
|`maildevHttps`|`obj['maildevHttps']`, `process.env['SERVER_MAILDEV_HTTPS']`|**optional**|-|
|`maildevHttpsKey`|`obj['maildevHttpsKey']`, `process.env['SERVER_MAILDEV_HTTPS_KEY']`|**optional**|-|
|`maildevHttpsCert`|`obj['maildevHttpsCert']`, `process.env['SERVER_MAILDEV_HTTPS_CERT']`|**optional**|-|
|`maildevIp`|`obj['maildevIp']`, `process.env['SERVER_MAILDEV_IP']`|**optional**|-|
|`maildevOutgoingHost`|`obj['maildevOutgoingHost']`, `process.env['SERVER_MAILDEV_OUTGOING_HOST']`|**optional**|-|
|`maildevOutgoingPort`|`obj['maildevOutgoingPort']`, `process.env['SERVER_MAILDEV_OUTGOING_PORT']`|**optional**|-|
|`maildevOutgoingUser`|`obj['maildevOutgoingUser']`, `process.env['SERVER_MAILDEV_OUTGOING_USER']`|**optional**|-|
|`maildevOutgoingPass`|`obj['maildevOutgoingPass']`, `process.env['SERVER_MAILDEV_OUTGOING_PASS']`|**optional**|**hidden**|
|`maildevOutgoingSecure`|`obj['maildevOutgoingSecure']`, `process.env['SERVER_MAILDEV_OUTGOING_SECURE']`|**optional**|-|
|`maildevAutoRelay`|`obj['maildevAutoRelay']`, `process.env['SERVER_MAILDEV_AUTO_RELAY']`|**optional**|-|
|`maildevAutoRelayRules`|`obj['maildevAutoRelayRules']`, `process.env['SERVER_MAILDEV_AUTO_RELAY_RULES']`|**optional**|-|
|`maildevIncomingUser`|`obj['maildevIncomingUser']`, `process.env['SERVER_MAILDEV_INCOMING_USER']`|**optional**|-|
|`maildevIncomingPass`|`obj['maildevIncomingPass']`, `process.env['SERVER_MAILDEV_INCOMING_PASS']`|**optional**|**hidden**|
|`maildevIncomingSecure`|`obj['maildevIncomingSecure']`, `process.env['SERVER_MAILDEV_INCOMING_SECURE']`|**optional**|-|
|`maildevIncomingCert`|`obj['maildevIncomingCert']`, `process.env['SERVER_MAILDEV_INCOMING_CERT']`|**optional**|-|
|`maildevIncomingKey`|`obj['maildevIncomingKey']`, `process.env['SERVER_MAILDEV_INCOMING_KEY']`|**optional**|-|
|`maildevWebIp`|`obj['maildevWebIp']`, `process.env['SERVER_MAILDEV_WEB_IP']`|**optional**|-|
|`maildevWebUser`|`obj['maildevWebUser']`, `process.env['SERVER_MAILDEV_WEB_USER']`|**optional**|-|
|`maildevWebPass`|`obj['maildevWebPass']`, `process.env['SERVER_MAILDEV_WEB_PASS']`|**optional**|**hidden**|
|`maildevBasePathname`|`obj['maildevBasePathname']`, `process.env['SERVER_MAILDEV_BASE_PATHNAME']`|**optional**|-|
|`maildevDisableWeb`|`obj['maildevDisableWeb']`, `process.env['SERVER_MAILDEV_DISABLE_WEB']`|**optional**|-|
|`maildevHideExtensions`|`obj['maildevHideExtensions']`, `process.env['SERVER_MAILDEV_HIDE_EXTENSIONS']`|**optional**|-|
