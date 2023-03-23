/**
 * Modal
 */

import React from "react";
import Styles from "../styles";
import { Portal, Modal as Container, useTheme } from "react-native-paper";

const Modal = (props: {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode | React.ReactNode[];
}) => {
  // Theme
  const theme = useTheme();

  return (
    <Portal>
      <Container
        visible={props.visible}
        onDismiss={() => props.onDismiss()}
        contentContainerStyle={[
          Styles.modal,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {props.children}
      </Container>
    </Portal>
  );
};

export default Modal;
