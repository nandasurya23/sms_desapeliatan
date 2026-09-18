import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, ScrollView, InteractionManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useRouter } from 'expo-router';
import { locations } from "@/data/locations";
import { getUserData } from "@/services/auth";
import { getBankSampahTotalWeight } from "@/services/bankSampah";
import Skeleton from "@/components/Skeleton";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
};

export default function Home() {
    const [username, setUsername] = useState("");
    const [totalTransaksi, setTotalTransaksi] = useState(0);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoadingTotal, setIsLoadingTotal] = useState(true);
    const [error, setError] = useState(""); 
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Hapus check token manual karena sudah di-handle oleh _layout.tsx
                const data = await getUserData();
                if (data.error) {
                    setError(data.error);
                    return;
                }

                const fetchedUsername = ('username' in data ? (data as { username?: string }).username : data.data?.username);
                if (fetchedUsername) {
                    setUsername(fetchedUsername);
                } else {
                    setError("Data profil tidak lengkap");
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data pengguna";
                setError(message);
            } finally {
                setIsLoadingUser(false);
            }
        };

        InteractionManager.runAfterInteractions(() => {
            fetchUserData();
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const loadTotal = async () => {
                setIsLoadingTotal(true);
                const total = await getBankSampahTotalWeight();
                if (active) {
                    setTotalTransaksi(total);
                    setIsLoadingTotal(false);
                }
            };

            InteractionManager.runAfterInteractions(() => {
                loadTotal();
            });

            return () => {
                active = false;
            };
        }, [])
    );


    return (
        <SafeAreaView className="flex-1 bg-gray-200">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                <View className="flex-row justify-between items-center px-4 py-2 bg-white">
                    <Ionicons name="person-circle-outline" size={32} color="#369E4E" />
                    <View className="flex-1 ml-4">
                        {isLoadingUser ? (
                            <>
                                <Skeleton width={150} height={20} className="mb-2" />
                                <Skeleton width={200} height={14} />
                            </>
                        ) : (
                            <>
                                <Text className="text-lg font-bold">
                                    {getGreeting()}, {username || "Pengguna"}!
                                </Text>
                                <Text className="text-gray-500 text-sm">Semoga harimu menyenangkan 😊</Text>
                            </>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => router.push("/profile")}>
                        <Ionicons name="settings-outline" size={24} color="#369E4E" />
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
                        source={require("../../assets/images/heros.png")}
                        className="w-full h-40 rounded-xl mb-7"
                        resizeMode="cover"
                    />
                    <View className="bg-gradientStart p-5 rounded-xl mb-4 h-[68px] justify-center">
                        {isLoadingTotal ? (
                            <Skeleton width={180} height={20} />
                        ) : (
                            <Text className="text-white text-xl font-bold">Total Transaksi: {totalTransaksi}kg</Text>
                        )}
                    </View>
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="text-lg font-bold">Lokasi Daur Ulang Terdekat</Text>
                        <Text className="text-lg text-navbar">Lihat Semua</Text>
                    </View>
                    <FlatList
                        data={locations}
                        horizontal
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        initialNumToRender={2}
                        maxToRenderPerBatch={3}
                        windowSize={3}
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
                        <Text className="text-lg font-bold">Edukasi & Tips Daur Ulang</Text>
                        <Text className="text-lg text-navbar">Lihat Semua</Text>
                    </View>
                    <View className="bg-white rounded-xl shadow-md p-4 w-full">
                        <Image
                            source={require("../../assets/images/edukasi.png")}
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
