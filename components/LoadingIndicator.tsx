/**
 * Loading indicator
 */

import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Styles from "../styles";

const LoadingIndicator = () => {
  return (
    <View style={Styles.fullScreen}>
      <ActivityIndicator size={"small"} />
    </View>
  );
};

export default LoadingIndicator;
