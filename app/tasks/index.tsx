/**
 * Tasks Screen
 */

import React from "react";
import { View } from "react-native";
import * as SQLite from "expo-sqlite";
import { FlashList } from "@shopify/flash-list";
import { useRouter, useSearchParams } from "expo-router";
import { Button, IconButton, List, Text, TextInput } from "react-native-paper";
import { DB } from "../../utils";
import Styles from "../../styles";
import { Params, TaskType, TaskTypeState } from "../../types";
import { Actions, Modal, Screen, Task } from "../../components";

// Open the db
const db = SQLite.openDatabase("tasks.db");

const Tasks = () => {
  // Router
  const router = useRouter();

  // List details
  const { id, title } = useSearchParams<Params>();

  // State
  const [state, setState] = React.useState<TaskTypeState>({
    loading: true,
    tasks: [],
    completedTasks: [],
  });

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // New Task Modal
  const [displayNewTaskModal, setDisplayNewTaskModal] =
    React.useState<boolean>(false);

  // Rename List Modal
  const [displayRenameListModal, setDisplayRenameListModal] =
    React.useState<boolean>(false);

  // Completed tasks accordion
  const [displayCompletedTasks, setDisplayCompletedTasks] =
    React.useState<boolean>(false);

  // FAB actions
  const [displayActions, setDisplayActions] = React.useState<boolean>(false);

  // Reload trigger
  const [reload, setReload] = React.useState<boolean>(false);

  // Load data
  React.useEffect(() => {
    let tasks: TaskType[] = [];

    db.transaction((tx) => {
      // Load tasks
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE completed != "TRUE" AND list_id = ?`,
        [`${id}`],
        (_, { rows }) => {
          tasks = rows._array;
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

      // Load completed tasks
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE completed = "TRUE" AND list_id = ?`,
        [`${id}`],
        (_, { rows }) => {
          // Hide activity indicator and set data
          setState({
            ...state,
            loading: false,
            tasks: tasks,
            completedTasks: rows._array,
          });
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

  const NewTaskModal = () => {
    const [localState, setLocalState] = React.useState({
      title: "",
      description: "",
      starred: false,
    });

    return (
      <Modal
        visible={displayNewTaskModal}
        onDismiss={() => setDisplayNewTaskModal(false)}
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
          style={{ flexDirection: "row", alignItems: "center", columnGap: 16 }}
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
                  setDisplayNewTaskModal(false);
                  setReload(!reload);
                },
                () => {
                  // Display error message and hide modal
                  setMessage(message);
                  setDisplayMessage(true);
                  setDisplayNewTaskModal(false);
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
        visible={displayRenameListModal}
        onDismiss={() => setDisplayRenameListModal(false)}
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
                setDisplayRenameListModal(false);
                setReload(!reload);
              },
              () => {
                // Display error message and hide modal
                setMessage(message);
                setDisplayMessage(true);
                setDisplayRenameListModal(false);
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

  return (
    <Screen
      options={{ title: title }}
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
      <View style={Styles.screen}>
        {state.tasks.length === 0 && state.completedTasks.length === 0 ? (
          <View style={[Styles.fullScreen, { rowGap: 32 }]}>
            <Text variant="titleLarge">No tasks yet</Text>
            <Text>Add your tasks and keep track of your success</Text>
          </View>
        ) : (
          <>
            {state.tasks.length === 0 ? (
              <View style={[Styles.fullScreen, { rowGap: 32 }]}>
                <Text variant="titleLarge">All tasks completed</Text>
                <Text>Nice work!</Text>
              </View>
            ) : (
              <List.Section style={Styles.screen}>
                <FlashList
                  data={state.tasks}
                  estimatedItemSize={100}
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

            {state.completedTasks.length === 0 ? undefined : (
              <List.Accordion
                expanded={displayCompletedTasks}
                onPress={() => setDisplayCompletedTasks(!displayCompletedTasks)}
                title={`Completed (${state.completedTasks.length})`}
              >
                <FlashList
                  data={state.completedTasks}
                  estimatedItemSize={100}
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
              </List.Accordion>
            )}
          </>
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
                setDisplayNewTaskModal(true);
              },
            },
            {
              icon: "pencil",
              label: "Rename List",
              onPress: () => {
                // Hide actions and display Update List Modal
                setDisplayActions(false);
                setDisplayRenameListModal(true);
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
