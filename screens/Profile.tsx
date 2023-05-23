/**
 * Profile Screen
 */

import React from "react";
import { useRouter } from "expo-router";
import { View, ScrollView, StyleSheet } from "react-native";
import { Button, List, Surface, Text, useTheme } from "react-native-paper";
import Styles from "../styles";
import { server } from "../data.env";
import { Screen } from "../components";
import { Auth, useAuth, useMessage } from "../utils";

const Profile = () => {
  // Theme
  const theme = useTheme();

  // Router
  const router = useRouter();

  // Message
  const { showMessage } = useMessage();

  // Auth token
  const { token, signOut } = useAuth();

  // State
  const [loading, setLoading] = React.useState<boolean>(true);
  const [state, setState] = React.useState<{
    id: number;
    username: string;
    email: string;
  }>({
    id: 1,
    username: "admin",
    email: "admin@example.com",
  });

  React.useEffect(() => {
    (async () => {
      await fetch(`${server}auth/users/me/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      })
        .then((response) =>
          response.ok
            ? response.json()
            : { code: response.status, message: response.statusText }
        )
        .then((data) => {
          setLoading(false);
          setState(data);
        })
        .catch((e) => {
          setLoading(false);
          showMessage(e.message);
        });
    })();
  }, []);

  return (
    <Screen loading={loading}>
      <ScrollView>
        <View style={styles.row}>
          <Surface
            style={{ ...styles.surface, backgroundColor: theme.colors.primary }}
          >
            <Text
              variant="headlineLarge"
              style={{ fontWeight: "bold", color: theme.colors.onPrimary }}
            >
              {state.username[0].toUpperCase()}
            </Text>
          </Surface>
          <View>
            <Text variant="titleMedium">{state.email}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
              @{state.username}
            </Text>
          </View>
        </View>

        <List.Section title="Account">
          <List.Item
            title="Settings"
            onPress={() => router.push("settings")}
            left={(props) => <List.Icon {...props} icon={"cog"} />}
            right={(props) => <List.Icon {...props} icon={"chevron-right"} />}
          />
          {/* <List.Item
            title="Change password"
            onPress={() => router.push("settings")}
            left={(props) => <List.Icon {...props} icon={"cog"} />}
            right={(props) => <List.Icon {...props} icon={"chevron-right"} />}
          /> */}
        </List.Section>

        <View style={{ padding: 16, gap: 16 }}>
          <Button
            mode="contained-tonal"
            onPress={() => {
              (async () => {
                await Auth.logOut(
                  token,
                  () => showMessage("Logged out"),
                  (message) => showMessage(message)
                );
                signOut();
              })();
            }}
          >
            Log Out
          </Button>
          {/* <Button
            mode="contained-tonal"
            elevation={1}
            onPress={() => {
              (async () => {
                await Auth.logOut(
                  user,
                  () => showMessage("Logged out"),
                  (message) => showMessage(message)
                );
              })();
            }}
          >
            Delete account
          </Button> */}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {
    padding: 16,
    ...Styles.row,
    justifyContent: "flex-start",
  },
  surface: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 26,
  },
});

export default Profile;
