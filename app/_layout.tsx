/**
 * Layout
 */

import React from "react";
import { Provider } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { Stack, SplashScreen } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";
import getTheme from "../theme";
import { Header } from "../components";
import { HeaderProps } from "../components/Header";
import { AuthProvider, MessageProvider, ReloadContext } from "../utils";

const Layout = () => {
  // Theme
  const theme = getTheme();

  // User auth token
  const [token, setToken] = React.useState<string>("");

  // Reload trigger
  const [listReload, setListReload] = React.useState<boolean>(false);
  const [taskReload, setTaskReload] = React.useState<boolean>(false);

  const [themeLoaded, setThemeLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("token");
      setToken(token || "");

      // Display the splash screen while loading theme
      setTimeout(() => {
        setThemeLoaded(true);
      }, 150);
    })();
  }, []);

  if (!themeLoaded) {
    return <SplashScreen />;
  }

  return (
    <Provider theme={theme}>
      <ThemeProvider value={theme}>
        <ReloadContext.Provider
          value={{
            listReload: listReload,
            setListReload: () => setListReload(!listReload),
            taskReload: taskReload,
            setTaskReload: () => setTaskReload(!taskReload),
          }}
        >
          <AuthProvider token={token}>
            <MessageProvider>
              <Stack
                screenOptions={{
                  header: (props: HeaderProps) => <Header {...props} />,
                }}
              />
            </MessageProvider>
          </AuthProvider>
        </ReloadContext.Provider>
      </ThemeProvider>
    </Provider>
  );
};

export default Layout;
