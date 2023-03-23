/**
 * Screen
 */

import React from "react";
import Styles from "../styles";
import { Stack } from "expo-router";
import { View } from "react-native";
import { ScreenProps } from "../types";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "react-native-paper";
import LoadingIndicator from "./LoadingIndicator";
import Message from "./Message";

export default function Screen(props: ScreenProps) {
  const theme = useTheme();

  return (
    <View style={Styles.screen}>
      <Stack.Screen options={props.options} />
      <StatusBar animated style={theme.dark ? "light" : "dark"} />
      {props.loading ? <LoadingIndicator /> : props.children}

      <Message
        message={props.message}
        visible={props.displayMessage}
        onDismiss={() => props.onDismissMessage()}
      />
    </View>
  );
}
