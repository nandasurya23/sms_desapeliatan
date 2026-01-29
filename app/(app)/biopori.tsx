import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Alert, RefreshControl } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { format } from "date-fns";

import { Biopori as BioporiType, getBiopori, markFull, markHarvested } from "@/services/biopori";

export default function Biopori() {
  const [bioporiData, setBioporiData] = useState<BioporiType[]>([]);
  const [filteredData, setFilteredData] = useState<BioporiType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    setRefreshing(true);
    const res = await getBiopori();

    if (typeof res === "string") {
      Alert.alert("Error", res);
    } else {
      setBioporiData(res);
      setFilteredData(res);
    }

    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredData(
      bioporiData.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const handleEditClick = (id: string) => router.push(`/form?id=${id}`);

  const handleMarkFull = async (id: string) => {
    const res = await markFull(id);
    if (res === true) {
      setBioporiData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isFull: true } : b))
      );
      setFilteredData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isFull: true } : b))
      );
      Alert.alert("Berhasil", "Silahkan klik tombol Panen");
    } else Alert.alert("Error", res);
  };

  const handleMarkHarvested = async (id: string) => {
    const res = await markHarvested(id);
    if (res === true) {
      setBioporiData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isHarvested: true } : b))
      );
      setFilteredData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isHarvested: true } : b))
      );
      Alert.alert("Berhasil", "Biopori sudah dipanen");
    } else Alert.alert("Error", res);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={["#3b82f6"]} />
        }
      >
        <View className="flex-row justify-between items-center px-4 py-4">
          <TextInput
            placeholder="Cari Biopori"
            value={searchQuery}
            onChangeText={handleSearch}
            className="w-4/5 px-4 py-3 rounded-xl bg-white text-xl"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            onPress={() => router.push("/form")}
            className="bg-gradientEnd rounded-full p-3"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-4 mt-4">
          {filteredData.length === 0 ? (
            <View className="bg-white p-6 rounded-xl items-center">
              <Text className="text-lg text-gray-500">Tidak ada data biopori</Text>
            </View>
          ) : (
            filteredData.map((b) => (
              <View key={b.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-4">
                {b.image_url && <Image source={{ uri: b.image_url }} className="w-full h-52 rounded-xl" resizeMode="cover" />}

                <View className="flex-row justify-between my-4">
                  <Text className="text-xl font-bold">{b.name}</Text>
                  <View className="flex-row">
                    {b.isFull && <Text className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs mr-2">Penuh</Text>}
                    {b.isHarvested && <Text className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">Dipanen</Text>}
                  </View>
                </View>

                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700 text-base font-semibold">Mulai:</Text>
                    <Text className="text-gray-700 text-base">
                      {format(new Date(b.date), 'dd MMM yyyy')} • {b.time.slice(0,5)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700 text-base font-semibold">Selesai:</Text>
                    <Text className="text-gray-700 text-base">
                      {format(new Date(b.end_date), 'dd MMM yyyy')} • {b.end_time.slice(0,5)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-center space-x-4">
                  {!b.isFull && (
                    <TouchableOpacity onPress={() => handleMarkFull(b.id)} className="bg-gradientStart p-5 mr-4 rounded-xl flex-1">
                      <Text className="text-white text-xl text-center">Penuh</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleEditClick(b.id)} className="bg-buttonGreen p-5 rounded-xl flex-1">
                    <Text className="text-white text-xl text-center">Ubah</Text>
                  </TouchableOpacity>
                </View>

                {b.isFull && !b.isHarvested && (
                  <View className="mt-4">
                    <TouchableOpacity onPress={() => handleMarkHarvested(b.id)} className="bg-gradientEnd p-5 rounded-xl w-full">
                      <Text className="text-white text-xl text-center">Panen</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}