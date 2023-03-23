/**
 * App entry
 */

import "expo-router/entry";
import * as SQLite from "expo-sqlite";

// Open the db
const db = SQLite.openDatabase("tasks.db");

// Turn foreign keys on
db.exec([{ sql: "PRAGMA foreign_keys = ON;", args: [] }], false, () => {
  console.log("Foreign keys turned on");
});

// Init the db
db.transaction((tx) => {
  tx.executeSql(
    `
    CREATE TABLE IF NOT EXISTS "list" (
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" varchar(32) NOT NULL,
        "created_at" datetime NOT NULL DEFAULT now,
        "updated_at" datetime NOT NULL DEFAULT now
    );
    -- Index
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
    `,
    [],
    (_, {}) => {
      console.log("List created");
    },
    (_, { message }) => {
      console.log(`Error: ${message}`);

      return true;
    }
  );
  tx.executeSql(
    `
    CREATE TABLE IF NOT EXISTS "task" (
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" varchar(32) NOT NULL,
        "description" varchar(256) NULL,
        "starred" bool NOT NULL DEFAULT 0,
        "completed" bool NOT NULL DEFAULT 0,
        "created_at" datetime NOT NULL DEFAULT now,
        "updated_at" datetime NOT NULL DEFAULT now,
        "list_id" bigint NOT NULL REFERENCES "list" ("id") DEFERRABLE INITIALLY DEFERRED
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
    `,
    [],
    (_, {}) => {
      console.log("Task created");
    },
    (_, { message }) => {
      console.log(`Error: ${message}`);

      return true;
    }
  );
});

// Delete db
// db.closeAsync();
// db.deleteAsync();
