/**
 * A modal for creating a new task
 */

import React from "react";
import { View } from "react-native";
import * as SQLite from "expo-sqlite";
import { Button, IconButton, TextInput } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Modal from "../Modal";
import Styles from "../../styles";
import { TaskAPI } from "../../utils";

const NewTask = (props: {
  token: string;
  db: SQLite.WebSQLDatabase;
  id: string;
  visible: boolean;
  onDismiss: () => void;
  callback: () => void;
  errorCallback: (message: string) => void;
}) => {
  // State
  const [task, setTask] = React.useState<{
    title: string;
    starred: boolean;
    deadline?: string;
    description: string;
    completion_rate: string;
  }>({
    title: "",
    starred: false,
    description: "",
    deadline: undefined,
    completion_rate: "0",
  });

  const [show, setShow] = React.useState<boolean>(false);

  return (
    <Modal
      title="Add New Task"
      visible={props.visible}
      onDismiss={() => props.onDismiss()}
    >
      <TextInput
        value={task.title}
        maxLength={32}
        mode="outlined"
        label={"Task title"}
        placeholder={"Title"}
        onChangeText={(value) => setTask({ ...task, title: value })}
        right={<TextInput.Affix text={`${32 - task.title.length}`} />}
      />

      <TextInput
        multiline
        maxLength={256}
        mode="outlined"
        value={task.description}
        label={"Task description"}
        placeholder={"Description"}
        onChangeText={(value) => setTask({ ...task, description: value })}
        right={<TextInput.Affix text={`${256 - task.description.length}`} />}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <TextInput
          maxLength={3}
          mode="outlined"
          placeholder={"Rate"}
          style={{ width: "48%" }}
          label={"Completion rate"}
          keyboardType="number-pad"
          value={task.completion_rate.toString()}
          onChangeText={(value) => setTask({ ...task, completion_rate: value })}
        />

        <TextInput
          mode="outlined"
          label={"Deadline"}
          value={task.deadline}
          placeholder={"Deadline"}
          style={{ width: "48%" }}
          onChangeText={(value) => setTask({ ...task, deadline: value })}
        />
      </View>

      {show && (
        <DateTimePicker
          mode={"date"}
          is24Hour={true}
          minimumDate={new Date()}
          value={
            task.deadline !== undefined ? new Date(task.deadline) : new Date()
          }
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShow(false);
            setTask({ ...task, deadline: date?.toISOString().split("T")[0] });
          }}
        />
      )}

      <View style={Styles.row}>
        <View style={Styles.row}>
          <IconButton
            icon={task.starred ? "star" : "star-outline"}
            onPress={() => setTask({ ...task, starred: !task.starred })}
          />

          <IconButton icon={"update"} onPress={() => setShow(!show)} />
        </View>

        <Button
          mode="contained"
          disabled={task.title === ""}
          onPress={() => {
            (async () => {
              await TaskAPI.create(
                props.token,
                props.db,
                props.id,
                {
                  title: task.title,
                  starred: task.starred,
                  deadline: task.deadline,
                  description: task.description,
                  completion_rate: task.completion_rate,
                },
                () => props.callback(),
                (message) => props.errorCallback(message)
              );
            })();

            // Hide modal
            props.onDismiss();
          }}
        >
          Save
        </Button>
      </View>
    </Modal>
  );
};

export default NewTask;
