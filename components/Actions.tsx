/**
 * FAB actions
 */

import React from "react";
import { FAB } from "react-native-paper";

const Actions = (props: {
  open: boolean;
  onPress: () => void;
  actions: { icon: string; label: string; onPress: () => void }[];
}) => {
  return (
    <FAB.Group
      visible
      open={props.open}
      actions={props.actions}
      onStateChange={() => {}}
      onPress={() => props.onPress()}
      icon={props.open ? "window-close" : "plus"}
    />
  );
};

export default Actions;
