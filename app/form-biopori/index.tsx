import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
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
        setPhoto(uri); // Use setPhoto to store the image URI
        setImageUri(uri); // Store imageUri if needed for submission
      }
    } else {
      alert("Permission untuk akses galeri tidak diberikan");
    }
  };

  // DateTimePicker handler
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date(); // Default to current date if undefined
    setDate(currentDate);
    // Calculate End Date by adding 60 days
    const calculatedEndDate = addDays(currentDate, 60);
    setEndDate(calculatedEndDate);
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || new Date(); // Default to current time if undefined
    setTime(currentTime);
    // Set end time to the same as start time
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
          Authorization: `Bearer ${token}`, // Replace with actual token
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
        router.push('/biopori'); // Redirect after success (adjust path as needed)
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
    <SafeAreaView className="flex-1 p-6 bg-gray-200">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text className="text-3xl font-bold text-center mb-8 text-gray-800">Add Biopori</Text>

        {/* Image Picker */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="mb-4">
            {photo ? (
              <Image source={{ uri: photo }} className="w-36 h-36 rounded-xl" />
            ) : (
              <Ionicons name="camera" size={50} color="gray" />
            )}
          </TouchableOpacity>
          <Text className="text-sm text-gray-500">Select Image</Text>
        </View>

        {/* Name Input */}
        <TextInput
          className="h-12 border border-gray-300 rounded-lg px-4 mb-6 bg-white"
          placeholder="Biopori Name"
          value={name}
          onChangeText={setName}
        />

        {/* Date Picker */}
        <Text className="text-sm text-gray-700 mb-2">Date:</Text>
        <View className="bg-white border border-gray-300 rounded-lg mb-4">
          <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
        </View>

        {/* Start Time Picker */}
        <Text className="text-sm text-gray-700 mb-2 mt-4">Start Time:</Text>
        <View className="bg-white border border-gray-300 rounded-lg mb-4">
          <DateTimePicker value={time} mode="time" display="default" onChange={handleTimeChange} />
        </View>

        {/* End Date (Non-Editable) */}
        <Text className="text-sm text-gray-700 mb-2 mt-4">End Date:</Text>
        <View className="bg-white border border-gray-300 rounded-lg mb-4 p-4">
          <Text className="text-gray-500">{format(endDate, 'yyyy-MM-dd')}</Text>
        </View>

        {/* End Time (Non-Editable) */}
        <Text className="text-sm text-gray-700 mb-2 mt-4">End Time:</Text>
        <View className="bg-white border border-gray-300 rounded-lg mb-6 p-4">
          <Text className="text-gray-500">{format(endTime, 'HH:mm')}</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={onSubmit} className="bg-blue-500 p-4 rounded-lg mt-8">
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-center">Add Biopori</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddBioporiForm;
