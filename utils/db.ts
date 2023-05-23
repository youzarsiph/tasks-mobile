/**
 * Database operations
 */

import * as SQLite from "expo-sqlite";
import { ListType } from "../types";

const Database = {
  init: (db: SQLite.WebSQLDatabase) => {
    // Required for foreign keys
    db.exec([{ sql: "PRAGMA foreign_keys = ON;", args: [] }], false, () =>
      console.log("Foreign keys turned on")
    );

    // Create tables
    db.transaction((tx) => {
      tx.executeSql(
        `-- Create model List
        CREATE TABLE IF NOT EXISTS "list" (
          "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
          "name" varchar(32) NOT NULL,
          "description" varchar(256) NULL
        );

        -- Indexes
        CREATE INDEX "list_name_63f9ef60" ON "list" ("name");
        CREATE INDEX "list_user_id_17a6fe16" ON "list" ("user_id");

        -- Create model Task
        CREATE TABLE IF NOT EXISTS "task" (
            "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
            "title" varchar(32) NOT NULL,
            "description" varchar(256) NULL,
            "starred" bool NOT NULL DEFAULT 0,
            "completed" bool NOT NULL DEFAULT 0,
            "deadline" datetime NULL,
            "completion_rate" smallint unsigned NOT NULL DEFAULT 0,
            CONSTRAINT "completion_rate_gte_0" CHECK ("completion_rate" >= 0),
            CONSTRAINT "completion_rate_lte_100" CHECK ("completion_rate" <= 100),
            "list_id" bigint NOT NULL REFERENCES "list" ("id") DEFERRABLE INITIALLY DEFERRED
        );

        -- Indexes
        CREATE INDEX "task_title_d5052207" ON "task" ("title");
        CREATE INDEX "task_list_id_4feb75db" ON "task" ("list_id");
        CREATE INDEX "task_user_id_270d0bb2" ON "task" ("user_id");`,
        [],
        () => console.log("Database initialization complete"),
        (_, { message }) => {
          console.log(message);

          // Rollback
          return true;
        }
      );
    });
  },
  List: {
    objects: (
      db: SQLite.WebSQLDatabase,
      callback: (data: ListType[]) => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM list;",
          [],
          (_, { rows }) => callback(rows._array),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    create: (
      db: SQLite.WebSQLDatabase,
      data: {
        name: string;
        description: string;
      },
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO list(name, description) VALUES (?, ?);",
          [data.name, data.description],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    update: (
      db: SQLite.WebSQLDatabase,
      data: {
        id: string;
        name: string;
        description: string;
      },
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "UPDATE list SET name = ?, description = ? WHERE id = ?;",
          [data.name, data.description, data.id],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    delete: (
      db: SQLite.WebSQLDatabase,
      id: string,
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM list WHERE id = ?;",
          [id],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
  },
  Task: {
    objects: (
      db: SQLite.WebSQLDatabase,
      id: string,
      callback: (data: ListType[]) => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM task WHERE list_id = ?",
          [id],
          (_, { rows }) => callback(rows._array),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    create: (
      db: SQLite.WebSQLDatabase,
      data: {
        id: string;
        title: string;
        description: string;
        starred: 0 | 1;
        completed: 0 | 1;
        deadline?: string;
      },
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO task(
            title,
            description,
            starred,
            completed,
            deadline,
            list_id
          ) VALUES (?, ?, ?, ?, ?, ?);`,
          [
            data.title,
            data.description,
            data.starred,
            data.completed,
            data.deadline === undefined ? null : data.deadline,
            data.id,
          ],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    update: (
      db: SQLite.WebSQLDatabase,
      data: {
        id: string;
        title: string;
        description: string;
        starred: 0 | 1;
        completed: 0 | 1;
        deadline?: string;
      },
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE task SET
            title = ?,
            description = ?,
            starred = ?,
            completed = ?,
            deadline = ?
          WHERE id = ?;`,
          [
            data.title,
            data.description,
            data.starred,
            data.completed,
            data.deadline === undefined ? null : data.deadline,
            data.id,
          ],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    star: (
      db: SQLite.WebSQLDatabase,
      value: 0 | 1,
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "UPDATE task SET starred = ? WHERE id = ?;",
          [value],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    complete: (
      db: SQLite.WebSQLDatabase,
      value: 0 | 1,
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "UPDATE task SET completed = ? WHERE id = ?;",
          [value],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
    delete: (
      db: SQLite.WebSQLDatabase,
      id: string,
      callback: () => void,
      errorCallback: (message: string) => void
    ) => {
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM task WHERE id = ?;",
          [id],
          () => callback(),
          (_, { message }) => {
            // Display error message
            console.log(message);
            errorCallback(message);

            // Rollback
            return true;
          }
        );
      });
    },
  },
};

export default Database;
