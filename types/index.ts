/**
 * Types
 */

import React from "react";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

interface ScreenProps {
  loading: boolean;
  message: string;
  displayMessage: boolean;
  onDismissMessage: () => void;
  options?: NativeStackNavigationOptions;
  children: React.ReactNode | React.ReactNode[];
}

interface State {
  loading: boolean;
  message: string;
  displayMessage: boolean;
  reload?: boolean;
  displayModal: boolean;
}

interface ListTypeState extends State {
  lists: readonly ListType[];
}

interface TaskTypeState extends State {
  tasks: readonly TaskType[];
  completedTasks: readonly TaskType[];
  displayCompletedTasks: boolean;
  displayUpdateModal: boolean;
  displayFABGroup: boolean;
}

type Params = {
  id: string;
  title: string;
  // reload: boolean;
};

interface Type {
  /**
   * Base type
   */

  id: number;
  createdAt: string;
  updatedAt: string;
}

interface ListType extends Type {
  name: string;
}

interface TaskType extends Type {
  title: string;
  starred: string;
  completed: string;
  description: string;
}

export {
  Params,
  ScreenProps,
  ListType,
  TaskType,
  State,
  ListTypeState,
  TaskTypeState,
};
