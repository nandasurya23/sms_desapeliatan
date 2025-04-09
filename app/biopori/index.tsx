import React, { useState} from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Alert, RefreshControl } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';

interface Biopori {
  id: string;
  name: string;
  date: string;
  time: string;
  end_date: string;
  end_time: string;
  image_url: string;
  isFull: boolean;
  isHarvested: boolean;
}

export default function Biopori() {
  const [bioporiData, setBioporiData] = useState<Biopori[]>([]);
  const [filteredData, setFilteredData] = useState<Biopori[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullClicked, setIsFullClicked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  // Function to fetch biopori data
  const fetchBioporiData = async () => {
    setRefreshing(true);
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert('Error Autentikasi', 'Pengguna belum login');
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch('https://sms-backend-desa-peliatan.vercel.app/api/biopori', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setBioporiData(result.data);
        setFilteredData(result.data);
      } else {
        Alert.alert('Error', result.error || 'Gagal memuat data biopori');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghubungi server');
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchBioporiData();
    }, [])
  );

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = bioporiData.filter((biopori) =>
      biopori.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleEditClick = (id: string) => {
    router.push(`/form-biopori?id=${id}`);
  };

  const markAsFull = async (id: string) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert('Error Autentikasi', 'Pengguna belum login');
      return;
    }

    try {
      const response = await fetch(`https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}/full`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        // Update local state
        setBioporiData(prev => prev.map(b => 
          b.id === id ? { ...b, isFull: true } : b
        ));
        setFilteredData(prev => prev.map(b => 
          b.id === id ? { ...b, isFull: true } : b
        ));
        Alert.alert("Berhasil", "Silahkan klik tombol Panen");
      } else {
        Alert.alert('Error', result.error || 'Gagal menandai biopori sebagai penuh');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghubungi server');
    }
    setIsFullClicked(true);
  };

  const markAsHarvested = async (id: string) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert('Error Autentikasi', 'Pengguna belum login');
      return;
    }

    try {
      const response = await fetch(`https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}/harvested`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        // Update local state
        setBioporiData(prev => prev.map(b => 
          b.id === id ? { ...b, isHarvested: true } : b
        ));
        setFilteredData(prev => prev.map(b => 
          b.id === id ? { ...b, isHarvested: true } : b
        ));
        Alert.alert("Berhasil", "Biopori sudah dipanen");
      } else {
        Alert.alert('Error', result.error || 'Gagal menandai biopori sebagai dipanen');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghubungi server');
    }
    setIsFullClicked(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchBioporiData}
            colors={["#3b82f6"]}
          />
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
            onPress={() => router.push("/form-biopori")}
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
            filteredData.map((biopori) => (
              <View key={biopori.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-4">
                {biopori.image_url && (
                  <Image
                    source={{ uri: biopori.image_url }}
                    className="w-full h-52 rounded-xl"
                    resizeMode="cover"
                  />
                )}
                
                <View className="flex-row justify-between my-4">
                  <Text className="text-xl font-bold">{biopori.name}</Text>
                  <View className="flex-row">
                    {biopori.isFull && (
                      <Text className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs mr-2">
                        Penuh
                      </Text>
                    )}
                    {biopori.isHarvested && (
                      <Text className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                        Dipanen
                      </Text>
                    )}
                  </View>
                </View>

                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-700 text-base font-semibold">Mulai:</Text>
                    <Text className="text-gray-700 text-base">
                      {format(new Date(biopori.date), 'dd MMM yyyy')} • {biopori.time.slice(0,5)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-700 text-base font-semibold">Selesai:</Text>
                    <Text className="text-gray-700 text-base">
                      {format(new Date(biopori.end_date), 'dd MMM yyyy')} • {biopori.end_time.slice(0,5)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-center space-x-4">
                  {!biopori.isFull && (
                    <TouchableOpacity
                      onPress={() => markAsFull(biopori.id)}
                      className="bg-gradientStart p-5 mr-4 rounded-xl flex-1"
                    >
                      <Text className="text-white text-xl text-center">Penuh</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => handleEditClick(biopori.id)}
                    className="bg-buttonGreen p-5 rounded-xl flex-1"
                  >
                    <Text className="text-white text-xl text-center">Ubah</Text>
                  </TouchableOpacity>
                </View>

                {biopori.isFull && !biopori.isHarvested && (
                  <View className="mt-4">
                    <TouchableOpacity
                      onPress={() => markAsHarvested(biopori.id)}
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