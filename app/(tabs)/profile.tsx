import React from "react";
import { Chip, Divider, Surface, Text } from "react-native-paper";

const Profile = () => (
  <Surface
    style={{
      flex: 1,
      gap: 16,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text variant="displaySmall">Profile</Text>

    <Divider />

    <Text variant="bodyLarge">Open up the code for this screen:</Text>

    <Chip textStyle={{ fontFamily: "JetBrainsMono_400Regular" }}>
      app/(tabs)/profile.tsx
    </Chip>

    <Text variant="bodyLarge" style={{ textAlign: "center" }}>
      Change any of the text, save the file, and your app will automatically
      update.
    </Text>
  </Surface>
);

export default Profile;
