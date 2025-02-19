import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { Menu, Button, Provider as PaperProvider } from "react-native-paper";
import { EventEmitter } from 'expo-modules-core';

const ProfileScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [banjar, setBanjar] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bioporiCount, setBioporiCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const eventEmitter = new EventEmitter<{ logout: () => void }>();

  // Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          Alert.alert("Error", "Anda belum login.");
          router.push("/auth/login");
          return;
        }
  
  
        const response = await fetch("https://sms-backend-desa-peliatan.vercel.app/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
  
        const text = await response.text();
  
        if (!response.ok) {
          Alert.alert("Error", `Gagal mengambil data profil (${response.status})`);
          return;
        }
  
        const result = JSON.parse(text);
        setUsername(result.data.username);
        setPhoneNumber(result.data.phone_number);
        setEmail(result.data.email);
        setBanjar(result.data.banjar);
        setProfileImage(result.data.profile_picture);
        setBioporiCount(result.data.biopori_count);
      } catch (error) {
        console.error("Fetch error:", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengambil data");
      }
    };
  
    fetchProfile();
  }, []);
  
  

  // Handle image picking
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    eventEmitter.emit("logout");
    router.push("/auth/login");
  };
  

  return (
    <PaperProvider>
      <View className="flex-1 bg-white p-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={{
                uri: profileImage || "https://placekitten.com/200/200",
              }}
              className="w-20 h-20 rounded-full border border-gray-300"
            />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold">{username || "Loading..."}</Text>
        </View>

        <Text className="text-lg font-medium">Phone: {phoneNumber || "Loading..."}</Text>
        <Text className="text-lg font-medium">Email: {email || "Loading..."}</Text>
        <Text className="text-lg font-medium mb-2">Biopori Planted: {bioporiCount}</Text>

        {banjar ? (
          <Text className="text-lg font-medium my-2">{banjar}</Text>
        ) : (
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={<Button onPress={() => setVisible(true)}>Select Banjar</Button>}
          >
            <Menu.Item onPress={() => setBanjar("Banjar A")} title="Banjar A" />
            <Menu.Item onPress={() => setBanjar("Banjar B")} title="Banjar B" />
            <Menu.Item onPress={() => setBanjar("Banjar C")} title="Banjar C" />
          </Menu>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-6 bg-red-500 p-3 rounded-full justify-center items-center"
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
};

export default ProfileScreen;
