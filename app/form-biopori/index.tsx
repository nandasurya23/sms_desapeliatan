import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { format, addDays } from 'date-fns';

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

    const router = useRouter();

    // Load data for edit
    useEffect(() => {
        if (id) {
            loadBioporiData();
            setIsEditMode(true);
        }
    }, [id]);

    const loadBioporiData = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(`https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                const bioporiData = result.data;
                setName(bioporiData.name);
                setImageUri(bioporiData.image_url);
                setPhoto(bioporiData.image_url);
                setDate(new Date(bioporiData.date));
                setTime(new Date(`1970-01-01T${bioporiData.time}`));
                // Set end date/time jika ada di response
            } else {
                Alert.alert('Error', result.error || 'Gagal memuat data biopori');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Tidak dapat terhubung ke server');
        }
    };

    // Fungsi untuk memilih gambar
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                const uri = result.assets[0].uri;
                setPhoto(uri);
                setImageUri(uri);
            }
        } else {
            alert("Izin akses galeri tidak diberikan");
        }
    };

    // Fungsi untuk mengambil foto
    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets) {
                const uri = result.assets[0].uri;
                setPhoto(uri);
                setImageUri(uri);
            }
        } else {
            alert("Izin akses kamera tidak diberikan");
        }
    };

    // Handler untuk date/time picker
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

    // Fungsi submit untuk tambah/edit
    const onSubmit = async () => {
        if (!name || !date || !time) {
            Alert.alert('Error', 'Harap isi semua field yang wajib diisi');
            return;
        }

        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync('token');
            const url = isEditMode 
                ? `https://sms-backend-desa-peliatan.vercel.app/api/biopori/${id}`
                : 'https://sms-backend-desa-peliatan.vercel.app/api/biopori';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    image_url: imageUri,
                    date: format(date, 'yyyy-MM-dd'),
                    time: format(time, 'HH:mm'),
                    endDate: format(endDate, 'yyyy-MM-dd'),
                    endTime: format(endTime, 'HH:mm'),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Sukses', isEditMode ? 'Data biopori berhasil diperbarui' : 'Biopori berhasil ditambahkan');
                router.push('/biopori');
            } else {
                Alert.alert('Error', result.error || 'Terjadi kesalahan');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Tidak dapat terhubung ke server');
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
                        <View className="rounded-xl mb-4 bg-gray-600 shadow-xl overflow-hidden">
                            {Platform.OS === 'ios' ? (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="inline"
                                    onChange={handleDateChange}
                                />
                            ) : (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>
                    </View>

                    {/* Time Picker */}
                    <Text className="text-lg text-gray-700 mb-2">Waktu Mulai Tanam:</Text>
                    <View className="rounded-xl mb-4 shadow-xl overflow-hidden">
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="inline"
                                onChange={handleTimeChange}
                            />
                        ) : (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange}
                            />
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