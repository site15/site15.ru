# site15
> Version: 1.30.1

Personal website of Khamitov Ilshat (EndyKaufman)
## System modules

### ProjectUtils
Utilities for setting global application parameters, such as project name, description, and settings validation parameters.

#### Shared providers
`WrapApplicationOptionsService`, `DotEnvService`, `PackageJsonService`, `ApplicationPackageJsonService`, `GitignoreService`, `NxProjectJsonService`, `ProjectUtilsPatcherService`

#### Static configuration(default)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`applicationPackageJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/apps/server/package.json```|
|`packageJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/package.json```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/apps/server/project.json```|
|`envFile`|**optional**|```/home/endy/Projects/site15/site15.ru/.env```|

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
|`standardHealthIndicators`|**optional**|-|

### PrismaToolsModule
Functions and helpers for work with prisma used in NestJS-mod modules

#### Shared providers
`PrismaToolsService`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_PRISMA_TOOLS_USE_FILTERS']`|**optional**|```true```|
|`paginationInitialPage`|`obj['paginationInitialPage']`, `process.env['SITE_15_PRISMA_TOOLS_PAGINATION_INITIAL_PAGE']`|**optional**|```1```|
|`paginationPerPageSteps`|`obj['paginationPerPageSteps']`, `process.env['SITE_15_PRISMA_TOOLS_PAGINATION_PER_PAGE_STEPS']`|**optional**|-|
|`paginationPerPage`|`obj['paginationPerPage']`, `process.env['SITE_15_PRISMA_TOOLS_PAGINATION_PER_PAGE']`|**optional**|```5```|

### KeyvModule
Simple key-value storage with support for multiple backends, and a consistent interface for NestJS-mod (Wrapper for https://www.npmjs.com/package/keyv)

#### Shared providers
`KeyvService`

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`url`|`obj['url']`, `process.env['SITE_15_KEYV_URL']`|**optional**|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379```|

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
|`minioServerHost`|`obj['minioServerHost']`, `process.env['SITE_15_MINIO_SERVER_HOST']`|**isNotEmpty** (minioServerHost should not be empty)|```localhost```|
|`minioServerPort`|`obj['minioServerPort']`, `process.env['SITE_15_MINIO_SERVER_PORT']`|**optional**|```9000```|
|`minioAccessKey`|`obj['minioAccessKey']`, `process.env['SITE_15_MINIO_ACCESS_KEY']`|**isNotEmpty** (minioAccessKey should not be empty)|```FWGmrAGaeMKM```|
|`minioSecretKey`|`obj['minioSecretKey']`, `process.env['SITE_15_MINIO_SECRET_KEY']`|**isNotEmpty** (minioSecretKey should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|
|`minioUseSSL`|`obj['minioUseSSL']`, `process.env['SITE_15_MINIO_USE_SSL']`|**optional**|```false```|
|`minioDefaultUserId`|`obj['minioDefaultUserId']`, `process.env['SITE_15_MINIO_DEFAULT_USER_ID']`|**optional**|```default```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`region`|**optional**|```eu-central-1```|

### ValidationModule
Validation module with an error filter and a pre-configured validation pipe

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`usePipes`|`obj['usePipes']`, `process.env['SITE_15_VALIDATION_USE_PIPES']`|**optional**|```false```|
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_VALIDATION_USE_FILTERS']`|**optional**|```true```|

### FilesModule
Files module with an error filter, controller and rest-sdk for work with module from other nodejs appliaction

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`getFromDownloadUrlWithoutBucketNames`|**optional**|```getFromDownloadUrlWithoutBucketNames```|
|`getPresignedUrls`|**optional**|```getPresignedUrls```|
|`deleteFile`|**optional**|```deleteFile```|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`filesDefaultUserId`|`obj['filesDefaultUserId']`, `process.env['SITE_15_FILES_FILES_DEFAULT_USER_ID']`|**optional**|```default```|

### TwoFactorModule
Two factor module with an error filter, guard, controller, database migrations and rest-sdk for work with module from other nodejs appliaction

#### Shared providers
`TwoFactorService`, `TwoFactorEventsService`

#### Shared imports
`PrismaModule`, `PrismaToolsModule`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`getTimeoutValue`|**optional**|```getTimeoutValue```|

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_TWO_FACTOR_USE_FILTERS']`|**optional**|```true```|

### NotificationsModule
Notifications module with an error filter, guard, controller, database migrations and rest-sdk for work with module from other nodejs appliaction

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
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_NOTIFICATIONS_USE_FILTERS']`|**optional**|```true```|
|`mailTransport`|`obj['mailTransport']`, `process.env['SITE_15_NOTIFICATIONS_MAIL_TRANSPORT']`|**optional**|```smtp://localhost:1025```|
|`mailDefaultSenderName`|`obj['mailDefaultSenderName']`, `process.env['SITE_15_NOTIFICATIONS_MAIL_DEFAULT_SENDER_NAME']`|**optional**|```Bot```|
|`mailDefaultSenderEmail`|`obj['mailDefaultSenderEmail']`, `process.env['SITE_15_NOTIFICATIONS_MAIL_DEFAULT_SENDER_EMAIL']`|**optional**|```bot@site15.maildev```|

### WebhookModule
Webhook module with an error filter, guard, controller, database migrations and rest-sdk for work with module from other nodejs appliaction

#### Shared providers
`WebhookService`, `WebhookUsersService`

#### Shared imports
`HttpModule`, `PrismaModule`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SITE_15_WEBHOOK_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_WEBHOOK_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SITE_15_WEBHOOK_AUTO_CREATE_USER']`|**optional**|```true```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SITE_15_WEBHOOK_SKIP_GUARD_ERRORS']`|**optional**|```false```|
|`cacheTTL`|`obj['cacheTTL']`, `process.env['SITE_15_WEBHOOK_CACHE_TTL']`|**optional**|```15000```|

#### Modules that use feature configuration
##### Feature module name: files

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"files.delete","description":"Event that fires after a file is deleted","example":{"bucketName":"images","downloadUrl":"/files/images-file-id.jpg","objectName":"images-file-id","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab"}}``` ]|

