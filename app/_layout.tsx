/**
 * Layout
 */

import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-native-paper";
import { ThemeProvider } from "@react-navigation/native";
import getTheme from "../theme";
import { Header } from "../components";
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
                headerProps={{
                  children: undefined,
                  style: { backgroundColor: theme.colors.elevation.level1 },
                }}
              />
            ),
          }}
        />
      </ThemeProvider>
    </Provider>
  );
};

export default Layout;
