/**
 * Settings Screen
 */

import React from "react";
import Styles from "../styles";
import { View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Screen } from "../components";
import { Button, List, RadioButton } from "react-native-paper";
import { State } from "../types";

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
    message: "",
    displayMessage: false,
    displayModal: false,
  });

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

  // Apply settings
  const applySettings = () => {
    (async () => {
      await SecureStore.setItemAsync("theme", state.theme);
      await SecureStore.setItemAsync("color", state.color);

      setState({
        ...state,
        message: "Settings applied, restart the app to reflect the changes",
        displayMessage: true,
      });
    })();
  };

  return (
    <Screen
      loading={state.loading}
      message={state.message}
      displayMessage={state.displayMessage}
      onDismissMessage={() => setState({ ...state, displayMessage: false })}
      options={{ title: "Settings", animation: "slide_from_right" }}
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
            <RadioButton.Item value="purple" label="Purple" />
            <RadioButton.Item value="pink" label="Pink" />
            <RadioButton.Item value="red" label="Red" />
            <RadioButton.Item value="green" label="Green" />
            <RadioButton.Item value="blue" label="Blue" />
            <RadioButton.Item value="yellow" label="Yellow" />
          </RadioButton.Group>
        </List.Section>

        <View style={{ paddingHorizontal: 16 }}>
          <Button mode="contained" onPress={applySettings}>
            Apply Settings
          </Button>
        </View>
      </View>
    </Screen>
  );
};

export default Settings;
