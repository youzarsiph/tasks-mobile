/**
 * Home Screen
 */

import React from "react";
import Styles from "../styles";
import { ListTypeState } from "../types";
import * as SQLite from "expo-sqlite";
import { useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import { Button, FAB, List, Text, TextInput } from "react-native-paper";
import { Screen, TaskList, Modal } from "../components";

// Open the db
const db = SQLite.openDatabase("tasks.db");

const Home = () => {
  // Router
  const router = useRouter();

  // State
  const [state, setState] = React.useState<ListTypeState>({
    loading: true,
    lists: [],
    message: "",
    displayMessage: false,
    reload: false,
    displayModal: false,
  });

  // Load task lists
  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT id, name, created_at as createdAt, updated_at as updatedAt FROM list",
        [],
        (_, { rows }) => {
          // Set the data and hide activity indicator
          setState({ ...state, lists: rows._array, loading: false });
        },
        (_, { message }) => {
          console.log(`Error: ${message}`);

          return true;
        }
      );
    });
  }, [state.reload]);

  const NewListModal = () => {
    // List name
    const [name, setName] = React.useState<string>("");

    // Create new list
    const saveList = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO list (name) values (?)",
          [name],
          (_, data) => {
            // Clear TextInput
            setName("");

            // Display the success message, reload the data and hide the modal
            setState({
              ...state,
              message: "List created",
              displayMessage: true,
              reload: !state.reload,
              displayModal: false,
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

    return (
      <Modal
        visible={state.displayModal}
        onDismiss={() => setState({ ...state, displayModal: false })}
      >
        <Text variant="titleLarge">Create New List</Text>
        <TextInput
          value={name}
          mode="outlined"
          label={"New List"}
          placeholder={"Enter list name"}
          onChangeText={(value) => setName(value)}
        />

        <Button mode="contained" onPress={saveList} disabled={name === ""}>
          Save
        </Button>
      </Modal>
    );
  };

  return (
    <Screen
      loading={state.loading}
      message={state.message}
      options={{ title: "Tasks" }}
      displayMessage={state.displayMessage}
      onDismissMessage={() => setState({ ...state, displayMessage: false })}
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
          onPress={() => setState({ ...state, displayModal: true })}
          style={{ position: "absolute", right: 16, bottom: 16 }}
        />

        <NewListModal />
      </View>
    </Screen>
  );
};

export default Home;
