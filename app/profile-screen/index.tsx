import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Menu, Button, Provider as PaperProvider } from "react-native-paper"; // Import PaperProvider

const ProfileScreen = () => {
  const router = useRouter(); // Inisialisasi useRouter

  // Dummy data for testing
  const [username, setUsername] = useState("JohnDoe");
  const [phoneNumber, setPhoneNumber] = useState("123-456-7890");
  const [email, setEmail] = useState("");
  const [banjar, setBanjar] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [transactionHistory, setTransactionHistory] = useState([
    { date: "2025-01-20", amount: "50kg" },
  ]);
  const [bioporiCount, setBioporiCount] = useState(5);

  // State untuk menu banjar
  const [visible, setVisible] = useState(false);

  // Handle image picking
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Access uri from result.assets[0]
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Logic to log out the user (e.g., clear session, navigate to login screen)
    router.push("/auth/login"); // Navigasi menggunakan Expo Router
  };

  return (
    <PaperProvider> {/* Wrap the entire ProfileScreen in PaperProvider */}
      <View className="flex-1 bg-white p-4">
        {/* Profile Picture */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={handleImagePick}>
            <Image
              source={{
                uri: profileImage || "https://placekitten.com/200/200",
              }}
              className="w-20 h-20 rounded-full border border-gray-300"
            />
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold">{username}</Text>
        </View>

        {/* User Info */}
        <Text className="text-lg font-medium">Phone: {phoneNumber}</Text>
        <Text className="text-lg font-medium mb-2">Biopori Planted: {bioporiCount}</Text>

        {/* Editable Fields */}
        <TextInput
          className="border-b border-gray-300 p-2 my-2"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Menu for Banjar */}
        {banjar ? (
          // Display selected Banjar name
          <Text className="text-lg font-medium my-2">{banjar}</Text>
        ) : (
          // If no Banjar is selected, show the menu button
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)} // Hide the menu when dismissed
            anchor={<Button onPress={() => setVisible(true)}>Select Banjar</Button>} // Trigger the menu to open
          >
            <Menu.Item onPress={() => setBanjar("Banjar A")} title="Banjar A" />
            <Menu.Item onPress={() => setBanjar("Banjar B")} title="Banjar B" />
            <Menu.Item onPress={() => setBanjar("Banjar C")} title="Banjar C" />
          </Menu>
        )}

        {/* Transaction History */}
        <View className="mt-4">
          <Text className="text-lg font-medium">Transaction History</Text>
          {transactionHistory.map((transaction, index) => (
            <View key={index} className="flex-row justify-between my-2">
              <Text className="text-sm">{transaction.date}</Text>
              <Text className="text-sm">{transaction.amount}</Text>
            </View>
          ))}
        </View>

        {/* Logout Button with Ionicons */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-6 bg-red-500 p-3 rounded-full justify-center items-center"
        >
          <Ionicons name="log-out-outline" size={24} color="white" /> {/* Ionicon for logout */}
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider> 
  );
};

export default ProfileScreen;
