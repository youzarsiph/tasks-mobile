/**
 * Layout
 */

import React from "react";
import getTheme from "../theme";
import { Stack } from "expo-router";
import { Header } from "../components";
import { Provider } from "react-native-paper";
import { ThemeProvider } from "@react-navigation/native";
import { HeaderProps } from "../components/Header";

const Layout = () => {
  // Theme
  const theme = getTheme();

  return (
    <Provider theme={theme}>
      <ThemeProvider value={theme}>
        <Stack
          screenOptions={{
            header: (props: HeaderProps) => (
              <Header
                {...props}
                children={undefined}
                style={{ backgroundColor: theme.colors.elevation.level1 }}
              />
            ),
          }}
        />
      </ThemeProvider>
    </Provider>
  );
};

export default Layout;
