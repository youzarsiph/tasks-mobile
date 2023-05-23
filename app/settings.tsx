/**
 * Settings Screen
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Button, List, RadioButton, Surface, Text } from "react-native-paper";
import Styles from "../styles";
import { useMessage } from "../utils";
import { Screen } from "../components";
import { SettingsScreenState } from "../types";

const Settings = () => {
  // Message
  const { showMessage } = useMessage();

  // State
  const [state, setState] = React.useState<SettingsScreenState>({
    loading: true,
    theme: "light",
    color: "purple",
  });

  // Load settings
  React.useEffect(() => {
    (async () => {
      const theme = await SecureStore.getItemAsync("theme");
      const color = await SecureStore.getItemAsync("color");

      setState({
        loading: false,
        theme: theme || "light",
        color: color || "purple",
      });
    })();
  }, []);

  // Theme colors
  const colors = [
    {
      name: "purple",
      value: "rgba(103, 80, 164, 1)",
      icon: "rgba(234, 221, 255, 1)",
    },
    {
      name: "pink",
      value: "rgb(186, 0, 96)",
      icon: "rgb(255, 217, 226)",
    },
    {
      name: "red",
      value: "rgb(191, 7, 21)",
      icon: "rgb(255, 218, 214)",
    },
    {
      name: "green",
      value: "rgb(0, 110, 47)",
      icon: "rgb(107, 255, 143)",
    },
    {
      name: "blue",
      value: "rgb(33, 81, 218)",
      icon: "rgb(220, 225, 255)",
    },
    {
      name: "yellow",
      value: "rgb(121, 89, 0)",
      icon: "rgb(255, 223, 159)",
    },
  ];

  return (
    <Screen loading={state.loading} options={{ title: "Settings" }}>
      <View style={Styles.screen}>
        <List.Section title="Theme">
          <RadioButton.Group
            value={state.theme}
            onValueChange={(value) => setState({ ...state, theme: value })}
          >
            <RadioButton.Item value="light" label="Light" />
            <RadioButton.Item value="dark" label="Dark" />
          </RadioButton.Group>
        </List.Section>

        <List.Section title="Color">
          <RadioButton.Group
            value={state.color}
            onValueChange={(value) => setState({ ...state, color: value })}
          >
            <View style={styles.container}>
              {colors.map((color) => (
                <Surface
                  key={color.name}
                  style={{ ...styles.surface, backgroundColor: color.value }}
                >
                  <RadioButton
                    value={color.name}
                    color={color.icon}
                    uncheckedColor={color.icon}
                  />
                  <Text style={{ color: color.icon, fontWeight: "bold" }}>
                    {color.name.toUpperCase()}
                  </Text>
                </Surface>
              ))}
            </View>
          </RadioButton.Group>
        </List.Section>

        <View style={{ padding: 16 }}>
          <Button
            mode="contained"
            onPress={() => {
              (async () => {
                await SecureStore.setItemAsync("theme", state.theme);
                await SecureStore.setItemAsync("color", state.color);

                // Display success message
                showMessage(
                  "Settings applied, restart the app to reflect the changes"
                );
              })();
            }}
          >
            Apply Settings
          </Button>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  surface: {
    gap: 8,
    width: "30%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Settings;
