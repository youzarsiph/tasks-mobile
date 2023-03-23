/**
 * Home Screen
 */

import React from "react";
import Styles from "../styles";
import { ListTypeState } from "../types";
import * as SQLite from "expo-sqlite";
import { useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import {
  BottomNavigation,
  Button,
  FAB,
  List,
  Text,
  TextInput,
} from "react-native-paper";
import { Screen, TaskList, Modal } from "../components";
import { DB } from "../utils";

// Open the db
const db = SQLite.openDatabase("tasks.db");

const Home = () => {
  // Router
  const router = useRouter();

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
      loading={state.loading}
      message={message}
      options={{ title: "Tasks" }}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
      <View style={Styles.screen}>
        {state.lists.length === 0 ? (
          <View style={Styles.fullScreen}>
            <Text variant="displaySmall">Welcome to Tasks</Text>
          </View>
        ) : (
          <List.Section title="Task lists" style={Styles.screen}>
            <List.Item
              title="Starred Tasks"
              onPress={() => router.push("tasks/starred")}
              right={(props) => <List.Icon {...props} icon={"star"} />}
            />
            <List.Item
              title="Completed Tasks"
              onPress={() => router.push("tasks/completed")}
              right={(props) => <List.Icon {...props} icon={"check"} />}
            />

            <FlatList
              data={state.lists}
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
