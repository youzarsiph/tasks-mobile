/**
 * Tasks
 */

import React from "react";
import { TaskType } from "../types";
import { IconButton, List, useTheme } from "react-native-paper";

const Task = (props: {
  item: TaskType;
  callback: () => void;
  checkCallback: () => void;
  starCallback: () => void;
}) => {
  // Theme
  const theme = useTheme();

  const [completed, setCompleted] = React.useState<boolean>(
    props.item.completed === "TRUE"
  );

  const [starred, setStarred] = React.useState<boolean>(
    props.item.starred === "TRUE"
  );

  return (
    <List.Item
      title={props.item.title}
      description={props.item.description}
      onPress={() => props.callback()}
      left={(properties) => (
        <IconButton
          {...properties}
          iconColor={completed ? theme.colors.primary : undefined}
          icon={completed ? "checkbox-marked" : "checkbox-blank-outline"}
          onPress={() => {
            setCompleted(!completed);

            props.checkCallback();
          }}
        />
      )}
      right={(properties) => (
        <IconButton
          {...properties}
          icon={starred ? "star" : "star-outline"}
          iconColor={starred ? theme.colors.primary : undefined}
          onPress={() => {
            setStarred(!starred);

            props.starCallback();
          }}
        />
      )}
    />
  );
};

export default Task;
