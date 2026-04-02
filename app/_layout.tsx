import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        if (segments[0] !== "(auth)") {
          router.replace("/(auth)/login");
        }
      } else {
        if (segments[0] === "(auth)") {
          router.replace("/(app)");
        }
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [segments, router]);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render children routes
  return <Slot />;
}
