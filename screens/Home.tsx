/**
 * Home Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import {
  Button,
  FAB,
  List,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import Styles from "../styles";
import { ListTypeState } from "../types";
import { DB, ReloadContext } from "../utils";
import { Screen, TaskList, Modal } from "../components";

// Open the db
const db = SQLite.openDatabase("tasks.db");

const Home = () => {
  // Router
  const router = useRouter();

  // Theme
  const theme = useTheme();

  // State
  const [state, setState] = React.useState<ListTypeState>({
    loading: true,
    lists: [],
  });

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // New List Modal
  const [displayNLModal, setDisplayNLModal] = React.useState<boolean>(false);

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // Reload trigger
  const trigger = React.useContext(ReloadContext);

  // Load task lists
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT id, name, created_at as createdAt, updated_at as updatedAt FROM list",
        [],
        (_, { rows }) => {
          // Set data and hide activity indicator
          setState({ lists: rows._array, loading: false });

          setRefreshing(false);
        },
        (_, { message }) => {
          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  }, [trigger.reload]);

  const NewListModal = () => {
    // List name
    const [name, setName] = React.useState<string>("");

    return (
      <Modal
        visible={displayNLModal}
        onDismiss={() => setDisplayNLModal(false)}
      >
        <Text variant="titleLarge">Create New List</Text>
        <TextInput
          value={name}
          mode="outlined"
          label={"New List"}
          placeholder={"Enter list name"}
          onChangeText={(value) => setName(value)}
          maxLength={32}
          right={<TextInput.Affix text={`${32 - name.length}`} />}
        />

        <Button
          mode="contained"
          disabled={name === ""}
          onPress={() => {
            DB.createList(
              db,
              name,
              () => {
                // Clear TextInput
                setName("");

                // Display success message, reload data and hide modal
                setMessage("List created");
                setDisplayMessage(true);
                setDisplayNLModal(false);
                trigger.setReload();
              },
              () => {
                // Display error message and hide modal
                setMessage(message);
                setDisplayMessage(true);
                setDisplayNLModal(false);
              }
            );
          }}
        >
          Save
        </Button>
      </Modal>
    );
  };

  return (
    <Screen
      options={{ title: "Tasks" }}
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
      <View style={Styles.screen}>
        {state.lists.length === 0 ? (
          <View style={[Styles.fullScreen, { rowGap: 32 }]}>
            <Text variant="displaySmall">Welcome to Tasks</Text>
            <Text style={{ textAlign: "center", paddingHorizontal: 32 }}>
              Start your success journey by creating a task list and adding
              tasks
            </Text>
          </View>
        ) : (
          <List.Section title="Task Lists" style={Styles.screen}>
            <FlashList
              data={state.lists}
              estimatedItemSize={52}
              keyExtractor={(item) => `${item.id}`}
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
              renderItem={({ item }) => (
                <TaskList
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "tasks/",
                      params: { id: item.id, title: item.name },
                    })
                  }
                />
              )}
            />
          </List.Section>
        )}

        <FAB
          mode="flat"
          icon="plus"
          size="medium"
          onPress={() => setDisplayNLModal(true)}
          style={{ position: "absolute", right: 16, bottom: 16 }}
        />

        <NewListModal />
      </View>
    </Screen>
  );
};

export default Home;
