/**
 * Registration Screen
 */

import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Text, TextInput } from "react-native-paper";

const Register = () => {
  // Router
  const router = useRouter();

  // State
  const [state, setState] = React.useState<{
    username: string;
    password: string;
    email: string;
  }>({ username: "", password: "", email: "" });

  return (
    <View>
      <Text variant="displayLarge" style={{ textAlign: "center" }}>
        Tasks
      </Text>

      <Text variant="bodyLarge" style={{ textAlign: "center" }}>
        Register to start using Tasks
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
        value={state.email}
        maxLength={128}
        mode="outlined"
        label={"Email"}
        placeholder={"Email address"}
        onChangeText={(value) => setState({ ...state, email: value })}
        right={<TextInput.Affix text={`${128 - state.email.length}`} />}
      />

      <TextInput
        value={state.password}
        maxLength={128}
        mode="outlined"
        secureTextEntry
        label={"Password"}
        placeholder={"Password at least 8 characters"}
        onChangeText={(value) => setState({ ...state, password: value })}
        right={<TextInput.Affix text={`${128 - state.password.length}`} />}
      />

      <Button
        mode="contained"
        disabled={
          state.username === "" ||
          state.password === "" ||
          state.email === "" ||
          state.password.length < 8
        }
        onPress={() => {}}
      >
        Register
      </Button>

      <Text variant="bodySmall" style={{ textAlign: "center" }}>
        Already have an account?
      </Text>
      <Button onPress={() => router.push("/log-in")}>Log in</Button>
    </View>
  );
};

export default Register;
