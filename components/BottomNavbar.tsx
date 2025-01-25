import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { usePathname } from "expo-router";

export default function BottomNavbar() {
  const pathname = usePathname(); // Get the current path
  const router = useRouter();

  const getTabStyle = (tabRoute: string) => {
    if (pathname === tabRoute) {
      return {
        iconColor: "#369E4E", // Active color
        textColor: "text-navbar", // Active text style
      };
    } else {
      return {
        iconColor: "gray", // Inactive color
        textColor: "text-gray-600", // Inactive text style
      };
    }
  };

  return (
    <View className="flex-row justify-around bg-gray-100 py-4 border-t border-gray-300">
      <TouchableOpacity onPress={() => router.push("/")} className="items-center">
        <Ionicons
          name="home-outline"
          size={24}
          color={getTabStyle("/").iconColor}
        />
        <Text className={getTabStyle("/").textColor}>Beranda</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/biopori")} className="items-center">
        <Ionicons
          name="water-outline"
          size={24}
          color={getTabStyle("/biopori").iconColor}
        />
        <Text className={getTabStyle("/biopori").textColor}>Biopori</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/bank-sampah")} className="items-center">
        <Ionicons
          name="leaf-outline"
          size={24}
          color={getTabStyle("/bank-sampah").iconColor}
        />
        <Text className={getTabStyle("/bank-sampah").textColor}>Bank Sampah</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/edukasi")} className="items-center">
        <Ionicons
          name="book-outline"
          size={24}
          color={getTabStyle("/edukasi").iconColor}
        />
        <Text className={getTabStyle("/edukasi").textColor}>Edukasi</Text>
      </TouchableOpacity>
    </View>
  );
}
