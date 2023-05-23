/**
 * Utilities
 */

import { Auth, ListAPI, TaskAPI } from "./api";
import { useMessage, MessageProvider } from "./context/message";
import { AuthProvider, ReloadContext, useAuth } from "./context";

const calculateDuration = (startDate: Date, endDate: Date) => {
  // Time difference in millie-seconds
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} day(s), ${hours} hour(s) and ${minutes} minute(s)`;
};

export {
  Auth,
  AuthProvider,
  useAuth,
  ListAPI,
  TaskAPI,
  ReloadContext,
  useMessage,
  MessageProvider,
  calculateDuration,
};
