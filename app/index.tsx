import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Image, ScrollView, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from 'expo-router';
import { locations } from "@/data/locations";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
};

export default function Home() {
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");  // New state for error handling
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await SecureStore.getItemAsync("token");
                if (token) {
                    const response = await fetch("https://sms-backend-desa-peliatan.vercel.app/api/user-data", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    });
    
                    const data = await response.json();
    
                    if (response.ok) {
                        // Check if 'id' exists in response
                        if (data && data.id !== undefined) {
                            setUserId(data.id);
                            setUsername(data.username);
                            await SecureStore.setItemAsync("userId", data.id.toString());
                        } else {
                            console.error("User ID not found in response data:", data);
                            setError("Data pengguna tidak lengkap. ID tidak ditemukan.");
                        }
                    } else {
                        setError("Gagal mengambil data pengguna");
                    }
                } else {
                    setError("Token tidak ditemukan.");
                }
            } catch (error) {
                console.log("Error fetching user data:", error);
                setError("Terjadi kesalahan saat mengambil data pengguna");
            }
        };
    
        fetchUserData();
    }, []);
    

    return (
        <SafeAreaView className="flex-1 bg-gray-200">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                <View className="flex-row justify-between items-center px-4 py-2 bg-white">
                    <Ionicons name="person-circle-outline" size={32} color="#3DA656" />
                    <View className="flex-1 ml-4">
                        <Text className="text-lg font-bold">
                            {getGreeting()}, {username || "Pengguna"}!
                        </Text>
                        <Text className="text-gray-500 text-sm">Semoga harimu menyenangkan 😊</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push("/profile-screen")}>
                        <Ionicons name="settings-outline" size={24} color="#3DA656" />
                    </TouchableOpacity>
                </View>

                {/* Error message */}
                {error && (
                    <View className="bg-red-100 p-4 mb-4 rounded-md">
                        <Text className="text-red-500 text-center">{error}</Text>
                    </View>
                )}

                {/* Konten */}
                <View className="px-4 mt-4">
                    <Image
                        source={require("../assets/images/heros.png")}
                        className="w-full h-40 rounded-xl mb-7"
                        resizeMode="cover"
                    />
                    <View className="bg-gradientStart p-5 rounded-xl mb-4">
                        <Text className="text-white text-xl font-bold">Total Transaksi: 50kg</Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-xl font-bold">Lokasi Daur Ulang Terdekat</Text>
                        <Text className="text-xl text-green-600">Lihat Semua</Text>
                    </View>
                    <FlatList
                        data={locations}
                        horizontal
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        renderItem={({ item }) => (
                            <View className="bg-white rounded-xl shadow-md mr-4 p-4 w-64">
                                <Image
                                    source={item.image}
                                    className="w-full h-48 rounded-xl mb-2"
                                    resizeMode="cover"
                                />
                                <Text className="text-black text-lg font-bold">{item.name}</Text>
                                <Text className="text-black mb-2">{item.address}</Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="star" size={16} color="#FFD700" />
                                    <Text className="ml-1 text-gray-700">{item.rating.toFixed(1)}</Text>
                                </View>
                            </View>
                        )}
                    />
                    {/* Edukasi */}
                    <View className="flex-row items-center justify-between my-5">
                        <Text className="text-xl font-bold">Edukasi & Tips Daur Ulang</Text>
                        <Text className="text-xl text-green-600">Lihat Semua</Text>
                    </View>
                    <View className="bg-white rounded-xl shadow-md p-4 w-full">
                        <Image
                            source={require("../assets/images/edukasi.png")}
                            className="w-full h-44 rounded-xl mb-5"
                            resizeMode="cover"
                        />
                        <View>
                            <Text className="bg-gradientEnd py-2 px-2 w-1/3 text-white rounded-full text-center text-lg mb-4">Edukasi</Text>
                            <Text className="text-xl font-medium mb-4">Dari Sampah ke Barang Bernilai - Proses Daur Ulang Kertas, Plastik, dan Logam</Text>
                            <Text className="text-lg font-normal">4 hari yang lalu</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
