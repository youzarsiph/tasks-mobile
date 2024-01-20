import { Pressable } from "react-native";
import { Link, Tabs } from "expo-router";
import { CommonActions } from "@react-navigation/native";
import { getHeaderTitle } from "@react-navigation/elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Appbar, BottomNavigation } from "react-native-paper";

const TabLayout = () => (
  <Tabs
    screenOptions={{
      tabBarHideOnKeyboard: true,
      header: (props) => {
        const title = getHeaderTitle(props.options, props.route.name);

        return (
          <Appbar.Header style={{ gap: 16, paddingHorizontal: 16 }}>
            <Appbar.Content title={title} />
          </Appbar.Header>
        );
      },
    }}
    tabBar={({ navigation, state, descriptors, insets }) => (
      <BottomNavigation.Bar
        navigationState={state}
        safeAreaInsets={insets}
        onTabPress={({ route, preventDefault }) => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (event.defaultPrevented) {
            preventDefault();
          } else {
            navigation.dispatch({
              ...CommonActions.navigate(route.name, route.params),
              target: state.key,
            });
          }
        }}
        renderIcon={({ route, focused, color }) => {
          const { options } = descriptors[route.key];
          if (options.tabBarIcon) {
            return options.tabBarIcon({ focused, color, size: 24 });
          }

          return null;
        }}
        getLabelText={({ route }) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.title;

          return label;
        }}
      />
    )}
  >
    <Tabs.Screen
      name="lists"
      options={{
        title: "Task Lists",
        tabBarIcon: (props) => (
          <MaterialCommunityIcons
            {...props}
            size={24}
            name={props.focused ? "card-multiple" : "card-multiple-outline"}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="today"
      options={{
        title: "Today",
        tabBarIcon: (props) => (
          <MaterialCommunityIcons
            {...props}
            size={24}
            name={props.focused ? "calendar-check" : "calendar-check-outline"}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="index"
      options={{
        title: "Home",
        tabBarIcon: (props) => (
          <MaterialCommunityIcons
            {...props}
            size={24}
            name={props.focused ? "home" : "home-outline"}
          />
        ),
        headerRight: () => (
          <Link href="/modal" asChild>
            <Pressable>
              {({ pressed }) => (
                <MaterialCommunityIcons
                  name="more"
                  size={24}
                  style={{ opacity: pressed ? 0.75 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: "Profile",
        tabBarIcon: (props) => (
          <MaterialCommunityIcons
            {...props}
            size={24}
            name={props.focused ? "account" : "account-box-outline"}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="settings"
      options={{
        title: "Settings",
        tabBarIcon: (props) => (
          <MaterialCommunityIcons
            {...props}
            size={24}
            name={props.focused ? "cog" : "cog-outline"}
          />
        ),
      }}
    />
  </Tabs>
);

export default TabLayout;
