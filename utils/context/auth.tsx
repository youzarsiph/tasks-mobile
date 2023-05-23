/**
 * Authentication context
 */

import React from "react";
import { useRouter, useSegments } from "expo-router";

const AuthContext = React.createContext({
  token: "",
  signOut: () => {},
  signIn: (token: string) => {},
});

// This hook can be used to access the user info.
function useAuth() {
  return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(token: string) {
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    // If the user is not signed in and the initial segment is not anything in the auth group.
    if (token === "" && !inAuthGroup) {
      // Redirect to the log-in page.
      router.replace("/log-in");
    } else if (token !== "" && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace("/");
    }
  }, [token, segments]);
}

const AuthProvider = (props: {
  token: string;
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [token, setToken] = React.useState<string>(props.token || "");

  useProtectedRoute(token);

  return (
    <AuthContext.Provider
      value={{
        token: token,
        signOut: () => setToken(""),
        signIn: (token: string) => setToken(token),
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
