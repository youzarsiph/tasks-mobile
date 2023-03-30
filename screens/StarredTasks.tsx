/**
 * Starred Tasks Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import { Button, List, Text, useTheme } from "react-native-paper";
import { DB, ReloadContext } from "../utils";
import Styles from "../styles";
import { TaskType, State } from "../types";
import { Screen, Task } from "../components";

// Open the db
const db = SQLite.openDatabase("tasks.db");

interface StarredState extends State {
  tasks: TaskType[];
}

const StarredTasks = () => {
  // Router
  const router = useRouter();

  // Theme
  const theme = useTheme();

  // State
  const [state, setState] = React.useState<StarredState>({
    loading: true,
    tasks: [],
  });

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Load starred tasks
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE completed != "TRUE" AND starred = "TRUE"`,
        [],
        (_, { rows }) => {
          setState({ loading: false, tasks: rows._array });

          setRefreshing(false);
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
  }, [trigger.reload]);

  return (
    <Screen
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
      <View style={Styles.screen}>
        {state.tasks.length === 0 ? (
          <View style={[Styles.fullScreen, { rowGap: 32 }]}>
            <Text variant="titleLarge">No starred tasks</Text>
            <Text style={{ marginHorizontal: 32, textAlign: "center" }}>
              Mark important tasks with a star so you can easily find them here
            </Text>
            <Button mode="contained-tonal" onPress={() => trigger.setReload()}>
              Refresh
            </Button>
          </View>
        ) : (
          <List.Section title="Starred Tasks" style={Styles.screen}>
            <FlashList
              data={state.tasks}
              estimatedItemSize={68}
              keyExtractor={(item) =>
                `${item.id}:${item.completed}:${item.starred}`
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  colors={[theme.colors.primary]}
                  progressBackgroundColor={theme.colors.elevation.level1}
                  onRefresh={() => {
                    setRefreshing(true);

                    trigger.setReload();
                  }}
                />
              }
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
                        trigger.setReload();
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
                        trigger.setReload();
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
