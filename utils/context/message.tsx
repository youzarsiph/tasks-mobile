/**
 * Message context
 */

import React from "react";

const MessageContext = React.createContext<{
  message: string;
  setMessage: (message: string) => void;
  visible: boolean;
  setVisible: (visible?: boolean) => void;
  showMessage: (message: string) => void;
}>({
  message: "",
  setMessage: () => {},
  visible: false,
  setVisible: (visible?: boolean) => {},
  showMessage: (message) => {},
});

const useMessage = () => React.useContext(MessageContext);

const MessageProvider = (props: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [message, setMessage] = React.useState<string>("");
  const [visible, setVisible] = React.useState<boolean>(false);

  return (
    <MessageContext.Provider
      value={{
        message: message,
        setMessage: (message) => setMessage(message),
        visible: visible,
        setVisible: (value?: boolean) =>
          setVisible(value !== undefined ? value : !visible),
        showMessage: (message) => {
          setMessage(message);
          setVisible(true);
        },
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export { MessageProvider, useMessage };
