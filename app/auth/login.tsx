import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons for eye icon

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false); // State for toggling password visibility
    const [loading, setLoading] = useState(false); // State for loading
    const router = useRouter();

    const handleLogin = async () => {
        // Validasi input
        if (!username || !password) {
            Alert.alert("Harap Isi Username dan Password");
            return;
        }

        // Set loading to true
        setLoading(true);

        // Kirim data login ke backend
        try {
            const response = await fetch("https://sms-backend-desa-peliatan.vercel.app/api/login", { // Ganti URL dengan endpoint yang sesuai
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Simpan token autentikasi dan status login ke SecureStore
                await SecureStore.setItemAsync("token", data.token);
                await SecureStore.setItemAsync("isLoggedIn", "true");
                router.replace("/");
            } else {
                Alert.alert("Error", data.error || "Invalid username or password.");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            // Set loading to false after the login process is complete
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://res.cloudinary.com/df82hir2r/image/upload/v1737544254/auth_b7ki8e.jpg' }} // Replace with your background image URL
            className="flex-1 justify-center items-center"
        >
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50" />
            <View className="w-11/12 p-6 bg-gray-200 rounded-xl">
                <Text className="text-2xl font-bold mb-4 text-center">Masuk Ke Akun Anda</Text>
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
                    placeholderTextColor="#888"
                />
                <View className="w-full mb-6 relative">
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible} // Toggle visibility based on state
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
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-gradientEnd shadow-md w-full p-4 rounded-xl mb-4"
                    disabled={loading} // Disable the button while loading
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" /> // Show loading spinner
                    ) : (
                        <Text className="text-center text-white font-bold text-xl">Masuk</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity className="flex-row justify-between text-sm" onPress={() => router.push("/auth/register")}>
                    <Text className="text-black">Anda belum punya akun?</Text>
                    <Text className="text-gradientStart"> Daftar Sekarang</Text>
                </TouchableOpacity>
                <Text className="text-sm text-red-500 mt-2">* Mohon Isi Data Dengan Lengkap</Text> {/* Required indicator */}
            </View>
        </ImageBackground>
    );
};

export default Login;
