/**
 * Task Details Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { View, StyleSheet } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { Button, List, ProgressBar, Text } from "react-native-paper";
import Styles from "../../styles";
import { server } from "../../data.env";
import { UpdateTask } from "../../components/modals";
import { HeaderProps, Params, TaskScreenState } from "../../types";
import { Header, Screen, ConfirmationDialog } from "../../components";
import {
  ReloadContext,
  TaskAPI,
  calculateDuration,
  useAuth,
  useMessage,
} from "../../utils";

// Open db
const db = SQLite.openDatabase("taskLists.db");
const TaskDetails = () => {
  // Router
  const router = useRouter();

  // Auth token
  const { token } = useAuth();

  // Message
  const { showMessage } = useMessage();

  // Task id
  const { id } = useSearchParams<Params>();

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Update Task Modal
  const [displayUTModal, setDisplayUTModal] = React.useState<boolean>(false);

  // Task delete confirmation dialog
  const [displayDCDialog, setDisplayDCDialog] = React.useState<boolean>(false);

  // State
  const [state, setState] = React.useState<TaskScreenState>({
    loading: true,
    data: {
      id: 1,
      title: "Task title",
      description: "Task description",
      deadline: Date(),
      starred: false,
      completed: false,
      completion_rate: 0,
      created_at: Date(),
      updated_at: Date(),
    },
  });

  // Load task
  React.useEffect(() => {
    (async () => {
      await fetch(`${server}tasks/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setState({ data: data, loading: false });
        })
        .catch((e) => {
          setState({ ...state, loading: false });
          showMessage(e.message);
        });
    })();
  }, [trigger.taskReload]);

  const deadline = new Date(state.data.deadline || "");
  const duration = calculateDuration(
    new Date(state.data.updated_at),
    new Date(state.data.created_at)
  );

  return (
    <Screen
      loading={state.loading}
      options={{
        title: "Details",
        header: (props: HeaderProps) => (
          <Header
            {...props}
            updateCallback={() => setDisplayUTModal(true)}
            deleteCallback={() => setDisplayDCDialog(true)}
            starCallback={() => {
              (async () => {
                await TaskAPI.star(
                  token,
                  db,
                  `${state.data.id}`,
                  { starred: state.data.starred },
                  () => {
                    // Display message and reload data
                    showMessage(
                      !state.data.starred
                        ? "Task starred"
                        : "Task removed from starred"
                    );

                    setTimeout(() => {
                      router.back();
                      trigger.setTaskReload();
                    }, 1000);
                  },
                  (message) => showMessage(message)
                );
              })();
            }}
          />
        ),
      }}
    >
      <View style={Styles.screen}>
        <ProgressBar progress={state.data.completion_rate / 100} />
        <View style={styles.screen}>
          <Text variant="titleLarge">{state.data.title}</Text>
          {state.data.description !== null ? (
            <Text>{state.data.description}</Text>
          ) : undefined}

          <List.Section>
            {state.data.deadline !== null ? (
              <List.Item
                title="Deadline"
                description={`Due ${deadline.toUTCString()}`}
              />
            ) : undefined}

            {state.data.completed ? (
              <List.Item
                title="Completion Duration"
                description={`Time taken to complete this task: ${duration}`}
              />
            ) : undefined}
          </List.Section>
        </View>

        <View style={styles.bar}>
          <Button
            style={{ width: "100%" }}
            mode={state.data.completed ? "contained" : "contained-tonal"}
            onPress={() => {
              (async () => {
                await TaskAPI.check(
                  token,
                  db,
                  `${state.data.id}`,
                  { completed: state.data.completed },
                  () => {
                    // Display message and reload data
                    showMessage(
                      !state.data.completed
                        ? "Task completed"
                        : "Task marked uncompleted"
                    );

                    setTimeout(() => {
                      router.back();
                      trigger.setTaskReload();
                    }, 1000);
                  },
                  (message) => showMessage(message)
                );
              })();
            }}
          >
            {state.data.completed ? "Mark Uncompleted" : "Mark Completed"}
          </Button>
        </View>
      </View>

      <UpdateTask
        token={token}
        visible={displayUTModal}
        onDismiss={() => setDisplayUTModal(false)}
        errorCallback={(message) => showMessage(message)}
        data={{
          id: `${id}`,
          title: state.data.title,
          description: state.data.description,
          starred: state.data.starred,
          completed: state.data.completed,
          completion_rate: state.data.completion_rate,
        }}
        callback={() => {
          // Display and reload data
          showMessage("Task updated");

          setTimeout(() => {
            router.back();
            trigger.setTaskReload();
          }, 1000);
        }}
      />

      <ConfirmationDialog
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        visible={displayDCDialog}
        onDismiss={() => setDisplayDCDialog(false)}
        delete={() => {
          (async () => {
            await TaskAPI.delete(
              token,
              `${state.data.id}`,
              () => {
                // Display message and reload data
                showMessage("Task deleted");

                // Navigate back
                setTimeout(() => {
                  router.back();
                  trigger.setTaskReload();
                }, 1000);
              },
              (message) => showMessage(message)
            );

            setDisplayDCDialog(false);
          })();
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
    padding: 16,
  },
  bar: {
    ...Styles.row,
    padding: 16,
  },
});

export default TaskDetails;
