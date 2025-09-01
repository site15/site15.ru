-- Migration: Add metrics settings table with tenant-based separation
-- Description: Creates table with settings for the metrics library with tenant-based separation
-- Each tenant can have only one record with enabled = true

-- Create the metrics settings table
CREATE TABLE IF NOT EXISTS "MetricsSettings"(
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "tenantId" uuid NOT NULL,
    "enabled" boolean NOT NULL DEFAULT false,
    "githubToken" varchar(255),
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--

-- Add primary key constraint
DO $$
BEGIN
    ALTER TABLE "MetricsSettings"
        ADD CONSTRAINT "PK_METRICS_SETTINGS" PRIMARY KEY("id");
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

--

-- Add indexes
CREATE INDEX IF NOT EXISTS "IDX_METRICS_SETTINGS__TENANT_ID" ON "MetricsSettings"("tenantId");
CREATE INDEX IF NOT EXISTS "IDX_METRICS_SETTINGS__ENABLED" ON "MetricsSettings"("enabled");

-- Create a unique partial index to ensure each tenant can have only one enabled record
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_SETTINGS__TENANT_ID_ENABLED" ON "MetricsSettings"("tenantId") WHERE "enabled" = true;
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END
$$;

--

-- Add comments for documentation
COMMENT ON TABLE "MetricsSettings" IS 'Settings for the metrics module, with tenant-based separation';
COMMENT ON COLUMN "MetricsSettings"."id" IS 'Primary key';
COMMENT ON COLUMN "MetricsSettings"."tenantId" IS 'Tenant identifier';
COMMENT ON COLUMN "MetricsSettings"."enabled" IS 'Flag indicating if metrics collection is enabled for this tenant';
COMMENT ON COLUMN "MetricsSettings"."githubToken" IS 'GitHub personal access token for API access';
COMMENT ON COLUMN "MetricsSettings"."createdAt" IS 'Record creation timestamp';
COMMENT ON COLUMN "MetricsSettings"."updatedAt" IS 'Record last update timestamp';
COMMENT ON INDEX "UQ_METRICS_SETTINGS__TENANT_ID_ENABLED" IS 'Unique partial index to ensure each tenant can have only one enabled record';

-- Add audit trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_metrics_settings_updated_at 
    BEFORE UPDATE ON "MetricsSettings" 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();