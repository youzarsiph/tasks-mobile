/**
 * Login Screen
 */

import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Text, TextInput } from "react-native-paper";
import Styles from "../../styles";
import { Screen } from "../../components";
import { Auth, useAuth, useMessage } from "../../utils";

const LogIn = () => {
  // Router
  const router = useRouter();

  // Auth token
  const { signIn } = useAuth();

  // Message
  const { showMessage } = useMessage();

  // State
  const [state, setState] = React.useState<{
    username: string;
    password: string;
  }>({ username: "", password: "" });

  return (
    <Screen options={{ title: "Sign In", headerShown: false }}>
      <View style={Styles.authScreen}>
        <Text variant="displayLarge" style={{ textAlign: "center" }}>
          Tasks
        </Text>

        <Text variant="bodyLarge" style={{ textAlign: "center" }}>
          Login to access your data
        </Text>

        <TextInput
          value={state.username}
          maxLength={150}
          mode="outlined"
          label={"Username"}
          textContentType="username"
          placeholder={"Username"}
          onChangeText={(value) => setState({ ...state, username: value })}
          right={<TextInput.Affix text={`${150 - state.username.length}`} />}
        />

        <TextInput
          value={state.password}
          maxLength={128}
          mode="outlined"
          secureTextEntry
          label={"Password"}
          placeholder={"Password"}
          onChangeText={(value) => setState({ ...state, password: value })}
          right={<TextInput.Affix text={`${128 - state.password.length}`} />}
        />

        <Button
          mode="contained"
          disabled={state.username === "" || state.password === ""}
          onPress={() => {
            (async () => {
              await Auth.logIn(
                state,
                (token) => signIn(token),
                (message) => showMessage(message)
              );
            })();
          }}
        >
          Sign In
        </Button>

        <Text variant="bodySmall" style={{ textAlign: "center" }}>
          Do not have an account?
        </Text>
        <Button onPress={() => router.replace("/register")}>Register</Button>
      </View>
    </Screen>
  );
};

export default LogIn;
