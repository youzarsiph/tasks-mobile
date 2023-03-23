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

  // Mark a task completed or uncompleted
  const checkTask = (taskId: number, completed: boolean) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE task SET completed = ? WHERE id = ?",
        [completed ? "TRUE" : "FALSE", taskId],
        (_, data) => {
          // Display success message and reload data
          setMessage(completed ? "Task completed" : "Task marked uncompleted");
          setDisplayMessage(true);
          setReload(!reload);
        },
        (_, { message }) => {
          // Display error message
          setMessage(message);
          setDisplayMessage(true);

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
          // Display success message and reload data
          setMessage(starred ? "Task starred" : "Task removed from starred");
          setDisplayMessage(true);
          setReload(!reload);
        },
        (_, { message }) => {
          // Display error message
          setMessage(message);
          setDisplayMessage(true);

          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  };

  // Delete list
  const deleteList = (listId: string) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM list WHERE id = ?; COMMIT;",
        [listId],
        (_, data) => {
          // Display success message and hide actions
          setMessage("List deleted");
          setDisplayMessage(true);
          setDisplayActions(false);

          setTimeout(() => {
            router.back();
          }, 1000);
        },
        (_, { message }) => {
          // Display error message and hide actions
          setMessage(message);
          setDisplayMessage(true);
          setDisplayActions(false);

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
    const createTask = () => {
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
            // Display success message, reload data and hide modal
            setMessage("Task created");
            setDisplayMessage(true);
            setDisplayNewTaskModal(false);
            setReload(!reload);
          },
          (_, { message }) => {
            // Display error message and hide modal
            setMessage(message);
            setDisplayMessage(true);
            setDisplayNewTaskModal(false);

            console.log(`Error: ${message}`);

            return true;
          }
        );
      });
    };

    return (
      <Modal
        visible={displayNewTaskModal}
        onDismiss={() => setDisplayNewTaskModal(false)}
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
            onPress={createTask}
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
            // Display success message, reload data and hide modal
            setMessage("List renamed");
            setDisplayMessage(true);
            setDisplayRenameListModal(false);
            setReload(!reload);
          },
          (_, { message }) => {
            // Display error message and hide modal
            setMessage(message);
            setDisplayMessage(true);
            setDisplayRenameListModal(false);

            console.log(`Error: ${message}`);

            return true;
          }
        );
      });
    };

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
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
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
                  expanded={displayCompletedTasks}
                  onPress={() =>
                    setDisplayCompletedTasks(!displayCompletedTasks)
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
                // Delete the list
                deleteList(`${id}`);
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
