/**
 * Tasks Screen
 */

import React from "react";
import Styles from "../../styles";
import * as SQLite from "expo-sqlite";
import { FlatList, View } from "react-native";
import { Params, TaskType, TaskTypeState } from "../../types";
import { useRouter, useSearchParams } from "expo-router";
import { Button, IconButton, List, Text, TextInput } from "react-native-paper";
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
    displayCompletedTasks: false,
    message: "",
    displayMessage: false,
    reload: false,
    displayModal: false,
    displayFABGroup: false,
    displayUpdateModal: false,
  });

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

      // Load completed tasks
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE completed = "TRUE" AND list_id = ?`,
        [`${id}`],
        (_, { rows }) => {
          // Hide activity indicator and set the data
          setState({
            ...state,
            loading: false,
            tasks: tasks,
            completedTasks: rows._array,
          });
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

  // Mark a task completed or uncompleted
  const checkTask = (taskId: number, completed: boolean) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE task SET completed = ? WHERE id = ?",
        [completed ? "TRUE" : "FALSE", taskId],
        (_, data) => {
          // Display success message and reload data
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

  // Star or un-start a task
  const starTask = (taskId: number, starred: boolean) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE task SET starred = ? WHERE id = ?",
        [starred ? "TRUE" : "FALSE", taskId],
        (_, data) => {
          // Display the success message and reload the data
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

  const NewTaskModal = () => {
    const [localState, setLocalState] = React.useState({
      title: "",
      description: "",
      starred: false,
    });

    // Create new task
    const saveTask = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO task (title, description, starred, list_id) values (?, ?, ?, ?)",
          [
            localState.title,
            localState.description,
            localState.starred ? "TRUE" : "FALSE",
            `${id}`,
          ],
          (_, data) => {
            // Display success message, reload the data and hide the modal
            setState({
              ...state,
              message: "Task created",
              displayMessage: true,
              displayModal: false,
              reload: !state.reload,
            });
          },
          (_, { message }) => {
            // Display error message and hide modal
            setState({
              ...state,
              message: message,
              displayMessage: true,
              displayModal: false,
            });
            console.log(`Error: ${message}`);

            return true;
          }
        );
      });
    };

    return (
      <Modal
        visible={state.displayModal}
        onDismiss={() => setState({ ...state, displayModal: false })}
      >
        <Text variant="titleLarge">Create New Task</Text>

        <TextInput
          value={localState.title}
          mode="outlined"
          label={"Task title"}
          placeholder={"Enter task title"}
          onChangeText={(value) =>
            setLocalState({ ...localState, title: value })
          }
        />

        <TextInput
          multiline
          mode="outlined"
          numberOfLines={2}
          value={localState.description}
          label={"Task description"}
          placeholder={"Enter task details"}
          onChangeText={(value) =>
            setLocalState({ ...localState, description: value })
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
            onPress={saveTask}
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

    // Create new list
    const renameList = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "UPDATE list SET name = ? WHERE id = ?; COMMIT;",
          [name, `${id}`],
          (_, data) => {
            // Display the success message, reload the data and hide the modal
            setState({
              ...state,
              displayModal: false,
              message: "List renamed",
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
              displayModal: false,
            });

            console.log(`Error: ${message}`);

            return true;
          }
        );
      });
    };

    return (
      <Modal
        visible={state.displayUpdateModal}
        onDismiss={() => setState({ ...state, displayUpdateModal: false })}
      >
        <Text variant="titleLarge">Rename List</Text>
        <TextInput
          value={name}
          mode="outlined"
          label={"New Name"}
          placeholder={"Enter list name"}
          onChangeText={(value) => setName(value)}
        />

        <Button mode="contained" onPress={renameList} disabled={name === ""}>
          Rename
        </Button>
      </Modal>
    );
  };

  return (
    <Screen
      loading={state.loading}
      message={state.message}
      displayMessage={state.displayMessage}
      onDismissMessage={() => setState({ ...state, displayMessage: false })}
      options={{ title: title, animation: "slide_from_right" }}
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

            {state.completedTasks.length === 0 ? undefined : (
              <List.Section>
                <List.Accordion
                  expanded={state.displayCompletedTasks}
                  onPress={() =>
                    setState({
                      ...state,
                      displayCompletedTasks: !state.displayCompletedTasks,
                    })
                  }
                  title={`Completed (${state.completedTasks.length})`}
                >
                  <FlatList
                    data={state.completedTasks}
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
                </List.Accordion>
              </List.Section>
            )}
          </>
        )}

        <Actions
          open={state.displayFABGroup}
          onPress={() =>
            setState({ ...state, displayFABGroup: !state.displayFABGroup })
          }
          actions={[
            {
              icon: "plus",
              label: "New Task",
              onPress: () => {
                // Hide actions and display new task modal
                setState({
                  ...state,
                  displayModal: true,
                  displayFABGroup: false,
                });
              },
            },
            {
              icon: "pencil",
              label: "Rename List",
              onPress: () => {
                // Hide actions and display Update List Modal
                setState({
                  ...state,
                  displayFABGroup: false,
                  displayUpdateModal: true,
                });
              },
            },
            {
              icon: "delete",
              label: "Delete List",
              onPress: () => {
                // Delete the list
                db.transaction((tx) => {
                  tx.executeSql(
                    "DELETE FROM list WHERE id = ?; COMMIT;",
                    [`${id}`],
                    (_, data) => {
                      // Display the success message
                      setState({
                        ...state,
                        message: "List deleted",
                        displayMessage: true,
                        displayFABGroup: false,
                      });

                      setTimeout(() => {
                        router.back();
                      }, 3000);
                    },
                    (_, { message }) => {
                      // Display error message
                      setState({
                        ...state,
                        message: message,
                        displayMessage: true,
                        displayFABGroup: false,
                      });

                      console.log(`Error: ${message}`);

                      return true;
                    }
                  );
                });
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
