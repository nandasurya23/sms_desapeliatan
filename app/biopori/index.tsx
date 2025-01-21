import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from "react-native";

interface Biopori {
  id: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  photo: string | null;
  isFull: boolean;
}

const calculateEndDate = (startDate: Date) => {
  const end = new Date(startDate);
  end.setDate(startDate.getDate() + 60);
  return end;
};

export default function Biopori() {
  const [bioporiName, setBioporiName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [photo, setPhoto] = useState<string | null>(null);
  const [bioporiData, setBioporiData] = useState<Biopori[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const addBiopori = () => {
    if (bioporiName && startDate && startTime) {
      const endDate = calculateEndDate(startDate);
      const endTime = new Date(startDate);
      endTime.setHours(startTime.getHours(), startTime.getMinutes());

      const newBiopori: Biopori = {
        id: String(bioporiData.length + 1),
        name: bioporiName,
        startDate: startDate.toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' }),
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endDate: endDate.toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        photo: photo,
        isFull: false,
      };

      setBioporiData([...bioporiData, newBiopori]);
      setBioporiName("");
      setStartDate(new Date());
      setStartTime(new Date());
      setPhoto(null);
      setIsFormVisible(false);
    } else {
      alert("Semua inputan harus diisi!");
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result && !result.canceled && result.assets) {
        const uri = result.assets[0].uri;
        setPhoto(uri);
      }
    } else {
      alert("Permission untuk akses galeri tidak diberikan");
    }
  };

  const markAsFull = (id: string) => {
    const updatedBiopori = bioporiData.map((biopori) =>
      biopori.id === id ? { ...biopori, isFull: true } : biopori
    );
    setBioporiData(updatedBiopori);
  };

  const markAsHarvested = (id: string) => {
    const updatedBiopori = bioporiData.map((biopori) =>
      biopori.id === id ? { ...biopori, isFull: false } : biopori
    );
    setBioporiData(updatedBiopori);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
      <View className="flex-row justify-between items-center px-4 py-4 ">
        <TextInput
          placeholder="Cari Biopori"
          className="w-4/5 px-4 py-3 rounded-xl bg-white text-xl"
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={() => setIsFormVisible(true)}
          className="bg-gradientEnd rounded-full p-3"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isFormVisible && (
        <View className="px-4 py-4">
          <Text className="text-xl font-bold mb-4">Form Tambah Biopori</Text>

          <TextInput
            value={bioporiName}
            onChangeText={setBioporiName}
            placeholder="Nama Biopori"
            className="bg-white px-4 py-3 rounded-md mb-4 text-xl"
          />

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white px-4 py-3 rounded-md mb-4 text-xl"
          >
            <Text className="text-black text-xl">{startDate.toLocaleDateString("id-ID")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="bg-white px-4 py-3 rounded-md mb-4 text-xl"
          >
            <Text className="text-black text-xl">{startTime.toLocaleTimeString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickImage}
            className="bg-white px-4 py-3 rounded-md mb-4 text-xl"
          >
            <Text className="text-black text-xl">Pilih Foto</Text>
          </TouchableOpacity>

          {/* Menampilkan preview foto jika sudah ada */}
          {photo && (
            <View className="mb-4">
              <Text className="text-gray-700 text-xl">Foto yang dipilih:</Text>
              <Image
                source={{ uri: photo }}
                className="w-full h-48 rounded-md mt-2"
                resizeMode="cover"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={addBiopori}
            className="bg-gradientEnd p-4 rounded-md shadow"
          >
            <Text className="text-white text-center text-xl">Simpan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menampilkan DatePicker jika showDatePicker true */}
      {showDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Menampilkan TimePicker jika showTimePicker true */}
      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <View className="flex-1 px-4 mt-4">
        {bioporiData.map((biopori) => (
          <View
            key={biopori.id}
            className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-4"
          >
            {biopori.photo && (
              <Image
                source={{ uri: biopori.photo }}
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
                <Text className="text-gray-700 text-lg">{biopori.startDate}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700 text-lg font-semibold">Selesai:</Text>
                <Text className="text-gray-700 text-lg">{biopori.endDate}</Text>
              </View>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500 text-xl">Jam: {biopori.startTime}</Text>
              <Text className="text-gray-500 text-xl">Jam: {biopori.endTime}</Text>
            </View>

            <View className="flex-row justify-center">
              {!biopori.isFull && (
                <TouchableOpacity
                  onPress={() => markAsFull(biopori.id)}
                  className="bg-gradientStart p-3 rounded-xl mx-5 w-1/3"
                >
                  <Text className="text-white text-center text-xl">Penuh</Text>
                </TouchableOpacity>
              )}

              {biopori.isFull ? (
                <TouchableOpacity
                  onPress={() => markAsHarvested(biopori.id)}
                  className="bg-gradientEnd p-3 rounded-md w-1/2"
                >
                  <Text className="text-white text-center text-xl">Panen</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => console.log("Ubah Biopori", biopori.id)}
                  className="bg-buttonGreen p-3 rounded-xl w-1/3"
                >
                  <Text className="text-white text-center text-xl">Ubah</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}