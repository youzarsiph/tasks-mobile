--
-- Create model List
--
CREATE TABLE IF NOT EXISTS "list" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" varchar(32) NOT NULL,
    "default" bool NOT NULL DEFAULT FALSE,
    "created_at" datetime NOT NULL DEFAULT now,
    "updated_at" datetime NOT NULL DEFAULT now
);

-- Indexes
CREATE INDEX IF NOT EXISTS "list_name_index" ON "list" ("name");

-- Triggers
CREATE TRIGGER IF NOT EXISTS "list_auto_now" AFTER INSERT
ON
    "list" FOR EACH ROW
BEGIN
    UPDATE "list" SET "created_at" = datetime('now'), "updated_at" = datetime('now') WHERE "id" = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS "list_updated_at_auto_now" AFTER UPDATE
ON
    "list" FOR EACH ROW
BEGIN
    UPDATE "list" SET "updated_at" = datetime('now') WHERE "id" = NEW.id;
END;

--
-- Create model Task
--
CREATE TABLE IF NOT EXISTS "task" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" varchar(32) NOT NULL,
    "description" varchar(256) NULL,
    "starred" bool NOT NULL DEFAULT FALSE,
    "completed" bool NOT NULL DEFAULT FALSE,
    "due" datetime NULL,
    "created_at" datetime NOT NULL DEFAULT now,
    "updated_at" datetime NOT NULL DEFAULT now,
    "list_id" bigint NOT NULL REFERENCES "list" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

-- Indexes
CREATE INDEX IF NOT EXISTS "task_title_index" ON "task" ("title");
CREATE INDEX IF NOT EXISTS "task_list_id_index" ON "task" ("list_id");

-- Triggers
CREATE TRIGGER IF NOT EXISTS "task_auto_now" AFTER INSERT
ON
    "task" FOR EACH ROW
BEGIN
    UPDATE "task" SET "created_at" = datetime('now'), "updated_at" = datetime('now') WHERE "id" = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS "task_updated_at_auto_now" AFTER UPDATE
ON
    "task" FOR EACH ROW
BEGIN
    UPDATE "task" SET "updated_at" = datetime('now') WHERE "id" = NEW.id;
END;

--
-- CRUD Ops
--

-- List table
-- INSERT INTO "list" ("name") values ('My Tasks');
-- SELECT * FROM "list" WHERE "id" = ?;
-- UPDATE "list" SET "name" = ? WHERE "id" = ?;
-- DELETE FROM "list" WHERE "id" = ?;

-- Task table
-- INSERT INTO "task" ("title", "description", "list_id") VALUES (?, ?, ?);
-- SELECT * FROM "task" WHERE "id" = ?;
-- UPDATE "task" SET "completed" = ? WHERE "id" = ?;
-- UPDATE "task" SET "name" = ?, "description" = ? WHERE "id" = ?;
-- DELETE FROM "task" WHERE "id" = ?;