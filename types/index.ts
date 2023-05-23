/**
 * Types
 */

import React from "react";
import { AppbarHeaderProps } from "react-native-paper";
import {
  NativeStackHeaderProps,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

interface ScreenProps {
  loading?: boolean;
  options?: NativeStackNavigationOptions;
  children: React.ReactNode | React.ReactNode[];
}

interface HeaderProps extends NativeStackHeaderProps {
  headerProps?: AppbarHeaderProps;
  starCallback?: () => void;
  updateCallback?: () => void;
  deleteCallback?: () => void;
}

interface ScreenState {
  loading: boolean;
}

interface HomeScreenState extends ScreenState {
  data: readonly ListType[];
}

interface SettingsScreenState extends ScreenState {
  theme: string;
  color: string;
}

interface TasksScreenState extends ScreenState {
  data: readonly TaskType[];
}

interface TaskScreenState extends ScreenState {
  data: TaskType;
}

type Params = {
  // Task id
  id: string;
  listId: string;
};

interface Type {
  /**
   * Base type
   */

  id?: number;
  created_at: string;
  updated_at: string;
  description: string;
}

interface ListType extends Type {
  name: string;
}

interface TaskType extends Type {
  title: string;
  list?: ListType;
  starred: boolean;
  deadline?: string;
  completed: boolean;
  completion_rate: number;
}

export {
  Params,
  ScreenProps,
  HeaderProps,
  HomeScreenState,
  SettingsScreenState,
  TaskScreenState,
  TasksScreenState,
  ListType,
  TaskType,
};
