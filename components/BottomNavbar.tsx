import { useRouter, usePathname } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNavbar() {
  const pathname = usePathname(); // Get the current path
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getTabStyle = (tabRoute: string) => {
    if (pathname === tabRoute) {
      return {
        iconColor: "#369E4E", // Active color (navbar theme)
        textColor: "text-navbar font-semibold", // Active text style
      };
    } else {
      return {
        iconColor: "#9ca3af", // gray-400
        textColor: "text-gray-400", // Inactive text style
      };
    }
  };

  return (
    <View 
      className="flex-row justify-around bg-white pt-3 border-t border-gray-200"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
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

      <TouchableOpacity onPress={() => router.push("/bank")} className="items-center">
        <Ionicons
          name="leaf-outline"
          size={24}
          color={getTabStyle("/bank").iconColor}
        />
        <Text className={getTabStyle("/bank").textColor}>Bank Sampah</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/education")} className="items-center">
        <Ionicons
          name="book-outline"
          size={24}
          color={getTabStyle("/education").iconColor}
        />
        <Text className={getTabStyle("/education").textColor}>Edukasi</Text>
      </TouchableOpacity>
    </View>
  );
}
