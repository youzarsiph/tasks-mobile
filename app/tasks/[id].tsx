/**
 * Task Details Screen
 */

import React from "react";
import { View } from "react-native";
import * as SQLite from "expo-sqlite";
import { useRouter, useSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Appbar,
  Button,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Styles from "../../styles";
import { DB, ReloadContext } from "../../utils";
import { Screen, Modal } from "../../components";
import { Params, State, TaskType } from "../../types";

const BOTTOM_APPBAR_HEIGHT = 80;

// Open the db
const db = SQLite.openDatabase("tasks.db");

interface DetailsState extends State {
  task: TaskType;
}

const TaskDetails = () => {
  // Task details
  const { id } = useSearchParams<Params>();

  // Router
  const router = useRouter();

  // Theme
  const theme = useTheme();

  // Insets
  const { bottom } = useSafeAreaInsets();

  // State
  const [state, setState] = React.useState<DetailsState>({
    loading: true,
    task: {
      id: 1,
      title: "Task title",
      description: "Task description",
      starred: "FALSE",
      completed: "FALSE",
      createdAt: Date(),
      updatedAt: Date(),
    },
  });

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // Update Task Modal
  const [displayUTModal, setDisplayUTModal] = React.useState<boolean>(false);

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Load task
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, title, starred, completed, description, created_at as createdAt, updated_at as updatedAt FROM task WHERE id = ?`,
        [`${id}`],
        (_, { rows }) => {
          // Hide activity indicator
          setState({ ...state, loading: false, task: rows._array[0] });
        },
        (_, { message }) => {
          // Display error message
          setMessage(message);
          setDisplayMessage(true);
          setState({ ...state, loading: false });

          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  }, [trigger.reload]);

  const UpdateTaskModal = () => {
    const [localState, setLocalState] = React.useState({
      title: state.task.title,
      description: state.task.description,
      starred: state.task.starred === "TRUE",
      completed: state.task.completed === "TRUE",
    });

    return (
      <Modal
        visible={displayUTModal}
        onDismiss={() => setDisplayUTModal(false)}
      >
        <Text variant="titleLarge">Update Task</Text>

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
            icon={
              localState.completed
                ? "checkbox-marked"
                : "checkbox-blank-outline"
            }
            onPress={() =>
              setLocalState({ ...localState, completed: !localState.completed })
            }
          />

          <IconButton
            icon={localState.starred ? "star" : "star-outline"}
            onPress={() =>
              setLocalState({ ...localState, starred: !localState.starred })
            }
          />

          <Button
            mode="contained"
            style={{ marginLeft: "auto" }}
            disabled={localState.title === ""}
            onPress={() => {
              DB.updateTask(
                db,
                {
                  id: `${state.task.id}`,
                  title: localState.title,
                  description: localState.description,
                  starred: localState.starred,
                  completed: localState.completed,
                },
                () => {
                  // Display success message, reload data and hide modal
                  setMessage("Task updated");
                  setDisplayMessage(true);
                  setDisplayUTModal(false);

                  // Navigate back
                  setTimeout(() => {
                    router.back();
                    trigger.setReload();
                  }, 1000);
                },
                () => {
                  // Display error message and hide modal
                  setMessage(message);
                  setDisplayMessage(true);
                  setDisplayUTModal(false);
                }
              );
            }}
          >
            Save
          </Button>
        </View>
      </Modal>
    );
  };

  return (
    <Screen
      options={{ title: "Task Details" }}
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
      <View style={Styles.screen}>
        <View style={{ rowGap: 32, padding: 16 }}>
          <Text variant="titleLarge">{state.task.title}</Text>
          <Text>{state.task.description}</Text>
        </View>

        <Appbar
          safeAreaInsets={{ bottom }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: BOTTOM_APPBAR_HEIGHT + bottom,
            backgroundColor: theme.colors.elevation.level1,
          }}
        >
          <Appbar.Action
            color={
              state.task.completed === "TRUE" ? theme.colors.primary : undefined
            }
            icon={
              state.task.completed === "TRUE"
                ? "checkbox-marked"
                : "checkbox-blank-outline"
            }
            onPress={() => {
              DB.checkTask(
                db,
                {
                  id: `${state.task.id}`,
                  completed: state.task.completed !== "TRUE",
                },
                () => {
                  // Display success message and reload data
                  setMessage(
                    state.task.completed !== "TRUE"
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
          />
          <Appbar.Action
            icon={state.task.starred === "TRUE" ? "star" : "star-outline"}
            onPress={() => {
              DB.starTask(
                db,
                {
                  id: `${state.task.id}`,
                  starred: state.task.starred !== "TRUE",
                },
                () => {
                  // Display success message and reload data
                  setMessage(
                    state.task.starred !== "TRUE"
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
            color={
              state.task.starred === "TRUE" ? theme.colors.primary : undefined
            }
          />
          <Appbar.Action
            icon="pencil"
            onPress={() => setDisplayUTModal(true)}
          />
          <Appbar.Action
            icon="delete"
            onPress={() => {
              DB.deleteTask(
                db,
                `${state.task.id}`,
                () => {
                  // Display success message and trig reload
                  setMessage("Task deleted");
                  setDisplayMessage(true);

                  // Navigate back
                  setTimeout(() => {
                    router.back();
                    trigger.setReload();
                  }, 1000);
                },
                () => {
                  // Display error message
                  setMessage(message);
                  setDisplayMessage(true);
                }
              );
            }}
          />
        </Appbar>
      </View>

      <UpdateTaskModal />
    </Screen>
  );
};

export default TaskDetails;
