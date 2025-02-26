CREATE TABLE IF NOT EXISTS "SsoProject"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "clientId" text NOT NULL,
    "clientSecret" text NOT NULL,
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

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_PROJECTS__CLIENT_ID" ON "SsoProject"("clientId");

CREATE TABLE IF NOT EXISTS "SsoUser"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    email varchar(254) NOT NULL,
    phone varchar(254),
    username varchar(254),
    password varchar(254) NOT NULL,
    "roles" varchar(254),
    "firstname" varchar(254),
    "lastname" varchar(254),
    "gender" varchar(1),
    "birthdate" timestamp,
    "picture" text,
    "appData" jsonb,
    "revokedAt" timestamp,
    "emailVerifiedAt" timestamp,
    "phoneVerifiedAt" timestamp,
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

CREATE TABLE IF NOT EXISTS "SsoRefreshSession"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "refreshToken" uuid NOT NULL,
    "userAgent" varchar(254),
    "fingerprint" varchar(254),
    "userIp" varchar(128),
    "expiresIn" bigint,
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

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_SSO_REFRESH_SESSIONS" ON "SsoRefreshSession"("userId", "fingerprint", "projectId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_REFRESH_SESSIONS__PROJECT_ID" ON "SsoRefreshSession"("projectId");

CREATE INDEX IF NOT EXISTS "IDX_SSO_REFRESH_SESSIONS_USER_ID" ON "SsoRefreshSession"("userId", "projectId");

