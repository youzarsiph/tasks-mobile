/**
 * Header
 */

import React from "react";
import { Appbar, AppbarHeaderProps, Menu } from "react-native-paper";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

interface HeaderProps extends NativeStackHeaderProps {
  headerProps?: AppbarHeaderProps;
}

const Header = (props: HeaderProps) => {
  const [visible, setVisible] = React.useState<boolean>(false);

  return (
    <Appbar.Header {...props.headerProps}>
      {props.back && (
        <Appbar.BackAction onPress={() => props.navigation.goBack()} />
      )}

      <Appbar.Content title={props.options.title || props.route.name} />

      {props.route.name === "settings" ? undefined : (
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setVisible(true)}
            />
          }
        >
          <Menu.Item
            title="Settings"
            leadingIcon={"cog"}
            onPress={() => {
              setVisible(false);
              props.navigation.navigate("settings");
            }}
          />
        </Menu>
      )}
    </Appbar.Header>
  );
};

export { HeaderProps };
export default Header;
