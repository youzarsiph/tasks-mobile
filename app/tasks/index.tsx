/**
 * Tasks Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { FAB, List, ProgressBar, Text, useTheme } from "react-native-paper";
import Styles from "../../styles";
import { server } from "../../data.env";
import { NewTask, UpdateList } from "../../components/modals";
import { ConfirmationDialog, Header, Screen, Task } from "../../components";
import { HeaderProps, ListType, Params, TasksScreenState } from "../../types";
import {
  ReloadContext,
  TaskAPI,
  ListAPI,
  useAuth,
  useMessage,
} from "../../utils";

// Open db
const db = SQLite.openDatabase("taskLists.db");

const Tasks = () => {
  // Theme
  const theme = useTheme();

  // Router
  const router = useRouter();

  // Auth token
  const { token } = useAuth();

  // Message
  const { showMessage } = useMessage();

  // List id
  const { listId } = useSearchParams<Params>();

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // Update List Modal
  const [displayULModal, setDisplayULModal] = React.useState<boolean>(false);

  // New Task Modal
  const [displayNTModal, setDisplayNTModal] = React.useState<boolean>(false);

  // Task delete confirmation dialog
  const [displayDCDialog, setDisplayDCDialog] = React.useState<boolean>(false);

  // State
  const [state, setState] = React.useState<TasksScreenState>({
    data: [],
    loading: true,
  });
  const [list, setList] = React.useState<ListType>({
    id: 1,
    name: "Task list",
    description: "",
    created_at: Date(),
    updated_at: Date(),
  });

  // Load task list
  React.useEffect(() => {
    (async () => {
      await fetch(`${server}lists/${listId}`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setList(data))
        .catch((e) => {
          showMessage(e.message);

          // Load local list
          db.transaction((tx) =>
            tx.executeSql(
              "SELECT * FROM list WHERE id = ?",
              [`${listId}`],
              (_, { rows }) => setList(rows._array[0]),
              (_, { message }) => {
                showMessage(message);
                return true;
              }
            )
          );
        });
    })();
  }, [trigger.listReload]);

  // Load tasks
  React.useEffect(() => {
    (async () => {
      await TaskAPI.objects(
        token,
        db,
        `${listId}`,
        (data) => {
          setState({ data: data, loading: false });
          setRefreshing(false);
        },
        (message) => {
          setState({ ...state, loading: false });
          setRefreshing(false);
          showMessage(message);
        }
      );
    })();
  }, [trigger.taskReload]);

  const listCreated = new Date(list.created_at).toLocaleString();
  const listLastUpdate = new Date(list.updated_at).toLocaleString();

  const rate =
    state.data.length !== 0
      ? state.data.filter((item) => item.completed).length / state.data.length
      : 0;

  return (
    <Screen
      loading={state.loading}
      options={{
        title: list.name,
        header: (props: HeaderProps) => (
          <Header
            {...props}
            updateCallback={() => setDisplayULModal(true)}
            deleteCallback={() => setDisplayDCDialog(true)}
          />
        ),
      }}
    >
      <View style={Styles.screen}>
        <ProgressBar progress={rate} />

        <List.Accordion title="Details">
          <View style={{ paddingHorizontal: 16, gap: 2 }}>
            {list.description !== "" ? (
              <Text>{list.description}</Text>
            ) : undefined}

            <Text variant="bodySmall">Created: {listCreated}</Text>
            {listCreated !== listLastUpdate ? (
              <Text variant="bodySmall">Last Update: {listLastUpdate}</Text>
            ) : undefined}
          </View>
        </List.Accordion>

        {state.data.length === 0 ? (
          <View style={[Styles.fullScreen, { gap: 32 }]}>
            <Text variant="titleLarge">No tasks yet</Text>
            <Text>Add your tasks and keep track of your success</Text>
          </View>
        ) : (
          <View style={Styles.screen}>
            <List.Section title="Tasks" style={Styles.screen}>
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
                    item={item}
                    callback={() => router.push(`tasks/${item.id}`)}
                    checkCallback={() => {
                      (async () => {
                        await TaskAPI.check(
                          token,
                          db,
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
                          db,
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
          </View>
        )}

        <FAB
          icon="plus"
          style={Styles.fab}
          onPress={() => setDisplayNTModal(true)}
        />

        <UpdateList
          token={token}
          visible={displayULModal}
          onDismiss={() => setDisplayULModal(false)}
          errorCallback={(message) => showMessage(message)}
          data={{
            id: `${listId}`,
            name: list.name,
            description: list.description,
          }}
          callback={() => {
            // Display message and reload data
            showMessage("List updated");
            trigger.setListReload();
          }}
        />

        <NewTask
          token={token}
          db={db}
          id={`${listId}`}
          visible={displayNTModal}
          onDismiss={() => setDisplayNTModal(false)}
          errorCallback={(message) => showMessage(message)}
          callback={() => {
            // Display message and reload data
            showMessage("Task created");
            trigger.setTaskReload();
          }}
        />

        <ConfirmationDialog
          title="Delete Task List"
          message="Are you sure you want to delete this task list?"
          visible={displayDCDialog}
          onDismiss={() => setDisplayDCDialog(false)}
          delete={() => {
            (async () => {
              await ListAPI.delete(
                token,
                db,
                `${listId}`,
                () => {
                  // Display message, navigate back and reload data
                  showMessage("List deleted");

                  setTimeout(() => {
                    router.back();
                    trigger.setListReload();
                  }, 1000);
                },
                (message) => showMessage(message)
              );

              setDisplayDCDialog(false);
            })();
          }}
        />
      </View>
    </Screen>
  );
};

export default Tasks;
