ALTER TABLE IF EXISTS contact_types
    RENAME TO "ContactTypes";
ALTER TABLE "ContactTypes"
    RENAME COLUMN title_ru TO "titleRu";

ALTER TABLE IF EXISTS contacts
    RENAME TO "Contacts";
ALTER TABLE "Contacts"
    RENAME COLUMN title_ru TO "titleRu";
ALTER TABLE "Contacts"
    RENAME COLUMN contact_type_id TO "contactTypeId";

ALTER TABLE IF EXISTS project_counters
    RENAME TO "ProjectCounters";
ALTER TABLE "ProjectCounters"
    RENAME COLUMN project_id TO "projectId";
ALTER TABLE "ProjectCounters"
    RENAME COLUMN project_type_counter_id TO "projectTypeCounterId";

ALTER TABLE IF EXISTS project_type_counters
    RENAME TO "ProjectTypeCounters";
ALTER TABLE "ProjectTypeCounters"
    RENAME COLUMN title_ru TO "titleRu";
ALTER TABLE "ProjectTypeCounters"
    RENAME COLUMN project_type_id TO "projectTypeId";

ALTER TABLE IF EXISTS project_types
    RENAME TO "ProjectTypes";
ALTER TABLE "ProjectTypes"
    RENAME COLUMN title_ru TO "titleRu";

ALTER TABLE IF EXISTS projects
    RENAME TO "Projects";
ALTER TABLE "Projects"
    RENAME COLUMN title_ru TO "titleRu";
ALTER TABLE "Projects"
    RENAME COLUMN project_type_id TO "projectTypeId";
