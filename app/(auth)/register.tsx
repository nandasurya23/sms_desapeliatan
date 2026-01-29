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
import { register } from "../../services/auth"; 

export default function Register() {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    // Validasi sebelum panggil API
    if (!username || !phoneNumber || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "Semua field harus diisi");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Password tidak cocok");
    }

    if (!email.includes("@")) {
      return Alert.alert("Error", "Email harus mengandung @");
    }

    if (password.length < 6) {
      return Alert.alert("Error", "Password minimal 6 karakter");
    }

    setLoading(true);

    try {
      const data = await register({
        username,
        phone_number: phoneNumber,
        email,
        password,
      });

      setLoading(false);

      if (data.token) {
        Alert.alert("Sukses", "Pendaftaran berhasil! Silakan login.");
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Error", data.error || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Koneksi bermasalah. Silakan coba lagi.");
      console.error("Register error:", err);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://res.cloudinary.com/df82hir2r/image/upload/v1737544254/auth_b7ki8e.jpg",
      }}
      className="flex-1 justify-center items-center"
    >
      {/* Overlay gelap */}
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50" />

      <View className="w-11/12 p-6 bg-gray-200 rounded-xl z-10">
        <Text className="text-2xl font-bold mb-4 text-center">Daftar Akun</Text>

        {/* Username */}
        <TextInput
          placeholder="Masukan Username Anda"
          value={username}
          onChangeText={setUsername}
          className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
          placeholderTextColor="#888"
        />

        {/* Phone */}
        <TextInput
          placeholder="Masukan Nomer HP Anda"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
          placeholderTextColor="#888"
        />

        {/* Email */}
        <TextInput
          placeholder="Masukan Email Anda"
          value={email}
          onChangeText={setEmail}
          className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
          placeholderTextColor="#888"
        />

        {/* Password */}
        <View className="w-full mb-4 relative">
          <TextInput
            placeholder="Masukan Kata Sandi Anda"
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

        {/* Confirm Password */}
        <View className="w-full mb-6 relative">
          <TextInput
            placeholder="Masukan Ulang Kata Sandi Anda"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!confirmPasswordVisible}
            className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            className="absolute right-4 top-4"
          >
            <Ionicons
              name={confirmPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-gradientEnd shadow-md w-full p-4 rounded-xl mb-4"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-center text-white font-bold text-xl">
              Daftar
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          className="flex-row justify-between text-sm"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-black text-lg">Anda sudah punya akun?</Text>
          <Text className="text-gradientStart"> Masuk Sekarang</Text>
        </TouchableOpacity>

        <Text className="text-sm text-red-500 mt-2">
          * Mohon Isi Data Dengan Lengkap
        </Text>
      </View>
    </ImageBackground>
  );
}