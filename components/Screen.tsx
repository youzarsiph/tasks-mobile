/**
 * Screen
 */

import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";
import Styles from "../styles";
import Message from "./Message";
import { useMessage } from "../utils";
import { ScreenProps } from "../types";
import LoadingIndicator from "./LoadingIndicator";

export default function Screen(props: ScreenProps) {
  // Theme
  const theme = useTheme();

  // Messages
  const Messages = useMessage();

  return (
    <View style={Styles.screen}>
      <Stack.Screen
        options={{
          ...props.options,
          animation: "slide_from_right",
        }}
      />
      <StatusBar animated style={theme.dark ? "light" : "dark"} />
      {props.loading ? <LoadingIndicator /> : props.children}

      <Message
        message={Messages.message}
        visible={Messages.visible}
        onDismiss={() => Messages.setVisible(false)}
      />
    </View>
  );
}
