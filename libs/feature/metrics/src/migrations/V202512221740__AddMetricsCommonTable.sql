-- Create the metrics dynamic table
CREATE TABLE IF NOT EXISTS "MetricsDynamic"(
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level1" varchar(255),
    "level2" varchar(255),
    "level3" varchar(255),
    "value" varchar(255),
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Add primary key constraint
DO $$
BEGIN
    ALTER TABLE "MetricsDynamic"
        ADD CONSTRAINT "PK_METRICS_DYNAMIC" PRIMARY KEY("id");
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

--
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_DYNAMIC" ON "MetricsDynamic"("level1", "level2", "level3");
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END
$$;

--
-- Create the metrics dynamic history table
CREATE TABLE IF NOT EXISTS "MetricsDynamicHistory"(
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "level1" varchar(255),
    "level2" varchar(255),
    "level3" varchar(255),
    "value" varchar(255),
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Add primary key constraint
DO $$
BEGIN
    ALTER TABLE "MetricsDynamicHistory"
        ADD CONSTRAINT "PK_METRICS_DYNAMIC_HISTORY" PRIMARY KEY("id");
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

-- Create the metrics dynamic table
CREATE TABLE IF NOT EXISTS "MetricsDynamicCache"(
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "url" text,
    "status" varchar(255),
    "headers" jsonb,
    "body" text,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--
-- Add primary key constraint
DO $$
BEGIN
    ALTER TABLE "MetricsDynamicCache"
        ADD CONSTRAINT "PK_METRICS_DYNAMIC_CACHE" PRIMARY KEY("id");
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
    WHEN invalid_table_definition THEN
        NULL;
END
$$;

--
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "UQ_METRICS_CACHE" ON "MetricsDynamicCache"("url");
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END
$$;

