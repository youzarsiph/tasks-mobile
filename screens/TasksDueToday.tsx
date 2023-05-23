/**
 * Tasks Due Today Screen
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

const TasksDueToday = () => {
  // Theme
  const theme = useTheme();

  // Router
  const router = useRouter();

  // Auth token
  const { token } = useAuth();

  // Message
  const { showMessage } = useMessage();

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // State
  const [state, setState] = React.useState<TasksScreenState>({
    data: [],
    loading: true,
  });

  // Load starred tasks
  React.useEffect(() => {
    let date = new Date().toISOString().split("T")[0];

    (async () => {
      await fetch(`${server}tasks?search=${date}`, {
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
            {/* TODO: Change the design */}
            <Text variant="titleLarge">No tasks due today!</Text>
            <Text variant="bodyLarge" style={Styles.lead}>
              Your tasks due today will appear here
            </Text>
            <Button
              mode="contained-tonal"
              onPress={() => {
                trigger.setListReload();
                trigger.setTaskReload();
              }}
            >
              Refresh
            </Button>
          </View>
        ) : (
          <List.Section title="Due today" style={Styles.screen}>
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
                />
              )}
            />
          </List.Section>
        )}
      </View>
    </Screen>
  );
};

export default TasksDueToday;
