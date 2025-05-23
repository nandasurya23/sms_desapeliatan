import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons

const Register = () => {
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState(""); // Email state added
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        // Validasi field kosong
        if (!username || !phoneNumber || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Semua field harus diisi");
            return;
        }
    
        // Validasi kesamaan password
        if (password !== confirmPassword) {
            Alert.alert("Error", "Password tidak cocok");
            return;
        }
    
        // Validasi format email
        if (!email.includes('@')) {
            Alert.alert("Error", "Email harus mengandung @");
            return;
        }
    
        // Validasi panjang password
        if (password.length < 6) {
            Alert.alert("Error", "Password minimal 6 karakter");
            return;
        }
    
        try {
            const response = await fetch("https://sms-backend-desa-peliatan.vercel.app/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    phone_number: phoneNumber,
                    email,
                    password,
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Jika backend mengembalikan token (sesuaikan dengan response backend Anda)
                if (data.token) {
                    await SecureStore.setItemAsync("token", data.token);
                }
                
                Alert.alert("Sukses", "Pendaftaran berhasil! Silakan login.");
                router.replace("/auth/login");
            } else {
                // Menampilkan pesan error dari backend atau default message
                Alert.alert("Error", data.error || "Terjadi kesalahan. Silakan coba lagi.");
            }
        } catch (error) {
            console.error("Register error:", error);
            Alert.alert("Error", "Koneksi bermasalah. Silakan coba lagi.");
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://res.cloudinary.com/df82hir2r/image/upload/v1737544254/auth_b7ki8e.jpg' }} 
            className="flex-1 justify-center items-center"
        >
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50" />
            <View className="w-11/12 p-6 bg-gray-200 rounded-xl">
                <Text className="text-2xl font-bold mb-4 text-center">Daftar Akun</Text>
                <TextInput
                    placeholder="Masukan Username Anda"
                    value={username}
                    onChangeText={setUsername}
                    className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
                    placeholderTextColor="#888"
                />
                <TextInput
                    placeholder="Masukan Nomer HP Anda"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
                    placeholderTextColor="#888"
                />
                <TextInput
                    placeholder="Masukan Email Anda"
                    value={email}
                    onChangeText={setEmail} // Email input handler
                    className="w-full px-3 py-5 rounded-xl mb-4 bg-white"
                    placeholderTextColor="#888"
                />
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
                <TouchableOpacity
                    onPress={handleRegister}
                    className="bg-gradientEnd shadow-md w-full p-4 rounded-xl mb-4"
                >
                    <Text className="text-center text-white font-bold">Daftar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row justify-between text-sm" onPress={() => router.push("/auth/login")}>
                    <Text className="text-black text-lg">Anda sudah punya akun?</Text>
                    <Text className="text-gradientStart"> Masuk Sekarang</Text>
                </TouchableOpacity>
                <Text className="text-sm text-red-500 mt-2">* Mohon Isi Data Dengan Lengkap</Text> 
            </View>
        </ImageBackground>
    );
};

export default Register;
