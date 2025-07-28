DO $$
BEGIN
    CREATE TYPE "MetricsRole" AS enum(
        'Admin',
        'User'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "MetricsUser"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "tenantId" uuid NOT NULL,
    "externalUserId" uuid NOT NULL,
    "userRole" "MetricsRole" NOT NULL,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_METRICS_USER" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_USER" ON "MetricsUser"("tenantId", "externalUserId");

CREATE INDEX IF NOT EXISTS "IDX_METRICS_USER__TENANT_ID" ON "MetricsUser"("tenantId");

CREATE INDEX IF NOT EXISTS "IDX_METRICS_USER__USER_ROLE" ON "MetricsUser"("tenantId", "userRole");

---
-- Migration: Create MetricsGithub-related tables, indexes, and constraints for metrics
-- Using updated styleguide: UUID, varchar, double precision for floats, timestamps, tenantId, constraints outside tables
-- Table: MetricsGithubRepository
CREATE TABLE IF NOT EXISTS "MetricsGithubRepository"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
    "owner" varchar(255) NOT NULL,
    "private" boolean NOT NULL,
    "fork" boolean NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_REPOSITORY__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_REPOSITORY__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubRepository" IS 'GitHub repositories tracked in the system (Metrics)';

COMMENT ON COLUMN "MetricsGithubRepository".id IS 'Primary key: unique repository identifier';

COMMENT ON COLUMN "MetricsGithubRepository"."name" IS 'Repository name';

COMMENT ON COLUMN "MetricsGithubRepository"."owner" IS 'Repository owner login';

COMMENT ON COLUMN "MetricsGithubRepository"."private" IS 'Whether repository is private';

COMMENT ON COLUMN "MetricsGithubRepository"."fork" IS 'Whether repository is a fork';

COMMENT ON COLUMN "MetricsGithubRepository"."createdAt" IS 'Record creation timestamp';

COMMENT ON COLUMN "MetricsGithubRepository"."updatedAt" IS 'Record update timestamp';

COMMENT ON COLUMN "MetricsGithubRepository"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubRepository"
        ADD CONSTRAINT "PK_METRICS_GITHUB_REPOSITORY" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_REPOSITORY__NAME_OWNER" ON "MetricsGithubRepository"("tenantId", "name", "owner");

CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_REPOSITORY__TENANT_ID" ON "MetricsGithubRepository"("tenantId");

-- Table: MetricsGithubMetric
CREATE TABLE IF NOT EXISTS "MetricsGithubMetric"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "repositoryId" uuid NOT NULL,
    "metricName" varchar(255) NOT NULL,
    "metricValue" double precision NOT NULL,
    "recordedAt" timestamp NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_METRIC__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_METRIC__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubMetric" IS 'Metrics collected from GitHub repositories (Metrics)';

COMMENT ON COLUMN "MetricsGithubMetric".id IS 'Primary key: unique metric record identifier';

COMMENT ON COLUMN "MetricsGithubMetric"."repositoryId" IS 'Foreign key to MetricsGithubRepository';

COMMENT ON COLUMN "MetricsGithubMetric"."metricName" IS 'Name of the metric';

COMMENT ON COLUMN "MetricsGithubMetric"."metricValue" IS 'Value of the metric';

COMMENT ON COLUMN "MetricsGithubMetric"."recordedAt" IS 'Timestamp when metric was recorded';

COMMENT ON COLUMN "MetricsGithubMetric"."createdAt" IS 'Record creation timestamp';

COMMENT ON COLUMN "MetricsGithubMetric"."updatedAt" IS 'Record update timestamp';

COMMENT ON COLUMN "MetricsGithubMetric"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubMetric"
        ADD CONSTRAINT "PK_METRICS_GITHUB_METRIC" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubMetric"
        ADD CONSTRAINT "FK_METRICS_GITHUB_METRIC__REPOSITORY_ID" FOREIGN KEY("repositoryId") REFERENCES "MetricsGithubRepository"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_METRIC__REPOSITORY_ID" ON "MetricsGithubMetric"("tenantId", "repositoryId");

CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_METRIC__TENANT_ID" ON "MetricsGithubMetric"("tenantId");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_METRIC__REPOSITORY_METRIC_NAME_RECORDED_AT" ON "MetricsGithubMetric"("tenantId", "repositoryId", "metricName", "recordedAt");

-- Table: MetricsGithubUser
CREATE TABLE IF NOT EXISTS "MetricsGithubUser"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "login" varchar(255) NOT NULL,
    "name" varchar(255),
    "email" varchar(255),
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_USER__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_USER__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubUser" IS 'GitHub users tracked in the system (Metrics)';

COMMENT ON COLUMN "MetricsGithubUser".id IS 'Primary key: unique user identifier';

COMMENT ON COLUMN "MetricsGithubUser"."login" IS 'User login';

COMMENT ON COLUMN "MetricsGithubUser"."name" IS 'User full name';

COMMENT ON COLUMN "MetricsGithubUser"."email" IS 'User email address';

COMMENT ON COLUMN "MetricsGithubUser"."createdAt" IS 'Record creation timestamp';

COMMENT ON COLUMN "MetricsGithubUser"."updatedAt" IS 'Record update timestamp';

COMMENT ON COLUMN "MetricsGithubUser"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubUser"
        ADD CONSTRAINT "PK_METRICS_GITHUB_USER" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_USER__LOGIN" ON "MetricsGithubUser"("tenantId", "login");

CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_USER__TENANT_ID" ON "MetricsGithubUser"("tenantId");

-- Table: MetricsGithubUserRepository
CREATE TABLE IF NOT EXISTS "MetricsGithubUserRepository"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "repositoryId" uuid NOT NULL,
    "role" varchar(50) NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_USER_REPOSITORY__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_USER_REPOSITORY__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubUserRepository" IS 'Relation between users and repositories with roles (Metrics)';

COMMENT ON COLUMN "MetricsGithubUserRepository".id IS 'Primary key: unique relation identifier';

COMMENT ON COLUMN "MetricsGithubUserRepository"."userId" IS 'Foreign key to MetricsGithubUser';

COMMENT ON COLUMN "MetricsGithubUserRepository"."repositoryId" IS 'Foreign key to MetricsGithubRepository';

COMMENT ON COLUMN "MetricsGithubUserRepository"."role" IS 'Role of the user in the repository';

COMMENT ON COLUMN "MetricsGithubUserRepository"."createdAt" IS 'Record creation timestamp';

COMMENT ON COLUMN "MetricsGithubUserRepository"."updatedAt" IS 'Record update timestamp';

COMMENT ON COLUMN "MetricsGithubUserRepository"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubUserRepository"
        ADD CONSTRAINT "PK_METRICS_GITHUB_USER_REPOSITORY" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubUserRepository"
        ADD CONSTRAINT "FK_METRICS_GITHUB_USER_REPOSITORY__USER_ID" FOREIGN KEY("userId") REFERENCES "MetricsGithubUser"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubUserRepository"
        ADD CONSTRAINT "FK_METRICS_GITHUB_USER_REPOSITORY__REPOSITORY_ID" FOREIGN KEY("repositoryId") REFERENCES "MetricsGithubRepository"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_USER_REPOSITORY__USER_REPOSITORY" ON "MetricsGithubUserRepository"("tenantId", "userId", "repositoryId");

CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_USER_REPOSITORY__TENANT_ID" ON "MetricsGithubUserRepository"("tenantId");

