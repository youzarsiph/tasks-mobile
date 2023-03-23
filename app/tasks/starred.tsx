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
import { DB } from "../../utils";

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
  });

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // Reload trigger
  const [reload, setReload] = React.useState<boolean>(false);

  // Load starred tasks
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE completed != "TRUE" AND starred = "TRUE"`,
        [],
        (_, { rows }) => {
          setState({ loading: false, tasks: rows._array });
        },
        (_, { message }) => {
          // Display error message
          setMessage(message);
          setDisplayMessage(true);
          setState({
            ...state,
            loading: false,
          });

          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  }, [reload]);

  return (
    <Screen
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
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
                    DB.checkTask(
                      db,
                      {
                        id: `${item.id}`,
                        completed: item.completed !== "TRUE",
                      },
                      () => {
                        // Display success message and reload data
                        setMessage(
                          item.completed !== "TRUE"
                            ? "Task completed"
                            : "Task marked uncompleted"
                        );
                        setDisplayMessage(true);
                        setReload(!reload);
                      },
                      () => {
                        // Display error message
                        setMessage(message);
                        setDisplayMessage(true);
                      }
                    );
                  }}
                  starCallback={() => {
                    DB.starTask(
                      db,
                      {
                        id: `${item.id}`,
                        starred: item.starred !== "TRUE",
                      },
                      () => {
                        // Display success message and reload data
                        setMessage(
                          item.starred !== "TRUE"
                            ? "Task starred"
                            : "Task removed from starred"
                        );
                        setDisplayMessage(true);
                        setReload(!reload);
                      },
                      () => {
                        // Display error message
                        setMessage(message);
                        setDisplayMessage(true);
                      }
                    );
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
