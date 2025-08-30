-- Migration: Add botForDataSync field to MetricsUser table
-- Description: Adds a boolean field to indicate if the user is a bot used for data synchronization
-- Add botForDataSync column to MetricsUser table
DO $$
BEGIN
    ALTER TABLE "MetricsUser"
        ADD COLUMN IF NOT EXISTS "botForDataSync" boolean DEFAULT FALSE;
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;

COMMENT ON COLUMN "MetricsUser"."botForDataSync" IS 'Indicates if the user is a bot used for data synchronization';

-- Create a default bot user for data synchronization if it doesn't exist
DO $$
BEGIN
    INSERT INTO "MetricsUser"("id", "tenantId", "externalUserId", "userRole", "botForDataSync", "createdAt", "updatedAt")
        VALUES(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Admin', TRUE, NOW(), NOW())
    ON CONFLICT("tenantId", "externalUserId")
        DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END
$$;

-- Add unique partial index to ensure only one user can have botForDataSync = true
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "IDX_METRICS_USER__BOT_FOR_DATA_SYNC"
        ON "MetricsUser" ("botForDataSync")
        WHERE "botForDataSync" = TRUE;
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END
$$;