CREATE TABLE IF NOT EXISTS "ProjectTypes" as table project_types;
ALTER TABLE "ProjectTypes"
    RENAME COLUMN title_ru TO "titleRu";

CREATE TABLE IF NOT EXISTS "Projects"
(
    id              serial       NOT NULL,
    name            varchar(100) NOT NULL,
    title           varchar(255) NOT NULL,
    "titleRu"       varchar(255) NOT NULL,
    "projectTypeId" integer      NOT NULL
);

CREATE TABLE IF NOT EXISTS "ProjectTypeCounters"
(
    id              serial       NOT NULL,
    name            varchar(100) NOT NULL,
    title           varchar(255) NOT NULL,
    "titleRu"       varchar(255) NOT NULL,
    "projectTypeId" integer      NOT NULL
);

CREATE TABLE IF NOT EXISTS "ProjectCounters"
(
    id                     serial  NOT NULL,
    "projectId"            integer NOT NULL,
    "projectTypeCounterId" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "ContactTypes" AS table contact_types;
ALTER TABLE "ContactTypes"
    RENAME COLUMN title_ru TO "titleRu";


CREATE TABLE IF NOT EXISTS "Contacts"
(
    id              serial       NOT NULL,
    name            varchar(100) NOT NULL,
    title           varchar(255) NOT NULL,
    "titleRu"       varchar(255) NOT NULL,
    "contactTypeId" integer      NOT NULL
);

DROP TABLE IF EXISTS project_types CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_type_counters CASCADE;
DROP TABLE IF EXISTS project_counters CASCADE;
DROP TABLE IF EXISTS contact_types CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

ALTER TABLE "ProjectTypes"
    ADD CONSTRAINT "PK_PROJECT_TYPES" PRIMARY KEY (id);
ALTER TABLE "Projects"
    ADD CONSTRAINT "PK_PROJECTS" PRIMARY KEY (id);
ALTER TABLE "Projects"
    ADD CONSTRAINT "FK_PROJECTS__PROJECT_TYPE_ID" FOREIGN KEY ("projectTypeId") REFERENCES "ProjectTypes" ON DELETE CASCADE;
ALTER TABLE "ProjectTypeCounters"
    ADD CONSTRAINT "PK_PROJECT_TYPE_COUNTERS" PRIMARY KEY (id);
ALTER TABLE "ProjectTypeCounters"
    ADD CONSTRAINT "FK_PROJECT_TYPE_COUNTERS__PROJECT_TYPE_ID" FOREIGN KEY ("projectTypeId") REFERENCES "ProjectTypes" ON DELETE CASCADE;
ALTER TABLE "ProjectCounters"
    ADD CONSTRAINT "PK_PROJECT_COUNTERS" PRIMARY KEY (id);
ALTER TABLE "ProjectCounters"
    ADD CONSTRAINT "FK_PROJECT__ID" FOREIGN KEY ("projectId") REFERENCES "Projects" ON DELETE CASCADE;
ALTER TABLE "ProjectCounters"
    ADD CONSTRAINT "FK_PROJECT_COUNTERS__PROJECT_TYPE_COUNTER_ID" FOREIGN KEY ("projectTypeCounterId") REFERENCES "ProjectTypeCounters" ON DELETE CASCADE;
ALTER TABLE "ContactTypes"
    ADD CONSTRAINT "PK_CONTACT_TYPES" PRIMARY KEY (id);
CREATE INDEX IF NOT EXISTS "IDX_CONTACT_TYPES__NAME" ON "ContactTypes" (name);
ALTER TABLE "Contacts"
    ADD CONSTRAINT "PK_CONTACTS" PRIMARY KEY (id);
ALTER TABLE "Contacts"
    ADD CONSTRAINT "FK_CONTACTS__CONTACT_TYPE_ID" FOREIGN KEY ("contactTypeId") REFERENCES "ContactTypes" ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_PROJECT_COUNTERS" ON "ProjectCounters" ("projectId", "projectTypeCounterId");
CREATE INDEX IF NOT EXISTS "IDX_PROJECT_TYPE_COUNTERS__NAME" ON "ProjectTypeCounters" (name);
CREATE INDEX IF NOT EXISTS "IDX_PROJECT_TYPES__NAME" ON "ProjectTypes" (name);
CREATE INDEX IF NOT EXISTS "IDX_PROJECTS__PROJECT_TYPE_ID" ON "Projects" ("projectTypeId");
