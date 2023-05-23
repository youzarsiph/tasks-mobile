/**
 * Header
 */

import React from "react";
import { Appbar, Menu } from "react-native-paper";
import { HeaderProps } from "../types";

const Header = (props: HeaderProps) => {
  const [visible, setVisible] = React.useState<boolean>(false);

  return (
    <Appbar.Header {...props.headerProps}>
      {props.back && (
        <Appbar.BackAction onPress={() => props.navigation.goBack()} />
      )}

      <Appbar.Content title={props.options.title || props.route.name} />

      {props.route.name === "tasks/[id]" ? (
        <Appbar.Action
          icon="star"
          onPress={() =>
            props.starCallback !== undefined ? props.starCallback() : {}
          }
        />
      ) : undefined}

      {props.route.name === "tasks/index" ||
      props.route.name === "tasks/[id]" ? (
        <>
          <Appbar.Action
            icon="pencil"
            onPress={() =>
              props.updateCallback !== undefined ? props.updateCallback() : {}
            }
          />
          <Appbar.Action
            icon="delete"
            onPress={() =>
              props.deleteCallback !== undefined ? props.deleteCallback() : {}
            }
          />
        </>
      ) : undefined}

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
