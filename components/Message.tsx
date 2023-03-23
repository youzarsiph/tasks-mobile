/**
 * Messages
 */

import React from "react";
import { Snackbar } from "react-native-paper";

const Message = (props: {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}) => {
  return (
    <Snackbar
      duration={2000}
      visible={props.visible}
      onDismiss={() => props.onDismiss()}
      action={{
        label: "Close",
        icon: "window-close",
        onPress: () => props.onDismiss(),
      }}
    >
      {props.message}
    </Snackbar>
  );
};

export default Message;
