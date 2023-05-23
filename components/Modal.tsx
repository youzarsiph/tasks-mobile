/**
 * Modal
 */

import React from "react";
import { Portal, Modal as Container, useTheme, Text } from "react-native-paper";
import Styles from "../styles";

const Modal = (props: {
  title: string;
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
        contentContainerStyle={{
          ...Styles.modal,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text variant="titleLarge">{props.title}</Text>
        {props.children}
      </Container>
    </Portal>
  );
};

export default Modal;
