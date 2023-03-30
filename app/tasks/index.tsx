/**
 * Tasks Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import {
  Button,
  IconButton,
  List,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Styles from "../../styles";
import { DB, ReloadContext } from "../../utils";
import { Params, TaskTypeState } from "../../types";
import { Actions, Modal, Screen, Task } from "../../components";

// Open the db
const db = SQLite.openDatabase("tasks.db");

const Tasks = () => {
  // Router
  const router = useRouter();

  // Theme
  const theme = useTheme();

  // List details
  const { id, title } = useSearchParams<Params>();

  // State
  const [state, setState] = React.useState<TaskTypeState>({
    loading: true,
    tasks: [],
  });

  // Count of completed tasks
  const [count, setCount] = React.useState<number>(0);

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // New Task Modal
  const [displayNTModal, setDisplayNTModal] = React.useState<boolean>(false);

  // Rename List Modal
  const [displayRLModal, setDisplayRLModal] = React.useState<boolean>(false);

  // FAB actions
  const [displayActions, setDisplayActions] = React.useState<boolean>(false);

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Load tasks
  React.useEffect(() => {
    db.transaction((tx) => {
      // Count of completed tasks
      tx.executeSql(
        `SELECT COUNT(id) as c FROM task WHERE completed = "TRUE" AND list_id = ?`,
        [`${id}`],
        (_, { rows }) => {
          // Set data
          setCount(rows._array[0].c);
        },
        (_, { message }) => {
          // Display error message
          setMessage(message);
          setDisplayMessage(true);

          console.log(`Error: ${message}`);

          return true;
        }
      );

      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt
        FROM task WHERE list_id = ? ORDER BY starred desc, completed`,
        [`${id}`],
        (_, { rows }) => {
          // Hide activity indicator and set data
          setState({
            ...state,
            loading: false,
            tasks: rows._array,
          });

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

  const NewTaskModal = () => {
    const [localState, setLocalState] = React.useState({
      title: "",
      description: "",
      starred: false,
      due: undefined,
    });

    return (
      <Modal
        visible={displayNTModal}
        onDismiss={() => setDisplayNTModal(false)}
      >
        <Text variant="titleLarge">Create New Task</Text>

        <TextInput
          value={localState.title}
          mode="outlined"
          maxLength={32}
          label={"Task title"}
          placeholder={"Enter task title"}
          onChangeText={(value) =>
            setLocalState({ ...localState, title: value })
          }
          right={<TextInput.Affix text={`${32 - localState.title.length}`} />}
        />

        <TextInput
          multiline
          mode="outlined"
          maxLength={256}
          numberOfLines={2}
          value={localState.description}
          label={"Task description"}
          placeholder={"Enter task details"}
          onChangeText={(value) =>
            setLocalState({ ...localState, description: value })
          }
          right={
            <TextInput.Affix text={`${256 - localState.description.length}`} />
          }
        />

        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}
        >
          <IconButton
            icon={localState.starred ? "star" : "star-outline"}
            onPress={() =>
              setLocalState({ ...localState, starred: !localState.starred })
            }
          />

          <Button
            mode="contained"
            onPress={() => {
              DB.createTask(
                db,
                {
                  title: localState.title,
                  description: localState.description,
                  starred: localState.starred,
                  listId: `${id}`,
                },
                () => {
                  // Display success message, reload data and hide modal
                  setMessage("Task created");
                  setDisplayMessage(true);
                  setDisplayNTModal(false);
                  trigger.setReload();
                },
                () => {
                  // Display error message and hide modal
                  setMessage(message);
                  setDisplayMessage(true);
                  setDisplayNTModal(false);
                }
              );
            }}
            disabled={localState.title === ""}
            style={{ marginLeft: "auto" }}
          >
            Save
          </Button>
        </View>
      </Modal>
    );
  };

  const RenameListModal = () => {
    // List name
    const [name, setName] = React.useState<string>(`${title}`);

    return (
      <Modal
        visible={displayRLModal}
        onDismiss={() => setDisplayRLModal(false)}
      >
        <Text variant="titleLarge">Rename List</Text>
        <TextInput
          value={name}
          mode="outlined"
          label={"New Name"}
          placeholder={"Enter list name"}
          maxLength={32}
          onChangeText={(value) => setName(value)}
          right={<TextInput.Affix text={`${32 - name.length}`} />}
        />

        <Button
          mode="contained"
          onPress={() => {
            DB.updateList(
              db,
              { id: `${id}`, name: name },
              () => {
                // Display success message, reload data and hide modal
                setMessage("List renamed");
                setDisplayMessage(true);
                setDisplayRLModal(false);
                trigger.setReload();
              },
              () => {
                // Display error message and hide modal
                setMessage(message);
                setDisplayMessage(true);
                setDisplayRLModal(false);
              }
            );
          }}
          disabled={name === ""}
        >
          Rename
        </Button>
      </Modal>
    );
  };

  // First completed task indicator
  let taskCount = 0;

  return (
    <Screen
      options={{ title: title }}
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
      <View style={Styles.screen}>
        {state.tasks.length === 0 ? (
          <View style={[Styles.fullScreen, { rowGap: 32 }]}>
            <Text variant="titleLarge">No tasks yet</Text>
            <Text>Add your tasks and keep track of your success</Text>
          </View>
        ) : (
          <View style={Styles.screen}>
            {state.tasks.length === count ? (
              <View style={{ alignItems: "center", padding: 16, rowGap: 16 }}>
                <Text variant="titleLarge">All tasks completed</Text>
                <Text>Nice work!</Text>
              </View>
            ) : undefined}

            <List.Section
              title={state.tasks.length !== count ? "Tasks" : undefined}
              style={Styles.screen}
            >
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
                renderItem={({ item }) => {
                  if (item.completed === "TRUE") {
                    taskCount++;
                  }

                  return (
                    <>
                      {taskCount === 1 && item.completed === "TRUE" ? (
                        <List.Subheader>Completed</List.Subheader>
                      ) : undefined}
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
                    </>
                  );
                }}
              />
            </List.Section>
          </View>
        )}

        <Actions
          open={displayActions}
          onPress={() => setDisplayActions(!displayActions)}
          actions={[
            {
              icon: "plus",
              label: "New Task",
              onPress: () => {
                // Hide actions and display new task modal
                setDisplayActions(false);
                setDisplayNTModal(true);
              },
            },
            {
              icon: "pencil",
              label: "Rename List",
              onPress: () => {
                // Hide actions and display Update List Modal
                setDisplayActions(false);
                setDisplayRLModal(true);
              },
            },
            {
              icon: "delete",
              label: "Delete List",
              onPress: () => {
                DB.deleteList(
                  db,
                  `${id}`,
                  () => {
                    // Display success message and hide actions
                    setMessage("List deleted");
                    setDisplayMessage(true);
                    setDisplayActions(false);

                    setTimeout(() => {
                      router.back();
                      trigger.setReload();
                    }, 1000);
                  },
                  () => {
                    // Display error message and hide actions
                    setMessage(message);
                    setDisplayMessage(true);
                    setDisplayActions(false);
                  }
                );
              },
            },
          ]}
        />

        <NewTaskModal />

        <RenameListModal />
      </View>
    </Screen>
  );
};

export default Tasks;
