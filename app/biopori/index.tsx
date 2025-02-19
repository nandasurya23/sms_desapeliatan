import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';

interface Biopori {
  id: string;
  name: string;
  date: string;
  time: string;
  end_date: Date;
  end_time: string;
  image_url: string;
  isFull: boolean;
  isHarvested: boolean;
}

export default function Biopori() {
  const [bioporiName, setBioporiName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [photo, setPhoto] = useState<string | null>(null);
  const [bioporiData, setBioporiData] = useState<Biopori[]>([]);
  const [filteredData, setFilteredData] = useState<Biopori[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFullClicked, setIsFullClicked] = useState(false);
  const [updateBioporiId, setUpdateBioporiId] = useState<string | null>(null);

  const router = useRouter();

  // Function to fetch biopori data
  const fetchBioporiData = async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert('Authentication Error', 'User is not authenticated');
      return;
    }

    try {
      const response = await fetch('https://sms-backend-desa-peliatan.vercel.app/api/biopori', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send token in the request header
        },
      });

      const result = await response.json();
      if (response.ok) {
        setBioporiData(result.data); // Set the fetched data to state
        setFilteredData(result.data); // Initialize filtered data with fetched data
      } else {
        console.error('Error fetching biopori data:', result.error);
        Alert.alert('Error', result.error || 'An error occurred while fetching biopori data');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while communicating with the server');
    }
  };

  useEffect(() => {
    fetchBioporiData(); // Fetch biopori data on component mount
  }, []);

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = bioporiData.filter((biopori) =>
      biopori.name.toLowerCase().includes(query.toLowerCase()) // Filter biopori by name
    );
    setFilteredData(filtered); // Update filtered data
  };

  const handleUbahClick = (id: string) => {
    const bioporiToUpdate = bioporiData.find((b) => b.id === id);
    if (bioporiToUpdate) {
      setBioporiName(bioporiToUpdate.name);
      setStartDate(new Date(bioporiToUpdate.date));
      setStartTime(new Date(`1970-01-01T${bioporiToUpdate.time}:00Z`));
      setPhoto(bioporiToUpdate.image_url);
      setUpdateBioporiId(id); // Simpan ID biopori yang sedang diubah

    }
  };


  // const handleUpdateBiopori = async () => {
  //   if (!updateBioporiId) return;

  //   try {
  //     const updatedData = {
  //       name: bioporiName,
  //       startDate: startDate.toISOString().split("T")[0],
  //       startTime: startTime.toISOString().split("T")[1].slice(0, 5),
  //       endDate: calculateEndDate(startDate).toISOString().split("T")[0],
  //       endTime: startTime.toISOString().split("T")[1].slice(0, 5),
  //       photo,
  //     };

  //     // Update data di server
  //     await updateBiopori(updateBioporiId, updatedData);

  //     // Perbarui data lokal
  //     setBioporiData((prevData) =>
  //       prevData.map((b) => (b.id === updateBioporiId ? { ...b, ...updatedData } : b))
  //     );

  //     setUpdateBioporiId(null);
  //     setBioporiName("");
  //     setStartDate(new Date());
  //     setStartTime(new Date());
  //     setPhoto("");
  //   } catch (error) {
  //     console.error("Failed to update biopori:", error);
  //   }
  // };


  const markAsFull = async (id: string) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert('Authentication Error', 'User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}/full`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send token in the request header
        },
      });

      const result = await response.json();
      if (response.ok) {
        // Update the local biopori data
        setBioporiData((prevData) =>
          prevData.map((biopori) =>
            biopori.id === id ? { ...biopori, isFull: true } : biopori
          )
        );
        setFilteredData((prevData) =>
          prevData.map((biopori) =>
            biopori.id === id ? { ...biopori, isFull: true } : biopori
          )
        );
        Alert.alert("Berhasil", "Silahkan Klik Tombol Panen");
      } else {
        console.error('Error:', result.error);
        Alert.alert('Error', result.error || 'An error occurred while marking biopori as full');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while communicating with the server');
    }
    setIsFullClicked(true);
  };

  const markAsHarvested = async (id: string) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      Alert.alert('Authentication Error', 'User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}/harvested`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send token in the request header
        },
      });

      const result = await response.json();
      if (response.ok) {
        // Update the local biopori data
        setBioporiData((prevData) =>
          prevData.map((biopori) =>
            biopori.id === id ? { ...biopori, isHarvested: true } : biopori
          )
        );
        setFilteredData((prevData) =>
          prevData.map((biopori) =>
            biopori.id === id ? { ...biopori, isHarvested: true } : biopori
          )
        );
        Alert.alert("Berhasil", "Biopori anda sudah panen");
      } else {
        console.error('Error:', result.error);
        Alert.alert('Error', result.error || 'An error occurred while marking biopori as harvested');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while communicating with the server');
    }
    setIsFullClicked(false);
  };

  const updateBiopori = async (id: string, updatedData: Partial<Biopori>) => {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      Alert.alert("Authentication Error", "User is not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Kirim token di header
          },
          body: JSON.stringify(updatedData), // Kirim data yang diperbarui
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Biopori updated successfully!");

        // Jika data lokal perlu diperbarui:
        setBioporiData((prevData) =>
          prevData.map((b) =>
            b.id === id ? { ...b, ...updatedData } : b
          )
        );
      } else {
        // Tangani error dari server
        Alert.alert(
          "Update Failed",
          result.message || "Failed to update biopori. Please try again."
        );
      }
    } catch (error) {
      // Tangani error jaringan atau lainnya
      console.error("Update Biopori Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="flex-row justify-between items-center px-4 py-4 ">
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
          {filteredData.map((biopori) => (
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
              </View>
              <View className="mb-4">
                <View className="flex-row justify-between mb-4">
                  <Text className="text-gray-700 text-lg font-semibold">Mulai:</Text>
                  {/* Pastikan startDate adalah objek Date */}
                  <Text className="text-gray-700 text-lg">
                    {biopori.date ? format(new Date(biopori.date), 'dd MMM yyyy') : '-'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 text-lg font-semibold">Selesai:</Text>
                  {/* Pastikan endDate adalah objek Date */}
                  <Text className="text-gray-700 text-lg">
                    {biopori.end_date ? format(new Date(biopori.end_date), 'dd MMM yyyy') : '-'}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-500 text-xl">
                  {/* Periksa dan format startTime */}
                  Jam Mulai: {biopori.time
                    ? format(new Date(`1970-01-01T${biopori.time.slice(0, 5)}:00Z`), 'HH:mm')
                    : '-'}

                </Text>
                <Text className="text-gray-500 text-xl">
                  {/* Periksa dan format endTime */}
                  Jam Selesai: {biopori.end_time
                    ? format(new Date(`1970-01-01T${biopori.end_time.slice(0, 5)}:00Z`), 'HH:mm')
                    : '-'}

                </Text>
              </View>


              <View className="flex-row justify-center">
                {!isFullClicked && (
                  <TouchableOpacity
                    onPress={() => markAsFull(biopori.id)}
                    className="bg-gradientStart p-3 rounded-xl mx-5 w-1/3"
                  >
                    <Text className="text-white text-center text-xl">Penuh</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleUbahClick(biopori.id)}
                  className="bg-buttonGreen p-3 rounded-xl mx-5 w-1/3"
                >
                  <Text className="text-white text-center text-xl">Ubah</Text>
                </TouchableOpacity>
              </View>
              <View className="flex items-center justify-center mt-5">
                <TouchableOpacity
                  onPress={() => markAsHarvested(biopori.id)}
                  className={`bg-gradientEnd p-3 rounded-xl w-1/2 ${!isFullClicked ? 'bg-gray-500 opacity-50' : 'bg-gradientEnd'}`}
                  disabled={!isFullClicked}
                >
                  <Text className="text-white text-center text-xl">Panen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
