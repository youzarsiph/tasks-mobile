/**
 * Task lists
 */

import React from "react";
import { ListType } from "../types";
import { List } from "react-native-paper";

const TaskList = (props: { item: ListType; onPress: () => void }) => {
  return (
    <List.Item
      title={props.item.name}
      onPress={() => props.onPress()}
      right={(props) => <List.Icon {...props} icon={"chevron-right"} />}
    />
  );
};

export default TaskList;
