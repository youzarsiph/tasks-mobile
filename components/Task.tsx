/**
 * Tasks
 */

import React from "react";
import { View } from "react-native";
import { IconButton, List, ProgressBar, useTheme } from "react-native-paper";
import { TaskType } from "../types";

const Task = (props: {
  item: TaskType;
  callback: () => void;
  checkCallback: () => void;
  starCallback?: () => void;
}) => {
  // Theme
  const theme = useTheme();

  const [starred, setStarred] = React.useState<boolean>(props.item.starred);
  const [completed, setCompleted] = React.useState<boolean>(
    props.item.completed
  );

  return (
    <View>
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
        right={
          !props.item.completed || props.starCallback !== undefined
            ? (properties) => (
                <IconButton
                  {...properties}
                  iconColor={starred ? "rgb(249, 189, 34)" : undefined}
                  icon={starred ? "star" : "star-outline"}
                  onPress={() => {
                    setStarred(!starred);

                    props.starCallback !== undefined
                      ? props.starCallback()
                      : undefined;
                  }}
                />
              )
            : undefined
        }
      />
      <View style={{ paddingHorizontal: 30 }}>
        <ProgressBar
          style={{ borderRadius: 16 }}
          progress={props.item.completion_rate / 100}
        />
      </View>
    </View>
  );
};

export default Task;
