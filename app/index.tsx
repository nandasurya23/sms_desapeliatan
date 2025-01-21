import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { locations } from "@/data/locations";


const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
};

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-2 bg-gray-100">
                {/* Ikon User */}
                <TouchableOpacity>
                    <Ionicons name="person-circle-outline" size={32} color="#3DA656" />
                </TouchableOpacity>
                {/* Ucapan dan Salam */}
                <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold">{getGreeting()}, User!</Text>
                    <Text className="text-gray-500 text-sm">Semoga harimu menyenangkan 😊</Text>
                </View>
                {/* Ikon Profil */}
                <TouchableOpacity onPress={() => console.log("Navigasi ke halaman profil")}>
                    <Ionicons name="settings-outline" size={24} color="#3DA656" />
                </TouchableOpacity>
            </View>

            {/* Konten */}
            <View className="flex-1 px-4 mt-4">
                {/* Gambar */}
                <Image
                    source={require("../assets/images/heros.png")}
                    className="w-full h-40 rounded-md mb-4"
                    resizeMode="cover"
                />
                {/* Total Transaksi */}
                <View className="bg-gradientStart p-4 rounded-md mb-4">
                    <Text className="text-white text-lg font-bold">Total Transaksi Anda:</Text>
                    <Text className="text-white text-2xl font-extrabold">50kg</Text>
                </View>
                {/* Slider Lokasi Bank Sampah */}
                <Text className="text-lg font-bold mb-2">Lokasi Bank Sampah Terdekat</Text>
                <FlatList
                    data={locations}
                    horizontal
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View className="bg-white border border-gray-200 rounded-md shadow-md mr-4 p-4 w-64">
                            {/* Gambar */}
                            <Image
                                source={item.image}
                                className="w-full h-48 rounded-md mb-2"
                                resizeMode="cover"
                            />
                            {/* Nama Bank Sampah */}
                            <Text className="text-black text-lg font-bold">{item.name}</Text>
                            {/* Alamat */}
                            <Text className="text-black mb-2">{item.address}</Text>
                            {/* Rating */}
                            <View className="flex-row items-center">
                                <Ionicons name="star" size={16} color="#FFD700" />
                                <Text className="ml-1 text-gray-700">{item.rating.toFixed(1)}</Text>
                            </View>
                        </View>
                    )}
                />

            </View>
        </SafeAreaView>
    );
}
