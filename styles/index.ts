/**
 * Global styles
 */

import { StyleSheet } from "react-native";

const Styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    left: 0,
    right: 0,
    bottom: 0,
    rowGap: 16,
    padding: 20,
    position: "absolute",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default Styles;
