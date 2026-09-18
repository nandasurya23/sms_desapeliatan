import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import '../global.css';

// Cegah splash screen hilang otomatis sampai kita tahu status auth
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await SecureStore.getItemAsync("token");
      } catch (error: unknown) {
        console.warn("Auth check failed:", error instanceof Error ? error.message : String(error));
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

  // Render children routes
  return <Slot />;
}
