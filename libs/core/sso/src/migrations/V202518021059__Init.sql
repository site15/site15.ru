CREATE TABLE IF NOT EXISTS "SsoProject"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
    "nameLocale" jsonb,
    "clientId" varchar(100) NOT NULL,
    "clientSecret" varchar(255) NOT NULL,
    "public" boolean NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoProject"
        ADD CONSTRAINT "PK_SSO_PROJECTS" PRIMARY KEY(id);
EXCEPTION
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_PROJECTS__PUBLIC" ON "SsoProject"("public");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_PROJECTS__CLIENT_ID" ON "SsoProject"("clientId");

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
    "projectId" uuid NOT NULL,
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
        ADD CONSTRAINT "FK_SSO_USERS__PROJECT_ID" FOREIGN KEY("projectId") REFERENCES "SsoProject";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_USERS__PROJECT_ID" ON "SsoUser"("projectId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_USERS__EMAIL" ON "SsoUser"(email, "projectId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_USERS__USERNAME" ON "SsoUser"(username, "projectId");

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
    "projectId" uuid NOT NULL,
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
        ADD CONSTRAINT "FK_SSO_REFRESH_SESSIONS__PROJECT_ID" FOREIGN KEY("projectId") REFERENCES "SsoProject";
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

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_REFRESH_SESSIONS" ON "SsoRefreshSession"("userId", "fingerprint", "projectId")
WHERE
    enabled = TRUE;

CREATE INDEX IF NOT EXISTS "IDX_SSO_REFRESH_SESSIONS__PROJECT_ID" ON "SsoRefreshSession"("projectId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_REFRESH_SESSIONS_USER_ID" ON "SsoRefreshSession"("userId", "projectId");

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
    "projectId" uuid NOT NULL,
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
        ADD CONSTRAINT "FK_SSO_EMAIL_TEMPLATES__PROJECT_ID" FOREIGN KEY("projectId") REFERENCES "SsoProject";
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_SSO_EMAIL_TEMPLATES__PROJECT_ID" ON "SsoEmailTemplate"("projectId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_EMAIL_TEMPLATES__OPERATION_NAME" ON "SsoEmailTemplate"("projectId", "operationName");

--
CREATE TABLE IF NOT EXISTS "SsoOAuthProvider"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
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
    "projectId" uuid NOT NULL,
    "providerId" uuid NOT NULL,
    "providerUserId" varchar(512) NOT NULL,
    "providerUserData" jsonb,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    ALTER TABLE "SsoOAuthToken"
        ADD CONSTRAINT "PK_SSO_OAUTH_TOKENS_SETTINGS" PRIMARY KEY(id);
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
        ADD CONSTRAINT "FK_SSO_OAUTH_TOKENS__PROJECT_ID" FOREIGN KEY("projectId") REFERENCES "SsoProject";
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

CREATE INDEX IF NOT EXISTS "IDX_SSO_OAUTH_TOKENS__PROJECT_ID" ON "SsoOAuthToken"("projectId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_OAUTH_TOKENS__PROVIDER_ID" ON "SsoOAuthToken"("providerId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_OAUTH_TOKENS__NAME" ON "SsoOAuthToken"("providerId", "projectId", "userId", "accessToken");

