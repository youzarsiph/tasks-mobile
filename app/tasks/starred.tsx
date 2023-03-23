/**
 * Tasks Screen
 */

import React from "react";
import Styles from "../../styles";
import * as SQLite from "expo-sqlite";
import { TaskType, State } from "../../types";
import { useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import { List, Text } from "react-native-paper";
import { Screen, Task } from "../../components";

// Open the db
const db = SQLite.openDatabase("tasks.db");

interface StarredState extends State {
  tasks: TaskType[];
}

const StarredTasks = () => {
  // Router
  const router = useRouter();

  // State
  const [state, setState] = React.useState<StarredState>({
    loading: true,
    tasks: [],
    message: "",
    displayMessage: false,
    displayModal: false,
    reload: false,
  });

  // Load starred tasks
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE completed != "TRUE" AND starred = "TRUE"`,
        [],
        (_, { rows }) => {
          setState({ ...state, loading: false, tasks: rows._array });
        },
        (_, { message }) => {
          // Display error message
          setState({
            ...state,
            loading: false,
            message: message,
            displayMessage: true,
          });

          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  }, [state.reload]);

  // Mark task completed or uncompleted
  const checkTask = (taskId: number, completed: boolean) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE task SET completed = ? WHERE id = ?",
        [completed ? "TRUE" : "FALSE", taskId],
        (_, data) => {
          // Display success message
          setState({
            ...state,
            message: completed ? "Task completed" : "Task marked uncompleted",
            displayMessage: true,
            reload: !state.reload,
          });
        },
        (_, { message }) => {
          // Display error message
          setState({
            ...state,
            message: message,
            displayMessage: true,
          });

          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  };

  // Star or un-star the task
  const starTask = (taskId: number, starred: boolean) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE task SET starred = ? WHERE id = ?",
        [starred ? "TRUE" : "FALSE", taskId],
        (_, data) => {
          // Display success message
          setState({
            ...state,
            message: starred ? "Task starred" : "Task removed from starred",
            displayMessage: true,
            reload: !state.reload,
          });
        },
        (_, { message }) => {
          // Display error message
          setState({
            ...state,
            message: message,
            displayMessage: true,
          });

          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  };

  return (
    <Screen
      loading={state.loading}
      message={state.message}
      displayMessage={state.displayMessage}
      onDismissMessage={() => setState({ ...state, displayMessage: false })}
      options={{ title: "Starred Tasks", animation: "slide_from_right" }}
    >
      <View style={Styles.screen}>
        {state.tasks.length === 0 ? (
          <View style={[Styles.fullScreen, { rowGap: 32 }]}>
            <Text variant="titleLarge">No starred tasks</Text>
            <Text style={{ marginHorizontal: 32, textAlign: "center" }}>
              Mark important tasks with a star so you can easily find them here
            </Text>
          </View>
        ) : (
          <List.Section>
            <FlatList
              data={state.tasks}
              renderItem={({ item }) => (
                <Task
                  item={item}
                  callback={() => router.push(`tasks/${item.id}`)}
                  checkCallback={() => {
                    checkTask(item.id, item.completed !== "TRUE");
                  }}
                  starCallback={() => {
                    starTask(item.id, item.starred !== "TRUE");
                  }}
                />
              )}
            />
          </List.Section>
        )}
      </View>
    </Screen>
  );
};

export default StarredTasks;
