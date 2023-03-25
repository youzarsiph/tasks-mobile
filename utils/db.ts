/**
 * Database operations
 */

import * as SQLite from "expo-sqlite";

// List table
const createList = (
  db: SQLite.WebSQLDatabase,
  listName: string,
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO list (name) values (?)",
      [listName],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

const updateList = (
  db: SQLite.WebSQLDatabase,
  list: { id: string; name: string },
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE list SET name = ? WHERE id = ?;",
      [list.name, list.id],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

const deleteList = (
  db: SQLite.WebSQLDatabase,
  listId: string,
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM list WHERE id = ?;",
      [listId],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

// Task table
const createTask = (
  db: SQLite.WebSQLDatabase,
  task: {
    title: string;
    description: string;
    starred: boolean;
    listId: string;
  },
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO task (title, description, starred, list_id) values (?, ?, ?, ?)",
      [
        task.title,
        task.description,
        task.starred ? "TRUE" : "FALSE",
        task.listId,
      ],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

const updateTask = (
  db: SQLite.WebSQLDatabase,
  task: {
    id: string;
    title: string;
    description: string;
    starred: boolean;
    completed: boolean;
  },
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE task SET title = ?, description = ?, completed = ?, starred = ? WHERE id = ?;",
      [
        task.title,
        task.description,
        task.completed ? "TRUE" : "FALSE",
        task.starred ? "TRUE" : "FALSE",
        task.id,
      ],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

const deleteTask = (
  db: SQLite.WebSQLDatabase,
  taskId: string,
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM task WHERE id = ?;",
      [taskId],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

// Star or un-start a task
const starTask = (
  db: SQLite.WebSQLDatabase,
  task: { id: string; starred: boolean },
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE task SET starred = ? WHERE id = ?",
      [task.starred ? "TRUE" : "FALSE", task.id],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

// Mark a task completed or uncompleted
const checkTask = (
  db: SQLite.WebSQLDatabase,
  task: { id: string; completed: boolean },
  callback: () => void,
  errorCallback: () => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE task SET completed = ? WHERE id = ?",
      [task.completed ? "TRUE" : "FALSE", task.id],
      (_, data) => callback(),
      (_, { message }) => {
        errorCallback();

        console.log(`Error: ${message}`);

        return true;
      }
    );
  });
};

export {
  createList,
  updateList,
  deleteList,
  createTask,
  updateTask,
  deleteTask,
  starTask,
  checkTask,
};
