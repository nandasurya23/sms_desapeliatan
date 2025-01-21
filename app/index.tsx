import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Image, ScrollView } from "react-native";
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
        <SafeAreaView className="flex-1 bg-gray-200">
            {/* Kontainer Scroll */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-4 py-2 bg-white">
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
                <View className="px-4 mt-4">
                    {/* Gambar Hero */}
                    <Image
                        source={require("../assets/images/heros.png")}
                        className="w-full h-40 rounded-xl mb-7"
                        resizeMode="cover"
                    />
                    {/* Total Transaksi */}
                    <View className="bg-gradientStart p-5 rounded-xl mb-4">
                        <Text className="text-white text-xl font-bold">Total Transaksi: 50kg</Text>
                    </View>
                    {/* Slider Lokasi Bank Sampah */}
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
                                {/* Gambar */}
                                <Image
                                    source={item.image}
                                    className="w-full h-48 rounded-xl mb-2"
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
