import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { format, addDays } from 'date-fns';

const AddBioporiForm = () => {
    const [imageUri, setImageUri] = useState<string | undefined>();
    const [name, setName] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 60)); // Set default to 60 days from now
    const [endTime, setEndTime] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState<string | undefined>();

    const router = useRouter();

    // Pick an image from the gallery
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
            alert("Permission untuk akses galeri tidak diberikan");
        }
    };

    // Take a photo using the camera
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
            alert("Permission untuk akses kamera tidak diberikan");
        }
    };

    // DateTimePicker handler
    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || new Date();
        setDate(currentDate);
        const calculatedEndDate = addDays(currentDate, 60);
        setEndDate(calculatedEndDate);
    };

    const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
        const currentTime = selectedTime || new Date();
        setTime(currentTime);
        setEndTime(currentTime);
    };

    const onSubmit = async () => {
        if (!name || !photo || !date || !time || !endDate || !endTime) {
            Alert.alert('Error', 'Please fill in all the fields.');
            return;
        }

        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch('https://sms-backend-desa-peliatan.vercel.app/api/biopori', {
                method: 'POST',
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
                Alert.alert('Success', 'Biopori added successfully');
                router.push('/biopori');
            } else {
                Alert.alert('Error', result.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Unable to reach the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-200">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <View className='p-6'>
                    <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Tambah Biopori</Text>

                    {/* Image Picker */}
                    <View className="items-center mb-6">
                        <View className="flex-row justify-center space-x-4">
                            {/* Tombol Kamera */}
                            <TouchableOpacity onPress={takePhoto} className="p-4 bg-blue-500 rounded-full mx-2">
                                <Ionicons name="camera" size={40} color="white" />
                            </TouchableOpacity>

                            {/* Tombol Galeri */}
                            <TouchableOpacity onPress={pickImage} className="p-4 bg-green-500 rounded-full">
                                <Ionicons name="image" size={40} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Tampilkan Gambar yang Dipilih */}
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

                    {/* Start Time Picker */}
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

                    {/* End Date (Non-Editable) */}
                    <Text className="text-lg text-gray-700 mb-2 mt-4">Tanggal Selesai Tanam :</Text>
                    <View className="w-full px-3 py-3 rounded-xl mb-4 text-lg bg-white">
                        <Text className="text-gray-500 text-lg">{format(endDate, 'yyyy-MM-dd')}</Text>
                    </View>

                    {/* End Time (Non-Editable) */}
                    <Text className="text-lg text-gray-700 mb-2 mt-4">Waktu Selesai Tanam:</Text>
                    <View className="w-full px-3 py-3 rounded-xl mb-4 text-lg bg-white">
                        <Text className="text-gray-500 text-lg">{format(endTime, 'HH:mm')}</Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity onPress={onSubmit} className="bg-gradientEnd p-5 rounded-xl mt-8 shadow-md">
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-center text-lg">Simpan</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddBioporiForm;