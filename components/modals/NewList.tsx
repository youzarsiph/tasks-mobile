/**
 * A modal for creating new task lists
 */

import React from "react";
import * as SQLite from "expo-sqlite";
import { Button, TextInput } from "react-native-paper";
import Modal from "../Modal";
import { ListAPI } from "../../utils";

const NewList = (props: {
  token: string;
  db: SQLite.WebSQLDatabase;
  visible: boolean;
  onDismiss: () => void;
  callback: () => void;
  errorCallback: (message: string) => void;
}) => {
  // List name
  const [state, setState] = React.useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  return (
    <Modal
      title="Add New List"
      visible={props.visible}
      onDismiss={() => props.onDismiss()}
    >
      <TextInput
        maxLength={32}
        mode="outlined"
        value={state.name}
        label={"List name"}
        placeholder={"Name"}
        onChangeText={(value) => setState({ ...state, name: value })}
        right={<TextInput.Affix text={`${32 - state.name.length}`} />}
      />

      <TextInput
        multiline
        maxLength={256}
        mode="outlined"
        value={state.description}
        label={"List description"}
        placeholder={"Description"}
        onChangeText={(value) => setState({ ...state, description: value })}
        right={<TextInput.Affix text={`${256 - state.description.length}`} />}
      />

      <Button
        mode="contained"
        disabled={state.name === ""}
        onPress={() => {
          (async () => {
            await ListAPI.create(
              props.token,
              props.db,
              state,
              () => {
                props.callback();
                setState({ name: "", description: "" });
              },
              (message) => props.errorCallback(message)
            );
          })();

          // Hide modal
          props.onDismiss();
        }}
      >
        Save
      </Button>
    </Modal>
  );
};

export default NewList;
