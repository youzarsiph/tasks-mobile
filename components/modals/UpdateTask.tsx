/**
 * A modal for updating a task
 */

import React from "react";
import { View } from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Modal from "../Modal";
import Styles from "../../styles";
import { TaskAPI } from "../../utils";

const UpdateTask = (props: {
  data: {
    id: string;
    title: string;
    description: string;
    starred: boolean;
    completed: boolean;
    deadline?: string;
    completion_rate: number;
  };
  token: string;
  visible: boolean;
  onDismiss: () => void;
  callback: () => void;
  errorCallback: (message: string) => void;
}) => {
  // State
  const [task, setTask] = React.useState<{
    title: string;
    description: string;
    starred: boolean;
    completed: boolean;
    completion_rate: string;
    deadline?: string;
  }>({
    title: props.data.title || "",
    starred: props.data.starred || false,
    completed: props.data.completed || false,
    description: props.data.description || "",
    deadline: props.data.deadline || undefined,
    completion_rate: `${props.data.completion_rate || 0}`,
  });

  const [show, setShow] = React.useState<boolean>(false);

  return (
    <Modal
      visible={props.visible}
      title={`Change Task: ${task.title}`}
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
          style={{ width: "48%" }}
          placeholder={"DD/MM/YYYY"}
          value={new Date(`${task.deadline}`).toLocaleDateString()}
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
          mode={task.completed ? "contained" : "contained-tonal"}
          onPress={() => setTask({ ...task, completed: !task.completed })}
        >
          {task.completed ? "Mark uncompleted" : "Mark completed"}
        </Button>
      </View>

      <Button
        mode="contained"
        disabled={task.title === ""}
        onPress={() => {
          (async () => {
            await TaskAPI.update(
              props.token,
              `${props.data.id}`,
              {
                title: task.title,
                starred: task.starred,
                completed: task.completed,
                description: task.description,
                deadline: task.deadline?.toString(),
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
    </Modal>
  );
};

export default UpdateTask;
