/**
 * Reload context
 */

import React from "react";

interface Context {
  reload: boolean;
  setReload: () => void;
}

const ReloadContext = React.createContext<Context>({
  reload: false,
  setReload: () => {},
});

export default ReloadContext;
