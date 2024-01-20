import { Link, Stack } from "expo-router";
import { Text, Surface } from "react-native-paper";

const NotFoundScreen = () => (
  <>
    <Stack.Screen options={{ title: "Oops!" }} />
    <Surface
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text variant="bodyLarge">This screen doesn't exist.</Text>

      <Link href="/">
        <Text>Go to home screen!</Text>
      </Link>
    </Surface>
  </>
);

export default NotFoundScreen;
