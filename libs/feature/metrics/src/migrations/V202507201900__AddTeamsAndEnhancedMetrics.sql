-- Migration: Add Teams and Enhanced Metrics Tables
-- Description: Creates teams, enhanced repositories and developers with specific metrics tables

-- Create Teams table
CREATE TABLE IF NOT EXISTS "MetricsGithubTeam"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_TEAM__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_TEAM__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubTeam" IS 'Teams in the metrics system (Metrics)';
COMMENT ON COLUMN "MetricsGithubTeam".id IS 'Primary key: unique team identifier';
COMMENT ON COLUMN "MetricsGithubTeam"."name" IS 'Team name';
COMMENT ON COLUMN "MetricsGithubTeam"."description" IS 'Team description';
COMMENT ON COLUMN "MetricsGithubTeam"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "MetricsGithubTeam"."updatedAt" IS 'Record update timestamp';
COMMENT ON COLUMN "MetricsGithubTeam"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeam"
        ADD CONSTRAINT "PK_METRICS_GITHUB_TEAM" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_TEAM__NAME" ON "MetricsGithubTeam"("tenantId", "name");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_TEAM__TENANT_ID" ON "MetricsGithubTeam"("tenantId");

-- Enhance MetricsGithubRepository table with additional fields
DO $$
BEGIN
    ALTER TABLE "MetricsGithubRepository" 
        ADD COLUMN IF NOT EXISTS "description" text,
        ADD COLUMN IF NOT EXISTS "url" varchar(500);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;

COMMENT ON COLUMN "MetricsGithubRepository"."description" IS 'Repository description';
COMMENT ON COLUMN "MetricsGithubRepository"."url" IS 'Repository URL';

-- Create Repository Statistics table for time-based metrics
CREATE TABLE IF NOT EXISTS "MetricsGithubRepositoryStatistics"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "repositoryId" uuid NOT NULL,
    "periodType" varchar(50) NOT NULL, -- 'day', 'week', 'month', 'half_year', 'year', 'total'
    "starsCount" integer DEFAULT 0,
    "forksCount" integer DEFAULT 0,
    "contributorsCount" integer DEFAULT 0,
    "commitsCount" integer DEFAULT 0,
    "lastCommitDate" timestamp(6),
    "recordedAt" timestamp(6) NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_REPOSITORY_STATISTICS__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_REPOSITORY_STATISTICS__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubRepositoryStatistics" IS 'Repository statistics for different time periods (Metrics)';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics".id IS 'Primary key: unique statistics record identifier';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."repositoryId" IS 'Foreign key to MetricsGithubRepository';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."periodType" IS 'Time period type for this statistics record';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."starsCount" IS 'Number of stars for this period';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."forksCount" IS 'Number of forks for this period';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."contributorsCount" IS 'Number of contributors for this period';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."commitsCount" IS 'Number of commits for this period';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."lastCommitDate" IS 'Date of last commit in this period';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."recordedAt" IS 'When this statistics record was created';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."updatedAt" IS 'Record update timestamp';
COMMENT ON COLUMN "MetricsGithubRepositoryStatistics"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubRepositoryStatistics"
        ADD CONSTRAINT "PK_METRICS_GITHUB_REPOSITORY_STATISTICS" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubRepositoryStatistics"
        ADD CONSTRAINT "FK_METRICS_GITHUB_REPOSITORY_STATISTICS__REPOSITORY_ID" FOREIGN KEY("repositoryId") REFERENCES "MetricsGithubRepository"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_REPOSITORY_STATISTICS__REPOSITORY_PERIOD_RECORDED" ON "MetricsGithubRepositoryStatistics"("tenantId", "repositoryId", "periodType", "recordedAt");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_REPOSITORY_STATISTICS__TENANT_ID" ON "MetricsGithubRepositoryStatistics"("tenantId");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_REPOSITORY_STATISTICS__REPOSITORY_ID" ON "MetricsGithubRepositoryStatistics"("tenantId", "repositoryId");

-- Enhance MetricsGithubUser table with additional fields
DO $$
BEGIN
    ALTER TABLE "MetricsGithubUser" 
        ADD COLUMN IF NOT EXISTS "description" text,
        ADD COLUMN IF NOT EXISTS "avatarUrl" varchar(500),
        ADD COLUMN IF NOT EXISTS "websiteUrl" varchar(500),
        ADD COLUMN IF NOT EXISTS "location" varchar(255),
        ADD COLUMN IF NOT EXISTS "telegramUrl" varchar(500),
        ADD COLUMN IF NOT EXISTS "twitterUrl" varchar(500);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;

COMMENT ON COLUMN "MetricsGithubUser"."description" IS 'User description/bio';
COMMENT ON COLUMN "MetricsGithubUser"."avatarUrl" IS 'User avatar URL';
COMMENT ON COLUMN "MetricsGithubUser"."websiteUrl" IS 'User website URL';
COMMENT ON COLUMN "MetricsGithubUser"."location" IS 'User location';
COMMENT ON COLUMN "MetricsGithubUser"."telegramUrl" IS 'User Telegram profile URL';
COMMENT ON COLUMN "MetricsGithubUser"."twitterUrl" IS 'User Twitter profile URL';

