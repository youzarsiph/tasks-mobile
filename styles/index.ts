/**
 * Global styles
 */

import { StyleSheet } from "react-native";

const Styles = StyleSheet.create({
  row: {
    gap: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fab: {
    right: 20,
    bottom: 20,
    position: "absolute",
  },
  lead: {
    textAlign: "center",
    paddingHorizontal: 32,
  },
  screen: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  welcome: {
    flex: 1,
    gap: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  authScreen: {
    gap: 16,
    flex: 1,
    paddingVertical: 96,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  modal: {
    left: 0,
    right: 0,
    bottom: 0,
    gap: 16,
    padding: 20,
    position: "absolute",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});

export default Styles;
