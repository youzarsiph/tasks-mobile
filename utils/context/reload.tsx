/**
 * Reload context
 */

import React from "react";

interface Context {
  listReload: boolean;
  setListReload: () => void;
  taskReload: boolean;
  setTaskReload: () => void;
}

const ReloadContext = React.createContext<Context>({
  listReload: false,
  setListReload: () => {},
  taskReload: false,
  setTaskReload: () => {},
});

const useReloadTrigger = () => React.useContext(ReloadContext);

export { ReloadContext, useReloadTrigger };
