CREATE TABLE IF NOT EXISTS "SsoTenant"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "slug" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    "nameLocale" jsonb,
    "clientId" varchar(100) NOT NULL,
    "clientSecret" varchar(255) NOT NULL,
    "enabled" boolean NOT NULL,
    "public" boolean NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoTenant"
        ADD CONSTRAINT "PK_SSO_TENANTS" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_TENANTS__PUBLIC" ON "SsoTenant"("public");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_TENANTS__SLUG" ON "SsoTenant"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_TENANTS__CLIENT_ID" ON "SsoTenant"("clientId");

--
CREATE TABLE IF NOT EXISTS "SsoUser"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    email varchar(255) NOT NULL,
    phone varchar(255),
    username varchar(255),
    password varchar(255) NOT NULL,
    "roles" varchar(255),
    "firstname" varchar(255),
    "lastname" varchar(255),
    "gender" varchar(1),
    "birthdate" timestamp,
    "picture" text,
    "appData" jsonb,
    "revokedAt" timestamp,
    "emailVerifiedAt" timestamp,
    "phoneVerifiedAt" timestamp,
    "timezone" double precision,
    "lang" varchar(2),
    "tenantId" uuid NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoUser"
        ADD CONSTRAINT "PK_SSO_USERS" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoUser"
        ADD CONSTRAINT "FK_SSO_USERS__TENANT_ID" FOREIGN KEY("tenantId") REFERENCES "SsoTenant";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_USERS__TENANT_ID" ON "SsoUser"("tenantId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_USERS__EMAIL" ON "SsoUser"("tenantId", email);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_USERS__USERNAME" ON "SsoUser"("tenantId", username);

--
CREATE TABLE IF NOT EXISTS "SsoRefreshSession"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "refreshToken" uuid NOT NULL,
    "userAgent" varchar(255),
    "fingerprint" varchar(255),
    "userIp" varchar(128),
    "expiresAt" timestamp,
    "userData" jsonb,
    "enabled" boolean NOT NULL,
    "userId" uuid NOT NULL,
    "tenantId" uuid NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoRefreshSession"
        ADD CONSTRAINT "PK_SSO_REFRESH_SESSIONS" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoRefreshSession"
        ADD CONSTRAINT "FK_SSO_REFRESH_SESSIONS__TENANT_ID" FOREIGN KEY("tenantId") REFERENCES "SsoTenant";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoRefreshSession"
        ADD CONSTRAINT "FK_SSO_REFRESH_SESSIONS__USER_ID" FOREIGN KEY("userId") REFERENCES "SsoUser";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_REFRESH_SESSIONS" ON "SsoRefreshSession"("tenantId", "userId", "fingerprint")
WHERE
    enabled = TRUE;

CREATE INDEX IF NOT EXISTS "IDX_SSO_REFRESH_SESSIONS__TENANT_ID" ON "SsoRefreshSession"("tenantId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_REFRESH_SESSIONS__USER_ID" ON "SsoRefreshSession"("tenantId", "userId");

--
CREATE TABLE IF NOT EXISTS "SsoEmailTemplate"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "subject" text NOT NULL,
    "subjectLocale" jsonb,
    "text" text NOT NULL,
    "textLocale" jsonb,
    "html" text NOT NULL,
    "htmlLocale" jsonb,
    "operationName" varchar(128),
    "tenantId" uuid NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoEmailTemplate"
        ADD CONSTRAINT "PK_SSO_EMAIL_TEMPLATES" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoEmailTemplate"
        ADD CONSTRAINT "FK_SSO_EMAIL_TEMPLATES__TENANT_ID" FOREIGN KEY("tenantId") REFERENCES "SsoTenant";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_EMAIL_TEMPLATES__TENANT_ID" ON "SsoEmailTemplate"("tenantId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_EMAIL_TEMPLATES__OPERATION_NAME" ON "SsoEmailTemplate"("tenantId", "operationName");

--
CREATE TABLE IF NOT EXISTS "SsoOAuthProvider"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
    "enabled" boolean NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoOAuthProvider"
        ADD CONSTRAINT "PK_SSO_OAUTH_PROVIDER" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_OAUTH_PROVIDER__NAME" ON "SsoOAuthProvider"("name");

--
CREATE TABLE IF NOT EXISTS "SsoOAuthProviderSettings"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
    "value" text NOT NULL,
    "providerId" uuid NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoOAuthProviderSettings"
        ADD CONSTRAINT "PK_SSO_OAUTH_PROVIDER_SETTINGS" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoOAuthProviderSettings"
        ADD CONSTRAINT "FK_SSO_OAUTH_PROVIDER_SETTINGS__PROVIDER_ID" FOREIGN KEY("providerId") REFERENCES "SsoOAuthProvider";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_OAUTH_PROVIDER_SETTINGS__PROVIDER_ID" ON "SsoOAuthProviderSettings"("providerId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_OAUTH_PROVIDER_SETTINGS__NAME" ON "SsoOAuthProviderSettings"("providerId", "name");

--
CREATE TABLE IF NOT EXISTS "SsoOAuthToken"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "grantedAt" timestamp DEFAULT now() NOT NULL,
    "accessToken" varchar(512) NOT NULL,
    "refreshToken" varchar(512),
    "expiresAt" timestamp,
    "tokenType" varchar(255),
    "scope" varchar(512),
    "verificationCode" varchar(512),
    "userId" uuid NOT NULL,
    "tenantId" uuid NOT NULL,
    "providerId" uuid NOT NULL,
    "providerUserId" varchar(512) NOT NULL,
    "providerUserData" jsonb,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoOAuthToken"
        ADD CONSTRAINT "PK_SSO_OAUTH_TOKENS" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoOAuthToken"
        ADD CONSTRAINT "FK_SSO_OAUTH_TOKENS__USER_ID" FOREIGN KEY("userId") REFERENCES "SsoUser";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoOAuthToken"
        ADD CONSTRAINT "FK_SSO_OAUTH_TOKENS__TENANT_ID" FOREIGN KEY("tenantId") REFERENCES "SsoTenant";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "SsoOAuthToken"
        ADD CONSTRAINT "FK_SSO_OAUTH_TOKENS__PROVIDER_ID" FOREIGN KEY("providerId") REFERENCES "SsoOAuthProvider";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_OAUTH_TOKENS__USER_ID" ON "SsoOAuthToken"("userId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_OAUTH_TOKENS__TENANT_ID" ON "SsoOAuthToken"("tenantId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_OAUTH_TOKENS__PROVIDER_ID" ON "SsoOAuthToken"("providerId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_OAUTH_TOKENS__NAME" ON "SsoOAuthToken"("tenantId", "providerId", "userId", "accessToken");