#### Modules that use feature configuration
##### Feature module name: notifications

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"notifications.create","description":"Event that fires after a notification is created","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","createdAt":"2026-01-27T08:31:55.037Z","updatedAt":"2026-01-27T08:31:55.037Z"}}```, ```{"eventName":"notifications.update","description":"Event that fires after a notification is updated","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","createdAt":"2026-01-27T08:31:55.037Z","updatedAt":"2026-01-27T08:31:55.037Z"}}```, ```{"eventName":"notifications.sent","description":"Event that fires after a notification is sent","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","createdAt":"2026-01-27T08:31:55.037Z","updatedAt":"2026-01-27T08:31:55.037Z"}}```, ```{"eventName":"notifications.error","description":"Event that occurs when there is an error sending a notification","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","html":"<a>Hello {{{firstname}}}</a>","externalTenantId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","operationName":"forget-password","recipientData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+999999999"},"subject":"Some subject of email","type":"phone","context":{"firstname":"Firstname"},"senderData":{"externalUserId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","email":"user@example.com","name":"User Name","phone":"+888888888"},"text":"Hello {{{firstname}}}","recipientGroupId":"77af2745-d972-4e1f-994a-fae8ad71d7ab","attempt":2,"error":"Error object","used":false,"createdAt":"2026-01-27T08:31:55.038Z","updatedAt":"2026-01-27T08:31:55.038Z"}}``` ]|

#### Modules that use feature configuration
##### Feature module name: sso

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`events`|**optional**|[ ```{"eventName":"sso.sign-up","description":"An event that is triggered after a new user registers","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.sign-in","description":"An event that is triggered after a user login","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.complete-sign-up","description":"An event that is triggered after complete a new user registers","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.sign-out","description":"An event that is triggered after a user logout","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.forgot-password","description":"An event that is triggered after a user call forgot password method","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.complete-forgot-password","description":"An event that is triggered after a user calls to confirm a forgotten password change","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}```, ```{"eventName":"sso.update-profile","description":"An event that fires after user information is updated.","example":{"id":"77af2745-d972-4e1f-994a-fae8ad71d7ab","appData":{"custom":"data"},"birthdate":"2026-01-27T08:31:56.896Z","createdAt":"2026-01-27T08:31:56.896Z","email":"user@example.com","emailVerifiedAt":"2026-01-27T08:31:56.896Z","firstname":"Firstname","gender":"m","lastname":"Lastname","phone":"+888888888","phoneVerifiedAt":"2026-01-27T08:31:56.896Z","picture":"http://example.com/image/77af2745-d972-4e1f-994a-fae8ad71d7ab.jpg","revokedAt":"2026-01-27T08:31:56.896Z","roles":"user","updatedAt":"2026-01-27T08:31:56.896Z","username":"nickname","lang":"en","timezone":0}}``` ]|

### MetricsModule
#### Shared providers
`MetricsCacheService`, `MetricsGithubStatisticsSyncService`

#### Shared imports
`KeyvModule`, `PrismaModule`, `PrismaToolsModule`, `TranslatesModule`

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`useGuards`|`obj['useGuards']`, `process.env['SITE_15_METRICS_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_METRICS_USE_FILTERS']`|**optional**|```true```|
|`autoCreateUser`|`obj['autoCreateUser']`, `process.env['SITE_15_METRICS_AUTO_CREATE_USER']`|**optional**|```true```|
|`skipGuardErrors`|`obj['skipGuardErrors']`, `process.env['SITE_15_METRICS_SKIP_GUARD_ERRORS']`|**optional**|```false```|
|`cacheTTL`|`obj['cacheTTL']`, `process.env['SITE_15_METRICS_CACHE_TTL']`|**optional**|```15000```|
|`githubToken`|`obj['githubToken']`, `process.env['SITE_15_METRICS_GITHUB_TOKEN']`|**optional**|-|

### SsoModule
#### Shared providers
`SsoService`, `SsoUsersService`, `SsoCookieService`, `SsoEventsService`, `SsoPasswordService`, `SsoCacheService`, `SsoTokensService`, `SsoTenantService`, `SsoTemplatesService`, `JwtService`, `SsoAsyncLocalStorageContext`, `SsoTimezoneService`

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
|`useGuards`|`obj['useGuards']`, `process.env['SITE_15_SSO_USE_GUARDS']`|**optional**|```true```|
|`useFilters`|`obj['useFilters']`, `process.env['SITE_15_SSO_USE_FILTERS']`|**optional**|```true```|
|`useInterceptors`|`obj['useInterceptors']`, `process.env['SITE_15_SSO_USE_INTERCEPTORS']`|**optional**|```true```|
|`usePipes`|`obj['usePipes']`, `process.env['SITE_15_SSO_USE_PIPES']`|**optional**|```true```|
|`serverUrl`|`obj['serverUrl']`, `process.env['SITE_15_SSO_SERVER_URL']`|**isNotEmpty** (serverUrl should not be empty)|```http://localhost:3000```|
|`clientUrl`|`obj['clientUrl']`, `process.env['SITE_15_SSO_CLIENT_URL']`|**isNotEmpty** (clientUrl should not be empty)|```http://localhost:4200/admin```|
|`adminSecret`|`obj['adminSecret']`, `process.env['SITE_15_SSO_ADMIN_SECRET']`|**optional**|```VfKSfPPljhHBXCEohnitursmgDxfAyiD```|
|`adminEmail`|`obj['adminEmail']`, `process.env['SITE_15_SSO_ADMIN_EMAIL']`|**optional**|```admin@site15.ru```|
|`adminUsername`|`obj['adminUsername']`, `process.env['SITE_15_SSO_ADMIN_USERNAME']`|**isNotEmpty** (adminUsername should not be empty)|```admin```|
|`adminPassword`|`obj['adminPassword']`, `process.env['SITE_15_SSO_ADMIN_PASSWORD']`|**optional**|```SbxcbII7RUvCOe9TDXnKhfRrLJW5cGDA```|
|`userAvailableRoles`|`obj['userAvailableRoles']`, `process.env['SITE_15_SSO_USER_AVAILABLE_ROLES']`|**optional**|[ ```admin```, ```manager```, ```user``` ]|
|`userDefaultRoles`|`obj['userDefaultRoles']`, `process.env['SITE_15_SSO_USER_DEFAULT_ROLES']`|**optional**|[ ```user``` ]|
|`adminDefaultRoles`|`obj['adminDefaultRoles']`, `process.env['SITE_15_SSO_ADMIN_DEFAULT_ROLES']`|**optional**|[ ```admin``` ]|
|`managerDefaultRoles`|`obj['managerDefaultRoles']`, `process.env['SITE_15_SSO_MANAGER_DEFAULT_ROLES']`|**optional**|[ ```manager``` ]|
|`jwtSecretKey`|`obj['jwtSecretKey']`, `process.env['SITE_15_SSO_JWT_SECRET_KEY']`|**optional**|```AcJwUY9AP6FPf8XnfwbSuW7ZjwoaPiFJ```|
|`jwtAccessTokenExpiresIn`|`obj['jwtAccessTokenExpiresIn']`, `process.env['SITE_15_SSO_JWT_ACCESS_TOKEN_EXPIRES_IN']`|**optional**|```30m```|
|`jwtRefreshTokenExpiresIn`|`obj['jwtRefreshTokenExpiresIn']`, `process.env['SITE_15_SSO_JWT_REFRESH_TOKEN_EXPIRES_IN']`|**optional**|```24h```|
|`cacheTTL`|`obj['cacheTTL']`, `process.env['SITE_15_SSO_CACHE_TTL']`|**optional**|```15000```|
|`defaultPublicTenants`|`obj['defaultPublicTenants']`, `process.env['SITE_15_SSO_DEFAULT_PUBLIC_TENANTS']`|**optional**|-|
|`defaultTenant`|`obj['defaultTenant']`, `process.env['SITE_15_SSO_DEFAULT_TENANT']`|**optional**|```{"name":"default","clientId":"KzMRNEZTetzatIgQPVSDYfeGyaZrbLzkcxNc","clientSecret":"qaHkVpAtUVIpDdLXMlAOzsBfMRJblWoHpXguYQRBuSEBpGKbWt","nameLocale":{"ru":"по умолчанию"},"slug":"default"}```|
|`disableEmailVerification`|`obj['disableEmailVerification']`, `process.env['SITE_15_SSO_DISABLE_EMAIL_VERIFICATION']`|**optional**|```true```|
|`googleOauthClientId`|`obj['googleOauthClientId']`, `process.env['SITE_15_SSO_GOOGLE_OAUTH_CLIENT_ID']`|**optional**|```398269279071-8qham4ugutqqcsh220tj73n9u6f0vdbe.apps.googleusercontent.com```|
|`googleOauthClientSecretKey`|`obj['googleOauthClientSecretKey']`, `process.env['SITE_15_SSO_GOOGLE_OAUTH_CLIENT_SECRET_KEY']`|**optional**|```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```|

### AppModule
#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`landingBotToken`|`obj['landingBotToken']`, `process.env['SITE_15_LANDING_BOT_TOKEN']`|**optional**|**hidden**|
|`landingChatId`|`obj['landingChatId']`, `process.env['SITE_15_LANDING_CHAT_ID']`|**optional**|-|
|`devtoApiKey`|`obj['devtoApiKey']`, `process.env['SITE_15_DEVTO_API_KEY']`|**optional**|**hidden**|
|`githubToken`|`obj['githubToken']`, `process.env['SITE_15_GITHUB_TOKEN']`|**optional**|**hidden**|
|`syncAllStatsAfterStart`|`obj['syncAllStatsAfterStart']`, `process.env['SITE_15_SYNC_ALL_STATS_AFTER_START']`|**optional**|-|
|`syncAllStatsByInterval`|`obj['syncAllStatsByInterval']`, `process.env['SITE_15_SYNC_ALL_STATS_BY_INTERVAL']`|**optional**|-|
|`flowControllerUrl`|`obj['flowControllerUrl']`, `process.env['SITE_15_FLOW_CONTROLLER_URL']`|**optional**|```http://locahost:23000/api```|
|`flowControllerApiKey`|`obj['flowControllerApiKey']`, `process.env['SITE_15_FLOW_CONTROLLER_API_KEY']`|**optional**|**hidden**|

## Integration modules

### DefaultNestApplicationListener
Default NestJS application listener.

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`port`|`obj['port']`, `process.env['SITE_15_PORT']`|**optional**|```3000```|
|`hostname`|`obj['hostname']`, `process.env['SITE_15_HOSTNAME']`|**optional**|-|

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
|`ecosystemConfigFile`|**isNotEmpty** (ecosystemConfigFile should not be empty)|```/home/endy/Projects/site15/site15.ru/ecosystem.config.json```|
|`applicationScriptFile`|**isNotEmpty** (applicationScriptFile should not be empty)|```dist/apps/server/main.js```|

### DockerCompose
Docker Compose is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. (Generator docker-compose.yml for https://docs.docker.com/compose)

#### Shared providers
`ManualDockerComposeFeatures`

#### Configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`dockerComposeFile`|**isNotEmpty** (dockerComposeFile should not be empty)|```/home/endy/Projects/site15/site15.ru/apps/server/docker-compose.yml```|

#### Modules that use feature configuration
##### Feature module name: SITE_15_POSTGRE_SQL

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"site-15-postgre-sql":{"image":"public.ecr.aws/bitnami/postgresql:15.10.0","container_name":"site-15-postgre-sql","volumes":["site-15-postgre-sql-volume:/bitnami/postgresql"],"ports":["5432:5432"],"networks":["site-15-network"],"healthcheck":{"test":["CMD-SHELL","pg_isready -U postgres"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"site-15-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"site-15-postgre-sql-volume":{"name":"site-15-postgre-sql-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SITE_15_REDIS

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"site-15-redis":{"image":"public.ecr.aws/bitnami/redis:7.4.1","container_name":"site-15-redis","volumes":["site-15-redis-volume:/bitnami/redis/data"],"ports":["6379:6379"],"networks":["site-15-network"],"environment":{"REDIS_DATABASE":"0","REDIS_PASSWORD":"CHmeOQrZWUHwgahrfzsrzuREOxgAENsC","REDIS_DISABLE_COMMANDS":"FLUSHDB,FLUSHALL","REDIS_IO_THREADS":2,"REDIS_IO_THREADS_DO_READS":"yes"},"keysOfEnvironmentsWithStaticValue":["disableCommands","featureName","image","ioThreads","ioThreadsDoReads","networks"],"healthcheck":{"test":["CMD-SHELL","redis-cli --no-auth-warning -a $$REDIS_PASSWORD ping | grep PONG"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"site-15-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"site-15-redis-volume":{"name":"site-15-redis-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SITE_15_MINIO

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"site-15-minio":{"image":"public.ecr.aws/bitnami/minio:2024.11.7","container_name":"site-15-minio","volumes":["site-15-minio-volume:/bitnami/minio/data"],"ports":["9000:9000","9001:9001"],"networks":["site-15-network"],"environment":{"MINIO_ROOT_USER":"FWGmrAGaeMKM","MINIO_ROOT_PASSWORD":"QatVJuLoZRARlJguoZMpoKvZMJHzvuOR"},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","nginxBucketsLocations","nginxConfigContent","nginxConfigFolder","nginxLogsFolder"],"healthcheck":{"test":["CMD-SHELL","mc","ready","local"],"interval":"5s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"site-15-network":{"driver":"bridge"}}```|
|`volumes`|**optional**|```{"site-15-minio-volume":{"name":"site-15-minio-volume"}}```|

#### Modules that use feature configuration
##### Feature module name: SITE_15_MAILDEV

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`services`|**optional**|```{"site-15-maildev":{"image":"maildev/maildev:2.2.1","container_name":"site-15-maildev","ports":["1025:1025","1080:1080"],"networks":["site-15-network"],"environment":{"MAILDEV_SMTP_PORT":1025,"MAILDEV_WEB_PORT":1080},"keysOfEnvironmentsWithStaticValue":["featureName","image","networks","smtpPort","webPort"],"healthcheck":{"test":"wget -O - http://localhost:${MAILDEV_WEB_PORT}${MAILDEV_BASE_PATHNAME}/healthz || exit 1","interval":"10s","timeout":"5s","retries":5},"tty":true,"restart":"always"}}```|
|`networks`|**optional**|```{"site-15-network":{"driver":"bridge"}}```|

### PgFlyway
PgFlyway - utility for working with database migrations (site: https://www.npmjs.com/package/pg-flyway, preview version only for Postgres)

#### Environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`migrationsFolder`|**isNotEmpty** (migrationsFolder should not be empty)|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/src/migrations```|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/project.json```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```webhook```|
|`provider`|**optional**|```prisma-client```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```notifications```|
|`provider`|**optional**|```prisma-client```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(metrics)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_METRICS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://metrics:metrics_password@localhost:5432/metrics?schema=public```|

#### Static configuration(metrics)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```metrics```|
|`provider`|**optional**|```prisma-client```|
|`moduleFormat`|**optional**|```cjs```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`output`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/src/lib/generated/prisma-client```|
|`provider`|**optional**|```prisma-client```|
|`moduleFormat`|**optional**|```cjs```|
|`previewFeatures`|**optional**|[ ```queryCompiler```, ```driverAdapters``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/project.json```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```two-factor```|
|`provider`|**optional**|```prisma-client```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

### PrismaModule
Next-generation Node.js and TypeScript ORM for NestJS-mod (preview version only for Postgres)

#### Shared providers
`PrismaClientFactoryService`, `PrismaClient`

#### Environments(webhook)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_WEBHOOK_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://webhook:webhook_password@localhost:5432/webhook?schema=public```|

#### Static configuration(webhook)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```webhook```|
|`provider`|**optional**|```prisma-client```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(notifications)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_NOTIFICATIONS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://notifications:notifications_password@localhost:5432/notifications```|

#### Static configuration(notifications)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```notifications```|
|`provider`|**optional**|```prisma-client```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(metrics)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_METRICS_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://metrics:metrics_password@localhost:5432/metrics?schema=public```|

#### Static configuration(metrics)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```metrics```|
|`provider`|**optional**|```prisma-client```|
|`moduleFormat`|**optional**|```cjs```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(sso)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

#### Static configuration(sso)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```sso```|
|`schemaFile`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/src/prisma/schema.prisma```|
|`addMigrationScripts`|**optional**|```false```|
|`output`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/src/lib/generated/prisma-client```|
|`provider`|**optional**|```prisma-client```|
|`moduleFormat`|**optional**|```cjs```|
|`previewFeatures`|**optional**|[ ```queryCompiler```, ```driverAdapters``` ]|
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/project.json```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

#### Environments(two-factor)

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_TWO_FACTOR_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://two_factor:two_factor_password@localhost:5432/two-factor```|

#### Static configuration(two-factor)

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`featureName`|**optional**|```two-factor```|
|`provider`|**optional**|```prisma-client```|
|`prismaClientFactory`|**optional**|```prismaClientFactory```|

### InfrastructureMarkdownReportGenerator
Infrastructure markdown report generator.

#### Shared providers
`DynamicNestModuleMetadataMarkdownReportGenerator`

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`markdownFile`|**optional**|```/home/endy/Projects/site15/site15.ru/apps/server/INFRASTRUCTURE.MD```|
|`skipEmptySettings`|**optional**|```true```|
|`style`|**optional**|```pretty```|

### DockerComposePostgreSQL
PostgreSQL (Postgres) is an open source object-relational database known for reliability and data integrity. ACID-compliant, it supports foreign keys, joins, views, triggers and stored procedures. (Generator for databases in docker-compose.yml for https://github.com/nestjs-mod/nestjs-mod-contrib/tree/master/libs/infrastructure/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`rootDatabaseUrl`|`obj['rootDatabaseUrl']`, `process.env['SITE_15_ROOT_DATABASE_URL']`|**isNotEmpty** (rootDatabaseUrl should not be empty)|```postgres://postgres:postgres_password@localhost:5432/postgres?schema=public```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```public.ecr.aws/bitnami/postgresql:15.10.0```|

#### Feature environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_FEATURE_MODULE_NAME_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|-|

#### Modules that use feature configuration
##### Feature module name: sso

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`nxProjectJsonFile`|**optional**|```/home/endy/Projects/site15/site15.ru/libs/feature/sso/project.json```|

#### Modules that use feature environments
##### Feature module name: sso

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`databaseUrl`|`obj['databaseUrl']`, `process.env['SITE_15_SSO_DATABASE_URL']`|**isNotEmpty** (databaseUrl should not be empty)|```postgres://sso:sso_password@localhost:5432/sso?schema=public```|

### DockerComposeRedis
The open-source, in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. (Generator for redis in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`redisUrl`|`obj['redisUrl']`, `process.env['SITE_15_REDIS_URL']`|**isNotEmpty** (redisUrl should not be empty)|```redis://:CHmeOQrZWUHwgahrfzsrzuREOxgAENsC@localhost:6379```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```public.ecr.aws/bitnami/redis:7.4.1```|

### DockerComposeMinio
MinIO is a high-performance, S3 compatible object storage. (Generator for minio in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`minioRootUser`|`obj['minioRootUser']`, `process.env['SITE_15_MINIO_ROOT_USER']`|**isNotEmpty** (minioRootUser should not be empty)|```FWGmrAGaeMKM```|
|`minioRootPassword`|`obj['minioRootPassword']`, `process.env['SITE_15_MINIO_ROOT_PASSWORD']`|**isNotEmpty** (minioRootPassword should not be empty)|```QatVJuLoZRARlJguoZMpoKvZMJHzvuOR```|

#### Static configuration

| Key    | Constraints | Value |
| ------ | ----------- | ----- |
|`image`|**optional**|```public.ecr.aws/bitnami/minio:2024.11.7```|

### DockerComposeMaildev
MailDev is a simple way to test your projects generated email during development, with an easy to use web interface that runs on your machine. (Generator for maildev in docker-compose.yml for https://www.npmjs.com/package/@nestjs-mod/docker-compose)

#### Static environments

| Key    | Sources | Constraints | Value |
| ------ | ------- | ----------- | ----- |
|`maildevMailDirectory`|`obj['maildevMailDirectory']`, `process.env['SITE_15_MAILDEV_MAIL_DIRECTORY']`|**optional**|-|
|`maildevHttps`|`obj['maildevHttps']`, `process.env['SITE_15_MAILDEV_HTTPS']`|**optional**|-|
|`maildevHttpsKey`|`obj['maildevHttpsKey']`, `process.env['SITE_15_MAILDEV_HTTPS_KEY']`|**optional**|-|
|`maildevHttpsCert`|`obj['maildevHttpsCert']`, `process.env['SITE_15_MAILDEV_HTTPS_CERT']`|**optional**|-|
|`maildevIp`|`obj['maildevIp']`, `process.env['SITE_15_MAILDEV_IP']`|**optional**|-|
|`maildevOutgoingHost`|`obj['maildevOutgoingHost']`, `process.env['SITE_15_MAILDEV_OUTGOING_HOST']`|**optional**|-|
|`maildevOutgoingPort`|`obj['maildevOutgoingPort']`, `process.env['SITE_15_MAILDEV_OUTGOING_PORT']`|**optional**|-|
|`maildevOutgoingUser`|`obj['maildevOutgoingUser']`, `process.env['SITE_15_MAILDEV_OUTGOING_USER']`|**optional**|-|
|`maildevOutgoingPass`|`obj['maildevOutgoingPass']`, `process.env['SITE_15_MAILDEV_OUTGOING_PASS']`|**optional**|**hidden**|
|`maildevOutgoingSecure`|`obj['maildevOutgoingSecure']`, `process.env['SITE_15_MAILDEV_OUTGOING_SECURE']`|**optional**|-|
|`maildevAutoRelay`|`obj['maildevAutoRelay']`, `process.env['SITE_15_MAILDEV_AUTO_RELAY']`|**optional**|-|
|`maildevAutoRelayRules`|`obj['maildevAutoRelayRules']`, `process.env['SITE_15_MAILDEV_AUTO_RELAY_RULES']`|**optional**|-|
|`maildevIncomingUser`|`obj['maildevIncomingUser']`, `process.env['SITE_15_MAILDEV_INCOMING_USER']`|**optional**|-|
|`maildevIncomingPass`|`obj['maildevIncomingPass']`, `process.env['SITE_15_MAILDEV_INCOMING_PASS']`|**optional**|**hidden**|
|`maildevIncomingSecure`|`obj['maildevIncomingSecure']`, `process.env['SITE_15_MAILDEV_INCOMING_SECURE']`|**optional**|-|
|`maildevIncomingCert`|`obj['maildevIncomingCert']`, `process.env['SITE_15_MAILDEV_INCOMING_CERT']`|**optional**|-|
|`maildevIncomingKey`|`obj['maildevIncomingKey']`, `process.env['SITE_15_MAILDEV_INCOMING_KEY']`|**optional**|-|
|`maildevWebIp`|`obj['maildevWebIp']`, `process.env['SITE_15_MAILDEV_WEB_IP']`|**optional**|-|
|`maildevWebUser`|`obj['maildevWebUser']`, `process.env['SITE_15_MAILDEV_WEB_USER']`|**optional**|-|
|`maildevWebPass`|`obj['maildevWebPass']`, `process.env['SITE_15_MAILDEV_WEB_PASS']`|**optional**|**hidden**|
|`maildevBasePathname`|`obj['maildevBasePathname']`, `process.env['SITE_15_MAILDEV_BASE_PATHNAME']`|**optional**|-|
|`maildevDisableWeb`|`obj['maildevDisableWeb']`, `process.env['SITE_15_MAILDEV_DISABLE_WEB']`|**optional**|-|
|`maildevHideExtensions`|`obj['maildevHideExtensions']`, `process.env['SITE_15_MAILDEV_HIDE_EXTENSIONS']`|**optional**|-|
