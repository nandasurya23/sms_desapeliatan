import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, ActivityIndicator, Alert, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Slot } from 'expo-router';
import BottomNavbar from '@/components/BottomNavbar'; 
import '../global.css'

const _layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);  // State for layout readiness
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
        try {
            const userId = await SecureStore.getItemAsync('userId');
            if (userId) {
                setIsLoggedIn(true);
            } else {
                // Redirect to login screen if no user is logged in
                router.replace('/auth/login');
            }
        } catch (error) {
            console.error('Error during login check:', error);
            Alert.alert("Error", "Terjadi kesalahan saat memeriksa status login.");
        } finally {
            setIsReady(true);  // Set layout as ready to render
        }
    };

    checkLoginStatus();
}, [router]);


  if (!isReady) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3DA656" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <Slot />
      </View>
      {isLoggedIn && <BottomNavbar />} {/* Render BottomNavbar only if logged in */}
    </SafeAreaView>
  );
};

export default _layout;
