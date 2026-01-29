import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { login } from "../../services/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Harap Isi Username dan Password");
      return;
    }

    setLoading(true);

    const data = await login(username, password);

    setLoading(false);

    if (data.token) {
      router.replace("/(app)");
    } else {
      Alert.alert("Login Gagal", data.error || "Username atau password salah");
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://res.cloudinary.com/df82hir2r/image/upload/v1737544254/auth_b7ki8e.jpg",
      }}
      className="flex-1 justify-center items-center"
    >
      {/* overlay gelap */}
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50" />

      <View className="w-11/12 p-6 bg-gray-200 rounded-xl z-10">
        <Text className="text-2xl font-bold mb-4 text-center">
          Masuk Ke Akun Anda
        </Text>

        {/* Username */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
          placeholderTextColor="#888"
        />

        {/* Password */}
        <View className="w-full mb-6 relative">
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            className="absolute right-4 top-4"
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-gradientEnd shadow-md w-full p-4 rounded-xl mb-4"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-center text-white font-bold text-xl">
              Masuk
            </Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          className="flex-row justify-between text-sm"
          onPress={() => router.push("/(auth)/register")}
        >
          <Text className="text-black">Anda belum punya akun?</Text>
          <Text className="text-gradientStart"> Daftar Sekarang</Text>
        </TouchableOpacity>

        <Text className="text-sm text-red-500 mt-2">
          * Mohon Isi Data Dengan Lengkap
        </Text>
      </View>
    </ImageBackground>
  );
}