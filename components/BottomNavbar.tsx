import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function BottomNavbar() {
  const router = useRouter();

  return (
    <View className="flex-row justify-around bg-gray-100 py-4 border-t border-gray-300">
      <TouchableOpacity onPress={() => router.push("/")} className="items-center">
        <Ionicons name="home-outline" size={24} color="#369E4E" />
        <Text className="text-navbar">Beranda</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/biopori")} className="items-center">
      <Ionicons name="water-outline" size={24} color="#369E4E" />
        <Text className="text-navbar">Biopori</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/bank-sampah")} className="items-center">
        <Ionicons name="leaf-outline" size={24} color="#369E4E" />
        <Text className="text-navbar">Bank Sampah</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/edukasi")} className="items-center">
        <Ionicons name="book-outline" size={24} color="#369E4E" />
        <Text className="text-navbar">Edukasi</Text>
      </TouchableOpacity>
    </View>
  );
}