-- Create User Statistics table for time-based metrics
CREATE TABLE IF NOT EXISTS "MetricsGithubUserStatistics"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "periodType" varchar(50) NOT NULL, -- 'day', 'week', 'month', 'half_year', 'year', 'total'
    "followersCount" integer DEFAULT 0,
    "followingCount" integer DEFAULT 0,
    "recordedAt" timestamp(6) NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_USER_STATISTICS__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_USER_STATISTICS__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubUserStatistics" IS 'User statistics for different time periods (Metrics)';
COMMENT ON COLUMN "MetricsGithubUserStatistics".id IS 'Primary key: unique statistics record identifier';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."userId" IS 'Foreign key to MetricsGithubUser';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."periodType" IS 'Time period type for this statistics record';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."followersCount" IS 'Number of followers for this period';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."followingCount" IS 'Number of users following for this period';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."recordedAt" IS 'When this statistics record was created';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."updatedAt" IS 'Record update timestamp';
COMMENT ON COLUMN "MetricsGithubUserStatistics"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubUserStatistics"
        ADD CONSTRAINT "PK_METRICS_GITHUB_USER_STATISTICS" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubUserStatistics"
        ADD CONSTRAINT "FK_METRICS_GITHUB_USER_STATISTICS__USER_ID" FOREIGN KEY("userId") REFERENCES "MetricsGithubUser"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_USER_STATISTICS__USER_PERIOD_RECORDED" ON "MetricsGithubUserStatistics"("tenantId", "userId", "periodType", "recordedAt");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_USER_STATISTICS__TENANT_ID" ON "MetricsGithubUserStatistics"("tenantId");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_USER_STATISTICS__USER_ID" ON "MetricsGithubUserStatistics"("tenantId", "userId");

-- Create Team-Repository relationship table
CREATE TABLE IF NOT EXISTS "MetricsGithubTeamRepository"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "teamId" uuid NOT NULL,
    "repositoryId" uuid NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_TEAM_REPOSITORY__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_TEAM_REPOSITORY__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubTeamRepository" IS 'Relation between teams and repositories (Metrics)';
COMMENT ON COLUMN "MetricsGithubTeamRepository".id IS 'Primary key: unique relation identifier';
COMMENT ON COLUMN "MetricsGithubTeamRepository"."teamId" IS 'Foreign key to MetricsGithubTeam';
COMMENT ON COLUMN "MetricsGithubTeamRepository"."repositoryId" IS 'Foreign key to MetricsGithubRepository';
COMMENT ON COLUMN "MetricsGithubTeamRepository"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "MetricsGithubTeamRepository"."updatedAt" IS 'Record update timestamp';
COMMENT ON COLUMN "MetricsGithubTeamRepository"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeamRepository"
        ADD CONSTRAINT "PK_METRICS_GITHUB_TEAM_REPOSITORY" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeamRepository"
        ADD CONSTRAINT "FK_METRICS_GITHUB_TEAM_REPOSITORY__TEAM_ID" FOREIGN KEY("teamId") REFERENCES "MetricsGithubTeam"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeamRepository"
        ADD CONSTRAINT "FK_METRICS_GITHUB_TEAM_REPOSITORY__REPOSITORY_ID" FOREIGN KEY("repositoryId") REFERENCES "MetricsGithubRepository"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_TEAM_REPOSITORY__TEAM_REPOSITORY" ON "MetricsGithubTeamRepository"("tenantId", "teamId", "repositoryId");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_TEAM_REPOSITORY__TENANT_ID" ON "MetricsGithubTeamRepository"("tenantId");

-- Create Team-Developer relationship table
CREATE TABLE IF NOT EXISTS "MetricsGithubTeamUser"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "teamId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "role" varchar(100), -- role of the user in the team
    "createdBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_TEAM_USER__CREATED_BY" REFERENCES "MetricsUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_METRICS_GITHUB_TEAM_USER__UPDATED_BY" REFERENCES "MetricsUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" uuid NOT NULL
);

COMMENT ON TABLE "MetricsGithubTeamUser" IS 'Relation between teams and users/developers (Metrics)';
COMMENT ON COLUMN "MetricsGithubTeamUser".id IS 'Primary key: unique relation identifier';
COMMENT ON COLUMN "MetricsGithubTeamUser"."teamId" IS 'Foreign key to MetricsGithubTeam';
COMMENT ON COLUMN "MetricsGithubTeamUser"."userId" IS 'Foreign key to MetricsGithubUser';
COMMENT ON COLUMN "MetricsGithubTeamUser"."role" IS 'Role of the user in the team';
COMMENT ON COLUMN "MetricsGithubTeamUser"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "MetricsGithubTeamUser"."updatedAt" IS 'Record update timestamp';
COMMENT ON COLUMN "MetricsGithubTeamUser"."tenantId" IS 'Tenant identifier for multi-tenancy';

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeamUser"
        ADD CONSTRAINT "PK_METRICS_GITHUB_TEAM_USER" PRIMARY KEY(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeamUser"
        ADD CONSTRAINT "FK_METRICS_GITHUB_TEAM_USER__TEAM_ID" FOREIGN KEY("teamId") REFERENCES "MetricsGithubTeam"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "MetricsGithubTeamUser"
        ADD CONSTRAINT "FK_METRICS_GITHUB_TEAM_USER__USER_ID" FOREIGN KEY("userId") REFERENCES "MetricsGithubUser"(id);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_GITHUB_TEAM_USER__TEAM_USER" ON "MetricsGithubTeamUser"("tenantId", "teamId", "userId");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_GITHUB_TEAM_USER__TENANT_ID" ON "MetricsGithubTeamUser"("tenantId");