/**
 * Home Screen
 */

import React from "react";
import { BottomNavigation } from "react-native-paper";
import { TasksDueToday, Home, Profile, StarredTasks } from "../screens";

const HomeScreen = () => {
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
      key: "due",
      title: "Due Today",
      focusedIcon: "calendar",
      unfocusedIcon: "calendar-outline",
    },
    {
      key: "profile",
      title: "Me",
      focusedIcon: "account",
      unfocusedIcon: "account-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Home,
    starred: StarredTasks,
    due: TasksDueToday,
    profile: Profile,
  });

  return (
    <BottomNavigation
      onIndexChange={setIndex}
      renderScene={renderScene}
      sceneAnimationType="shifting"
      navigationState={{ index, routes }}
    />
  );
};

export default HomeScreen;
