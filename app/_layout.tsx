/**
 * Layout
 */

import React from "react";
import { Stack, SplashScreen } from "expo-router";
import { Provider } from "react-native-paper";
import { ThemeProvider } from "@react-navigation/native";
import getTheme from "../theme";
import { Header } from "../components";
import { ReloadContext } from "../utils";
import { HeaderProps } from "../components/Header";

const Layout = () => {
  // Theme
  const theme = getTheme();

  // Reload trigger
  const [reload, setReload] = React.useState<boolean>(false);

  const [themeLoaded, setThemeLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Display the splash screen while loading theme
    setTimeout(() => {
      setThemeLoaded(true);
    }, 1000);
  }, []);

  if (!themeLoaded) {
    return <SplashScreen />;
  }

  return (
    <Provider theme={theme}>
      <ThemeProvider value={theme}>
        <ReloadContext.Provider
          value={{
            reload: reload,
            setReload: () => setReload(!reload),
          }}
        >
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
        </ReloadContext.Provider>
      </ThemeProvider>
    </Provider>
  );
};

export default Layout;
