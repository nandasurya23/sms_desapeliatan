// app/(app)/_layout.tsx
import { Redirect, Slot } from "expo-router";
import BottomNavbar from "@/components/BottomNavbar";
import { View, StyleSheet, ActivityIndicator } from "react-native";
export default function AppLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});