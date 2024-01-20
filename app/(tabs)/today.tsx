import React from "react";
import { Text, Surface } from "react-native-paper";

const Today = () => (
  <Surface style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <Text variant="titleLarge">Tasks due today</Text>
  </Surface>
);

export default Today;
