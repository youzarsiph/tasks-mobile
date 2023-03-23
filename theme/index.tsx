/**
 * Themes
 */

import React from "react";
import * as SecureStore from "expo-secure-store";
import { adaptNavigationTheme } from "react-native-paper";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

import darkTheme from "./dark";
import lightTheme from "./light";

// Adapt themes
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export default function getTheme() {
  const [theme, setTheme] = React.useState<string>("");
  const [color, setColor] = React.useState<string>("");

  // Load settings
  React.useEffect(() => {
    (async () => {
      const theme = await SecureStore.getItemAsync("theme");
      setTheme(theme || "light");

      const color = await SecureStore.getItemAsync("color");
      setColor(color || "purple");
    })();
  }, []);

  let Theme;

  if (theme === "light") {
    switch (color) {
      case "pink":
        Theme = {
          ...LightTheme,
          ...lightTheme.pink,
          colors: {
            ...LightTheme.colors,
            ...lightTheme.pink.colors,
          },
        };
        break;

      case "red":
        Theme = {
          ...LightTheme,
          ...lightTheme.red,
          colors: {
            ...LightTheme.colors,
            ...lightTheme.red.colors,
          },
        };
        break;

      case "green":
        Theme = {
          ...LightTheme,
          ...lightTheme.green,
          colors: {
            ...LightTheme.colors,
            ...lightTheme.green.colors,
          },
        };
        break;

      case "blue":
        Theme = {
          ...LightTheme,
          ...lightTheme.blue,
          colors: {
            ...LightTheme.colors,
            ...lightTheme.blue.colors,
          },
        };
        break;

      case "yellow":
        Theme = {
          ...LightTheme,
          ...lightTheme.yellow,
          colors: {
            ...LightTheme.colors,
            ...lightTheme.yellow.colors,
          },
        };
        break;

      default:
        Theme = {
          ...LightTheme,
          ...lightTheme.purple,
          colors: {
            ...LightTheme.colors,
            ...lightTheme.purple.colors,
          },
        };
        break;
    }
  } else {
    switch (color) {
      case "pink":
        Theme = {
          ...DarkTheme,
          ...darkTheme.pink,
          colors: {
            ...DarkTheme.colors,
            ...darkTheme.pink.colors,
          },
        };
        break;

      case "red":
        Theme = {
          ...DarkTheme,
          ...darkTheme.red,
          colors: {
            ...DarkTheme.colors,
            ...darkTheme.red.colors,
          },
        };
        break;

      case "green":
        Theme = {
          ...DarkTheme,
          ...darkTheme.green,
          colors: {
            ...DarkTheme.colors,
            ...darkTheme.green.colors,
          },
        };
        break;

      case "blue":
        Theme = {
          ...DarkTheme,
          ...darkTheme.blue,
          colors: {
            ...DarkTheme.colors,
            ...darkTheme.blue.colors,
          },
        };
        break;

      case "yellow":
        Theme = {
          ...DarkTheme,
          ...darkTheme.yellow,
          colors: {
            ...DarkTheme.colors,
            ...darkTheme.yellow.colors,
          },
        };
        break;

      default:
        Theme = {
          ...DarkTheme,
          ...darkTheme.purple,
          colors: {
            ...DarkTheme.colors,
            ...darkTheme.purple.colors,
          },
        };
        break;
    }
  }

  return Theme;
}
