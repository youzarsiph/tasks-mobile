/**
 * Home Screen
 */

import React from "react";
import { BottomNavigation, useTheme } from "react-native-paper";
import { CompletedTasks, Home, StarredTasks } from "../screens";

const HomeScreen = () => {
  // Theme
  const theme = useTheme();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "home",
      title: "Home",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },
    {
      key: "starred",
      title: "Starred",
      focusedIcon: "star",
      unfocusedIcon: "star-outline",
    },
    {
      key: "completed",
      title: "Completed",
      focusedIcon: "checkbox-marked-circle",
      unfocusedIcon: "checkbox-marked-circle-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Home,
    starred: StarredTasks,
    completed: CompletedTasks,
  });

  return (
    <BottomNavigation
      onIndexChange={setIndex}
      renderScene={renderScene}
      sceneAnimationType="shifting"
      navigationState={{ index, routes }}
      barStyle={{ backgroundColor: theme.colors.elevation.level1 }}
    />
  );
};

export default HomeScreen;
