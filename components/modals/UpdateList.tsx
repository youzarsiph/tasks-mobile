/**
 * A modal for updating a list
 */

import React from "react";
import { Button, TextInput } from "react-native-paper";
import Modal from "../Modal";
import { ListAPI } from "../../utils";

const UpdateList = (props: {
  data: { id: string; name: string; description: string };
  token: string;
  visible: boolean;
  onDismiss: () => void;
  callback: () => void;
  errorCallback: (message: string) => void;
}) => {
  // List
  const [lst, setLst] = React.useState<{
    name: string;
    description: string;
  }>({
    name: props.data.name || "",
    description: props.data.description || "",
  });

  return (
    <Modal
      title={`Change List ${lst.name}`}
      visible={props.visible}
      onDismiss={() => props.onDismiss()}
    >
      <TextInput
        maxLength={32}
        mode="outlined"
        value={lst.name}
        label={"List name"}
        placeholder={"Name"}
        onChangeText={(value) => setLst({ ...lst, name: value })}
        right={<TextInput.Affix text={`${32 - lst.name.length}`} />}
      />

      <TextInput
        multiline
        maxLength={256}
        mode="outlined"
        value={lst.description}
        label={"List description"}
        placeholder={"Description"}
        onChangeText={(value) => setLst({ ...lst, description: value })}
        right={<TextInput.Affix text={`${256 - lst.description.length}`} />}
      />

      <Button
        mode="contained"
        onPress={() => {
          (async () => {
            await ListAPI.update(
              props.token,
              new Date(),
              {
                id: `${props.data.id}`,
                name: lst.name,
                description: lst.description,
              },
              () => props.callback(),
              (message) => props.errorCallback(message)
            );
          })();

          // Hide modal
          props.onDismiss();
        }}
        disabled={lst.name === ""}
      >
        Save
      </Button>
    </Modal>
  );
};

export default UpdateList;
