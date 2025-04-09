import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { Menu, Provider as PaperProvider } from "react-native-paper";
import * as FileSystem from 'expo-file-system';

interface ProfileData {
  username: string;
  phone_number: string;
  email: string;
  banjar: string;
  profile_picture: string | null;
  biopori_count: number;
}

const ProfileScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    phone_number: "",
    email: "",
    banjar: "",
    profile_picture: null,
    biopori_count: 0
  });
  const [newBanjar, setNewBanjar] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          Alert.alert("Error", "Anda belum login.");
          router.push("/auth/login");
          return;
        }

        const response = await fetch("https://sms-backend-desa-peliatan.vercel.app/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal mengambil data profil");
        }

        setProfile(result.data);
        setNewBanjar(result.data.banjar);
      } catch (error) {
        console.error("Fetch error:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data";
        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle image picking
  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin diperlukan', 'Kami membutuhkan akses ke galeri untuk mengubah foto profil');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewProfileImage(result.assets[0].uri);
    }
  };

  // Handle save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "Sesi telah berakhir, silakan login kembali");
        router.push("/auth/login");
        return;
      }

      const formData = new FormData();

      if (newBanjar !== profile.banjar) {
        formData.append('banjar', newBanjar);
      }

      if (newProfileImage) {
        const fileInfo = await FileSystem.getInfoAsync(newProfileImage);
        if (fileInfo.exists) {
          const fileType = fileInfo.uri.split('.').pop();
          formData.append('profile_picture', {
            uri: newProfileImage,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }
      }

      const response = await fetch("https://sms-backend-desa-peliatan.vercel.app/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Sukses", "Profil berhasil diperbarui");
        setProfile(prev => ({
          ...prev,
          banjar: newBanjar,
          profile_picture: result.data.profile_picture || prev.profile_picture
        }));
        setNewProfileImage(null);
      } else {
        throw new Error(result.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan perubahan";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const hasUnsavedChanges = newBanjar !== profile.banjar || newProfileImage !== null;
    
    if (hasUnsavedChanges) {
      Alert.alert(
        "Perubahan Belum Disimpan",
        "Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Keluar",
            onPress: async () => {
              await SecureStore.deleteItemAsync("token");
              router.push("/auth/login");
            },
          },
        ]
      );
    } else {
      await SecureStore.deleteItemAsync("token");
      router.push("/auth/login");
    }
  };

  const hasChanges = newBanjar !== profile.banjar || newProfileImage !== null;

  return (
    <PaperProvider>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 bg-white shadow-sm">
          <TouchableOpacity onPress={handleImagePick} className="relative">
            <Image
              source={{
                uri: newProfileImage || profile.profile_picture || "https://www.gravatar.com/avatar/default?s=200",
              }}
              className="w-32 h-32 rounded-full border-4 border-emerald-100"
            />
            <View className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full">
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="mt-4 text-2xl font-bold text-gray-800">
            {isLoading ? "Loading..." : profile.username}
          </Text>
          <Text className="text-gray-500">
            {profile.banjar || "Belum memilih banjar"}
          </Text>
        </View>

        {/* Save Button */}
        {hasChanges && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className={`mx-4 mt-4 p-3 rounded-lg flex-row justify-center items-center ${
              isSaving ? 'bg-emerald-300' : 'bg-emerald-500'
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : (
              <Ionicons name="save" size={20} color="white" className="mr-2" />
            )}
            <Text className="text-white font-medium">Simpan Perubahan</Text>
          </TouchableOpacity>
        )}

        {/* Profile Details */}
        <View className="mt-6 mx-4 bg-white rounded-xl p-6 shadow-sm">
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500">Informasi Akun</Text>
            <View className="mt-4 space-y-5">
              <View className="flex-row items-center">
                <Ionicons name="person" size={20} color="#10b981" className="mr-3" />
                <View>
                  <Text className="text-xs text-gray-400">Username</Text>
                  <Text className="text-base font-medium">{profile.username || "-"}</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color="#10b981" className="mr-3" />
                <View>
                  <Text className="text-xs text-gray-400">Nomor Telepon</Text>
                  <Text className="text-base font-medium">{profile.phone_number || "-"}</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#10b981" className="mr-3" />
                <View>
                  <Text className="text-xs text-gray-400">Email</Text>
                  <Text className="text-base font-medium">{profile.email || "-"}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-6">
            <Text className="text-sm font-medium text-gray-500">Statistik</Text>
            <View className="mt-4 flex-row justify-between items-center bg-emerald-50 rounded-lg p-4">
              <View className="flex-row items-center">
                <Ionicons name="leaf" size={24} color="#10b981" className="mr-3" />
                <View>
                  <Text className="text-xs text-gray-500">Biopori Ditanam</Text>
                  <Text className="text-xl font-bold text-gray-800">{profile.biopori_count}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </View>
        </View>

        {/* Banjar Selection */}
        <View className="mt-4 mx-4 bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-sm font-medium text-gray-500">Banjar</Text>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setVisible(true)}
                className="mt-3 flex-row items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                activeOpacity={0.8}
              >
                <Text className={newBanjar ? "text-gray-700" : "text-gray-400"}>
                  {newBanjar || "Pilih Banjar"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Menu.Item
              onPress={() => {
                setNewBanjar("Banjar A");
                setVisible(false);
              }}
              title="Banjar A"
              titleStyle={{ color: "#1f2937", fontSize: 14 }}
            />
            <Menu.Item
              onPress={() => {
                setNewBanjar("Banjar B");
                setVisible(false);
              }}
              title="Banjar B"
              titleStyle={{ color: "#1f2937", fontSize: 14 }}
            />
            <Menu.Item
              onPress={() => {
                setNewBanjar("Banjar C");
                setVisible(false);
              }}
              title="Banjar C"
              titleStyle={{ color: "#1f2937", fontSize: 14 }}
            />
          </Menu>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 mx-4 mb-10 flex-row items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="ml-2 text-red-500 font-medium">Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </PaperProvider>
  );
};

export default ProfileScreen;