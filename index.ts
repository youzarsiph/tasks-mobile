/**
 * App entry
 */

import "expo-router/entry";
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import Database from "./utils/db";

(async () => {
  // Checks if the db is initialized
  const isInitialized = await SecureStore.getItemAsync("init");

  if (isInitialized === null) {
    const db = SQLite.openDatabase("taskLists.db");

    Database.init(db);

    await SecureStore.setItemAsync("init", "1");

    console.log("Init completed");
  }
})();
