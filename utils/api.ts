/**
 * API Call functions
 */

import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import Database from "./db";
import { server } from "../data.env";

/**
 * Return a message for a HTTP status code
 * @param code HTTP status code
 * @returns HTTP statusText
 */
const message = (code: number) => {
  switch (code) {
    case 400:
      return "Bad Request";

    case 401:
      return "Unauthorized";

    case 403:
      return "Forbidden";

    case 404:
      return "Not Found";

    case 405:
      return "Method Not Allowed";

    case 429:
      return "Too Many Requests";

    case 500:
      return "Server Error";

    default:
      return `Error ${code}`;
  }
};

const Auth = {
  register: async (
    data: {
      email: string;
      username: string;
      password: string;
    },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}auth/users/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          (async () => {
            const res = await response.json();

            callback();
          })();
        } else {
          console.log(response.status, message(response.status));
        }
      })
      .catch((e) => errorCallback(e.message));
  },
  logIn: async (
    data: { username: string; password: string },
    callback: (token: string) => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}auth/token/login/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          (async () => {
            const res = await response.json();

            await SecureStore.setItemAsync("token", res.auth_token);

            callback(res.auth_token);
          })();
        } else {
          console.log(response.status, message(response.status));
        }
      })
      .catch((e) => errorCallback(e.message));
  },
  logOut: async (
    token: string,
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}auth/token/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          (async () => {
            await SecureStore.deleteItemAsync("token");

            callback();
          })();
        } else {
          console.log(response.status, message(response.status));
        }
      })
      .catch((e) => errorCallback(e.message));
  },
  changePassword: async (
    token: string,
    data: { current_password: string; new_password: string },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}/users/me/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => {
        console.log(data);
        callback();
      })
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);
      });
  },
};

const ListAPI = {
  objects: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    callback: (data: any) => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}lists`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => callback(data))
      .catch((e) => {
        errorCallback(e.message);

        // Local data
        Database.List.objects(
          db,
          (data) => callback(data),
          (message) => errorCallback(message)
        );
      });
  },
  create: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    list: { name: string; description: string },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}/lists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(list),
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => {
        console.log(data);
        callback();
      })
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);

        // Save to local db
        Database.List.create(
          db,
          {
            name: list.name,
            description: list.description,
          },
          () => callback(),
          (message) => errorCallback(message)
        );
      });
  },
  update: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    list: {
      id: string;
      name: string;
      description: string;
    },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    return await fetch(`${server}lists/${list.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ name: list.name, description: list.description }),
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => {
        callback();

        return data;
      })
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);

        Database.List.update(
          db,
          list,
          () => callback(),
          (message) => errorCallback(message)
        );
      });
  },
  delete: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    listId: string,
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}lists/${listId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((response) =>
        console.log({
          code: response.status,
          message: message(response.status),
        })
      )
      .then(() => callback())
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);

        Database.List.delete(
          db,
          listId,
          () => callback(),
          (message) => errorCallback(message)
        );
      });
  },
};

const TaskAPI = {
  objects: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    listId: string,
    callback: (data: any) => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}lists/${listId}/tasks/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => callback(data))
      .catch((e) => {
        errorCallback(e.message);

        // Load local data
        Database.Task.objects(
          db,
          listId,
          (data) => callback(data),
          (message) => errorCallback(message)
        );
      });
  },
  create: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    listId: string,
    task: {
      title: string;
      starred: boolean;
      deadline?: string;
      description: string;
      completion_rate: string;
    },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}lists/${listId}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ ...task, completed: false }),
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => {
        console.log(data);
        callback();
      })
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);

        // Save to local DB
        Database.Task.create(
          db,
          {
            id: `{$listId}`,
            title: task.title,
            description: task.description,
            starred: task.starred ? 1 : 0,
            completed: 0,
          },
          () => callback(),
          (message) => errorCallback(message)
        );
      });
  },
  update: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    id: string,
    task: {
      title?: string;
      starred?: boolean;
      deadline?: string;
      completed?: boolean;
      description?: string;
      completion_rate?: string;
    },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    return await fetch(`${server}tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(task),
    })
      .then((response) =>
        response.ok
          ? response.json()
          : { code: response.status, message: message(response.status) }
      )
      .then((data) => {
        callback();

        return data;
      })
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);

        // Database.Task.update(
        //   db,
        //   {title: task.},
        //   () => callback(),
        //   (message) => errorCallback(message)
        // );
      });
  },
  delete: async (
    token: string,
    taskId: string,
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    await fetch(`${server}tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    })
      .then((response) =>
        console.log({
          code: response.status,
          message: message(response.status),
        })
      )
      .then((data) => callback())
      .catch((e) => {
        console.log(e.message);
        errorCallback(e.message);
      });
  },
  star: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    id: string,
    task: {
      starred?: boolean;
    },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    return await TaskAPI.update(
      token,
      db,
      id,
      { starred: !task.starred },
      () => callback(),
      (message) => errorCallback(message)
    );
  },
  check: async (
    token: string,
    db: SQLite.WebSQLDatabase,
    id: string,
    task: {
      completed?: boolean;
    },
    callback: () => void,
    errorCallback: (message: string) => void
  ) => {
    return await TaskAPI.update(
      token,
      db,
      id,
      {
        completed: !task.completed,
        completion_rate: `${task.completed ? 0 : 100}`,
      },
      () => callback(),
      (message) => errorCallback(message)
    );
  },
};

export { Auth, ListAPI, TaskAPI };
