/**
 * Confirmation Dialog
 */

import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";

const ConfirmationDialog = (props: {
  title: string;
  message: string;
  delete: () => void;
  visible: boolean;
  onDismiss: () => void;
}) => (
  <Portal>
    <Dialog
      visible={props.visible}
      style={{ borderRadius: 16 }}
      onDismiss={() => props.onDismiss()}
    >
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium">{props.message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => props.delete()}>Delete</Button>
        <Button onPress={() => props.onDismiss()}>Cancel</Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

export default ConfirmationDialog;
