/**
 * Starred Tasks Screen
 */

import React from "react";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import { Button, List, Text, useTheme } from "react-native-paper";
import Styles from "../styles";
import { server } from "../data.env";
import { TasksScreenState } from "../types";
import { Screen, Task } from "../components";
import { ReloadContext, TaskAPI, useAuth, useMessage } from "../utils";

const StarredTasks = () => {
  // Theme
  const theme = useTheme();

  // Router
  const router = useRouter();

  // Message
  const { showMessage } = useMessage();

  // Auth token
  const { token } = useAuth();

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // State
  const [state, setState] = React.useState<TasksScreenState>({
    loading: true,
    data: [],
  });

  // Load starred tasks
  React.useEffect(() => {
    (async () => {
      await fetch(`${server}tasks?starred=true&completed=false`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.log(response.status, response.statusText);

            return { code: response.status, message: response.statusText };
          }
        })
        .then((data) => {
          setState({ data: data, loading: false });
          setRefreshing(false);
        })
        .catch((e) => {
          setRefreshing(false);
          setState({ data: [], loading: false });
          showMessage(e.message);
        });
    })();
  }, [trigger.taskReload]);

  return (
    <Screen loading={state.loading}>
      <View style={Styles.screen}>
        {state.data.length === 0 ? (
          <View style={Styles.welcome}>
            <Text variant="titleLarge">No starred tasks</Text>
            <Text variant="bodyLarge" style={Styles.lead}>
              Mark important tasks with a star so you can easily find them here
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                trigger.setListReload();
                trigger.setTaskReload();
              }}
            >
              Refresh
            </Button>
          </View>
        ) : (
          <List.Section title="Starred" style={Styles.screen}>
            <FlashList
              data={state.data}
              estimatedItemSize={68}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  colors={[theme.colors.primary]}
                  progressBackgroundColor={theme.colors.elevation.level1}
                  onRefresh={() => {
                    setRefreshing(true);

                    trigger.setTaskReload();
                  }}
                />
              }
              renderItem={({ item }) => (
                <Task
                  item={{ ...item, description: `In ${item.list?.name}` }}
                  callback={() => router.push(`tasks/${item.id}`)}
                  checkCallback={() => {
                    (async () => {
                      await TaskAPI.check(
                        token,
                        `${item.id}`,
                        { completed: item.completed },
                        () => {
                          // Display message and reload data
                          showMessage(
                            !item.completed
                              ? "Task completed"
                              : "Task marked uncompleted"
                          );
                          trigger.setTaskReload();
                        },
                        (message) => showMessage(message)
                      );
                    })();
                  }}
                  starCallback={() => {
                    (async () => {
                      await TaskAPI.star(
                        token,
                        `${item.id}`,
                        { starred: item.starred },
                        () => {
                          // Display message and reload data
                          showMessage(
                            !item.starred
                              ? "Task starred"
                              : "Task removed from starred"
                          );
                          trigger.setTaskReload();
                        },
                        (message) => showMessage(message)
                      );
                    })();
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
