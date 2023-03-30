/**
 * Settings Screen
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Button, List, RadioButton, Surface, Text } from "react-native-paper";
import Styles from "../styles";
import { State } from "../types";
import { Screen } from "../components";

interface SettingsState extends State {
  theme: string;
  color: string;
}

const Settings = () => {
  // State
  const [state, setState] = React.useState<SettingsState>({
    loading: true,
    theme: "",
    color: "",
  });

  // Message
  const [message, setMessage] = React.useState<string>("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);

  // Load settings
  React.useEffect(() => {
    (async () => {
      const theme = await SecureStore.getItemAsync("theme");
      const color = await SecureStore.getItemAsync("color");

      setState({
        ...state,
        theme: theme || "light",
        color: color || "purple",
        loading: false,
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

  // Apply settings
  const applySettings = () => {
    (async () => {
      await SecureStore.setItemAsync("theme", state.theme);
      await SecureStore.setItemAsync("color", state.color);

      // Display success message
      setMessage("Settings applied, restart the app to reflect the changes");
      setDisplayMessage(true);
    })();
  };

  return (
    <Screen
      options={{ title: "Settings" }}
      loading={state.loading}
      message={message}
      displayMessage={displayMessage}
      onDismissMessage={() => setDisplayMessage(false)}
    >
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
                  style={[
                    styles.surface,
                    {
                      backgroundColor: color.value,
                    },
                  ]}
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
          <Button mode="contained" onPress={applySettings}>
            Apply Settings
          </Button>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    rowGap: 16,
    columnGap: 16,
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "center",
  },
  surface: {
    width: "30%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 8,
  },
});

export default Settings;
