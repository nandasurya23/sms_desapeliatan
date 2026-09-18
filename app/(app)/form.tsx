import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, addDays } from 'date-fns';
import { resolveBackendAssetUrl } from '@/utils/image';
import apiClient from '@/services/apiClient';

type BioporiRecord = {
  name?: string;
  image_url?: string;
  date?: string;
  time?: string;
  end_date?: string;
  end_time?: string;
  isfull?: boolean;
  ispanen?: boolean;
  endDate?: string;
  endTime?: string;
};

const appendIfPresent = (payload: Record<string, string>, key: string, value?: string | null) => {
  if (value) {
    payload[key] = value;
  }
};


const BioporiForm = () => {
  const { id } = useLocalSearchParams();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 60));
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingBiopori, setExistingBiopori] = useState<BioporiRecord | null>(null);

  const router = useRouter();

  const loadBioporiData = useCallback(async () => {
    try {
      const response = await apiClient.get(`/biopori/${id}`);
      const bioporiData: BioporiRecord = response.data?.data || response.data || {};
      
      setExistingBiopori(bioporiData);
      setName(bioporiData.name || '');
        if (bioporiData.image_url) {
          const resolvedImage = resolveBackendAssetUrl(bioporiData.image_url);
          setImageUri(resolvedImage || bioporiData.image_url);
          setPhoto(resolvedImage || bioporiData.image_url);
        }
        if (bioporiData.date) {
          setDate(new Date(bioporiData.date));
        }
        if (bioporiData.time) {
          setTime(new Date(`1970-01-01T${bioporiData.time}`));
        }
        const loadedEndDate = bioporiData.end_date || bioporiData.endDate;
        const loadedEndTime = bioporiData.end_time || bioporiData.endTime;
        if (loadedEndDate) {
          setEndDate(new Date(loadedEndDate));
        }
        if (loadedEndTime) {
          setEndTime(new Date(`1970-01-01T${loadedEndTime}`));
        }
      return;
    } catch (error: any) {
      Alert.alert('Perhatian', error.message || 'Terjadi kesalahan saat mengambil data biopori');
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadBioporiData();
      setIsEditMode(true);
    }
  }, [id, loadBioporiData]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const uri = result.assets[0].uri;
        setPhoto(uri);
        setImageUri(result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : uri);
      }
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const uri = result.assets[0].uri;
        setPhoto(uri);
        setImageUri(result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : uri);
      }
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setDate(currentDate);
    setEndDate(addDays(currentDate, 60));
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || new Date();
    setTime(currentTime);
    setEndTime(currentTime);
  };

  const onSubmit = async () => {
    if (!name.trim() || !date || !time) {
      Alert.alert('Perhatian', 'Nama, tanggal, dan waktu wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const url = isEditMode ? `/biopori/${id}` : `/biopori`;
      const existingEndDate = existingBiopori?.end_date || existingBiopori?.endDate;
      const existingEndTime = existingBiopori?.end_time || existingBiopori?.endTime;
      const payload: Record<string, string> = {
        name: name.trim(),
        date: format(date, 'yyyy-MM-dd'),
        time: format(time, 'HH:mm'),
      };

      const resolvedImageUrl = imageUri || existingBiopori?.image_url;
      appendIfPresent(payload, 'image_url', resolvedImageUrl);

      if (!isEditMode || existingEndDate) {
        appendIfPresent(payload, 'end_date', format(endDate, 'yyyy-MM-dd'));
      } else if (endDate) {
        appendIfPresent(payload, 'end_date', format(endDate, 'yyyy-MM-dd'));
      }

      if (!isEditMode || existingEndTime) {
        appendIfPresent(payload, 'end_time', format(endTime, 'HH:mm'));
      } else if (endTime) {
        appendIfPresent(payload, 'end_time', format(endTime, 'HH:mm'));
      }

      if (isEditMode) {
        await apiClient.put(url, payload);
      } else {
        await apiClient.post(url, payload);
      }
      
      router.push('/biopori');
    } catch (error: any) {
      Alert.alert('Perhatian', error.message || 'Terjadi kesalahan saat menyimpan biopori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className='p-6'>
          <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
            {isEditMode ? 'Edit Biopori' : 'Tambah Biopori'}
          </Text>

          {/* Image Picker */}
          <View className="items-center mb-6">
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity onPress={takePhoto} className="p-4 bg-blue-500 rounded-full mx-2">
                <Ionicons name="camera" size={40} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={pickImage} className="p-4 bg-green-500 rounded-full">
                <Ionicons name="image" size={40} color="white" />
              </TouchableOpacity>
            </View>

            {photo && (
              <Image source={{ uri: photo }} className="w-96 h-64 rounded-xl mt-4" />
            )}
          </View>

          {/* Name Input */}
          <TextInput
            className="w-full px-5 py-5 rounded-xl mb-4 text-lg bg-white"
            placeholderTextColor="#888"
            placeholder="Nama Biopori"
            value={name}
            onChangeText={setName}
          />

          {/* Date Picker */}
          <Text className="text-lg text-gray-700 mb-2">Tanggal Mulai Tanam:</Text>
          <View className="rounded-xl mb-4">
            {Platform.OS === 'ios' ? (
              <DateTimePicker value={date} mode="date" display="inline" onChange={handleDateChange} />
            ) : (
              <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
            )}
          </View>

          {/* Time Picker */}
          <Text className="text-lg text-gray-700 mb-2">Waktu Mulai Tanam:</Text>
          <View className="rounded-xl mb-4">
            {Platform.OS === 'ios' ? (
              <DateTimePicker value={time} mode="time" display="inline" onChange={handleTimeChange} />
            ) : (
              <DateTimePicker value={time} mode="time" display="default" onChange={handleTimeChange} />
            )}
          </View>

          {/* End Date (Read-only) */}
          <Text className="text-lg text-gray-700 mb-2 mt-4">Tanggal Selesai Tanam:</Text>
          <View className="w-full px-3 py-3 rounded-xl mb-4 text-lg bg-white">
            <Text className="text-gray-500 text-lg">{format(endDate, 'yyyy-MM-dd')}</Text>
          </View>

          {/* End Time (Read-only) */}
          <Text className="text-lg text-gray-700 mb-2 mt-4">Waktu Selesai Tanam:</Text>
          <View className="w-full px-3 py-3 rounded-xl mb-4 text-lg bg-white">
            <Text className="text-gray-500 text-lg">{format(endTime, 'HH:mm')}</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={onSubmit} 
            className="bg-gradientEnd p-5 rounded-xl mt-8 shadow-md"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">
                {isEditMode ? 'Update' : 'Simpan'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BioporiForm;
