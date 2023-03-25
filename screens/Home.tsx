/**
 * Home Screen
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl, View } from "react-native";
import { Button, FAB, List, Text, TextInput, useTheme } from "react-native-paper";
import { DB } from "../utils";
import Styles from "../styles";
import { ListTypeState } from "../types";
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

  // Modal
  const [displayModal, setDisplayModal] = React.useState<boolean>(false);

  // Refresh data
  const [refreshing, setRefreshing] = React.useState(false);

  // Reload trigger
  const [reload, setReload] = React.useState<boolean>(false);

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
  }, [reload]);

  const NewListModal = () => {
    // List name
    const [name, setName] = React.useState<string>("");

    return (
      <Modal visible={displayModal} onDismiss={() => setDisplayModal(false)}>
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
                setDisplayModal(false);
                setReload(!reload);
              },
              () => {
                // Display error message and hide modal
                setMessage(message);
                setDisplayMessage(true);
                setDisplayModal(false);
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
          <View style={Styles.fullScreen}>
            <Text variant="displaySmall">Welcome to Tasks</Text>
          </View>
        ) : (
          <List.Section title="Task Lists" style={Styles.screen}>
            <FlashList
              data={state.lists}
              estimatedItemSize={100}
              keyExtractor={(item) => `${item.id}`}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  colors={[theme.colors.primary]}
                  progressBackgroundColor={theme.colors.background}
                  onRefresh={() => {
                    setRefreshing(true);

                    setReload(!reload);
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
          onPress={() => setDisplayModal(true)}
          style={{ position: "absolute", right: 16, bottom: 16 }}
        />

        <NewListModal />
      </View>
    </Screen>
  );
};

export default Home;