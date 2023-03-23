/**
 * Loading indicator
 */

import React from "react";
import Styles from "../styles";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const LoadingIndicator = () => {
  return (
    <View style={Styles.fullScreen}>
      <ActivityIndicator size={"large"} />
    </View>
  );
};

export default LoadingIndicator;
