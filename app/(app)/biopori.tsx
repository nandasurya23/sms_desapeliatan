import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
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

  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [lastClickTime, setLastClickTime] = useState<Record<string, number>>({});
  const [animValues, setAnimValues] = useState<Record<string, Animated.Value>>({});
  const [disabledButtons, setDisabledButtons] = useState<Record<string, boolean>>({});

  const router = useRouter();

  const fetchData = async () => {
    setRefreshing(true);
    const res = await getBiopori();
    if (typeof res === "string") Alert.alert("Error", res);
    else {
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
    const now = Date.now();
    if (lastClickTime[id] && now - lastClickTime[id] < 1000) return;

    setLastClickTime(prev => ({ ...prev, [id]: now }));
    setDisabledButtons(prev => ({ ...prev, [id]: true }));

    // increment counter tanpa reset
    setClickCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

    // setup animasi scale
    if (!animValues[id]) {
      setAnimValues(prev => ({ ...prev, [id]: new Animated.Value(1) }));
    }
    Animated.sequence([
      Animated.timing(animValues[id] || new Animated.Value(1), {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValues[id] || new Animated.Value(1), {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const res = await markFull(id);
    if (res === true) {
      setBioporiData(prev =>
        prev.map(b => (b.id === id ? { ...b, isFull: true } : b))
      );
      setFilteredData(prev =>
        prev.map(b => (b.id === id ? { ...b, isFull: true } : b))
      );
      Alert.alert("Berhasil", "Silahkan klik tombol Panen");
    } else {
      Alert.alert("Error", res);
    }

    setTimeout(() => {
      setDisabledButtons(prev => ({ ...prev, [id]: false }));
    }, 1000);
  };

  const handleMarkHarvested = async (id: string) => {
    const res = await markHarvested(id);
    if (res === true) {
      setBioporiData(prev =>
        prev.map(b => (b.id === id ? { ...b, isHarvested: true, isFull: false } : b))
      );
      setFilteredData(prev =>
        prev.map(b => (b.id === id ? { ...b, isHarvested: true, isFull: false } : b))
      );

      Alert.alert("Berhasil", "Biopori sudah dipanen. Tombol Penuh tetap aktif!");
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

                {/* Header dengan badge counter */}
                <View className="flex-row justify-between my-4 items-center">
                  <Text className="text-xl font-bold">{b.name}</Text>

                  <View className="flex-row items-center space-x-2">
                    {/* Badge counter selalu muncul */}
                    <View className="bg-yellow-500 rounded-md px-2 py-1 justify-center items-center mr-2">
                      <Text className="text-white text-xs font-bold">{clickCounts[b.id] || 0}</Text>
                    </View>

                    {/* Status Penuh / Dipanen */}
                    <View className="flex-row">
                      {b.isFull && <Text className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs mr-2">Penuh</Text>}
                      {b.isHarvested && <Text className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">Dipanen</Text>}
                    </View>
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

                {/* Tombol Penuh & Ubah */}
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    onPress={() => handleMarkFull(b.id)}
                    disabled={disabledButtons[b.id]}
                    className={`bg-gradientStart p-5 mr-4 rounded-xl flex-1 ${disabledButtons[b.id] ? 'opacity-50' : ''}`}
                  >
                    <Text className="text-white text-xl text-center">Penuh</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleEditClick(b.id)}
                    className="bg-buttonGreen p-5 rounded-xl flex-1"
                  >
                    <Text className="text-white text-xl text-center">Ubah</Text>
                  </TouchableOpacity>
                </View>

                {/* Tombol Panen */}
                {b.isFull && !b.isHarvested && (
                  <View className="mt-4">
                    <TouchableOpacity
                      onPress={() => handleMarkHarvested(b.id)}
                      className="bg-gradientEnd p-5 rounded-xl w-full"
                    >
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