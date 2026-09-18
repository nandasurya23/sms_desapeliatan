import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import '../global.css';

// Cegah splash screen hilang otomatis sampai kita tahu status auth
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        setIsAuthenticated(!!token);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    SecureStore.getItemAsync("token").then(token => {
      const isActuallyAuthenticated = !!token;
      
      if (!isActuallyAuthenticated && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (isActuallyAuthenticated && inAuthGroup) {
        router.replace("/(app)");
      }
    });

    // Hide splash screen setelah routing diputuskan
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

  }, [isReady, segments, router]);

  if (!isReady) {
    return null; // Tetap tampilkan native splash screen
  }

  const inAuthGroup = segments[0] === "(auth)";
  
  // Use a combination of local state and actual token check logic in useEffect.
  // While we wait for redirect, we can show null to prevent flashing auth screens.
  if (!isAuthenticated && !inAuthGroup) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3DA656" />
      </View>
    );
  }

  // Render children routes
  return <Slot />;
}
