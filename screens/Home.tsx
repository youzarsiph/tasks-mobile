/**
 * Home Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import { Button, FAB, List, Text, useTheme } from "react-native-paper";
import Styles from "../styles";
import { HomeScreenState } from "../types";
import { NewList } from "../components/modals";
import { Screen, TaskList } from "../components";
import { ListAPI, ReloadContext, useAuth, useMessage } from "../utils";

// Open db
const db = SQLite.openDatabase("taskLists.db");

const Home = () => {
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
  const [state, setState] = React.useState<HomeScreenState>({
    data: [],
    loading: true,
  });

  // New List Modal
  const [displayNLModal, setDisplayNLModal] = React.useState<boolean>(false);

  // Load task lists
  React.useEffect(() => {
    (async () => {
      await ListAPI.objects(
        token,
        db,
        (data) => {
          setState({ data: data, loading: false });
          setRefreshing(false);
        },
        (message) => {
          setState({ data: [], loading: false });
          showMessage(message);
        }
      );
    })();
  }, [trigger.listReload]);

  return (
    <Screen loading={state.loading} options={{ title: "Tasks" }}>
      <View style={Styles.screen}>
        {state.data.length === 0 ? (
          <View style={Styles.welcome}>
            <Text variant="displayLarge">Tasks</Text>
            <Text variant="titleMedium">Where your success journey starts</Text>
            <Text variant="bodyLarge" style={Styles.lead}>
              Start by creating a task list and adding tasks
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
          <List.Section title="Task Lists" style={Styles.screen}>
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

                    trigger.setListReload();
                  }}
                />
              }
              renderItem={({ item }) => (
                <TaskList
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "tasks/",
                      params: { listId: item.id },
                    })
                  }
                />
              )}
            />
          </List.Section>
        )}

        <FAB
          icon="plus"
          style={Styles.fab}
          onPress={() => setDisplayNLModal(true)}
        />

        <NewList
          token={token}
          db={db}
          visible={displayNLModal}
          onDismiss={() => setDisplayNLModal(false)}
          errorCallback={(message) => showMessage(message)}
          callback={() => {
            // Display message, reload data and clear input
            showMessage("List created");
            trigger.setListReload();
          }}
        />
      </View>
    </Screen>
  );
};

export default Home;
