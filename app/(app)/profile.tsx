import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { API_URL, BACKEND_BASE_URL } from "@/config";

interface ProfileData {
  username: string;
  phone_number: string;
  email: string;
  banjar: string | null;
  profile_picture: string | null;
  biopori_count: number;
}

interface SelectedProfileImage {
  uri: string;
  name: string;
  type: string;
}

const resolveBackendAssetUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const getMimeTypeFromFileName = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "application/octet-stream";
  }
};

const ProfileScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    phone_number: "",
    email: "",
    banjar: null,
    profile_picture: null,
    biopori_count: 0
  });
  const [newBanjar, setNewBanjar] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<SelectedProfileImage | null>(null);
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
          router.push("/(auth)/login");
          return;
        }

        const response = await fetch(`${API_URL}/profile`, {
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

        const profileData = result.data || result;
        setProfile(profileData);
        setNewBanjar(profileData.banjar || "");
      } catch (error: unknown) {
        console.error("Fetch error:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil data";
        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin diperlukan', 'Kami membutuhkan akses ke galeri untuk mengubah foto profil');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.fileName || asset.uri.split("/").pop() || "profile.jpg";
      const fileType = asset.mimeType || getMimeTypeFromFileName(fileName);
      setNewProfileImage({
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const trimmedBanjar = (newBanjar || "").trim();
      const currentBanjar = (profile.banjar || "").trim();
      const hasBanjarChange = trimmedBanjar.length > 0 && trimmedBanjar !== currentBanjar;
      const hasImageChange = !!newProfileImage;

      if (!hasBanjarChange && !hasImageChange) {
        Alert.alert("Info", "Tidak ada perubahan untuk disimpan");
        return;
      }

      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        Alert.alert("Error", "Sesi telah berakhir, silakan login kembali");
        router.push("/(auth)/login");
        return;
      }

      console.log("[profile] save request", {
        hasBanjarChange,
        hasImageChange,
        trimmedBanjar,
        currentBanjar,
        profilePicturePath: profile.profile_picture,
        imageMeta: newProfileImage,
      });

      const submitProfileUpdate = async (
        fields: { banjar?: string; profile_picture?: SelectedProfileImage },
        options?: { allowFailure?: boolean }
      ) => {
        const formData = new FormData();
        if (typeof fields.banjar === "string" && fields.banjar.length > 0) {
          formData.append("banjar", fields.banjar);
        }
        if (fields.profile_picture) {
          formData.append("profile_picture", {
            uri: fields.profile_picture.uri,
            name: fields.profile_picture.name,
            type: fields.profile_picture.type || getMimeTypeFromFileName(fields.profile_picture.name),
          } as any);
        }

        const response = await fetch(`${API_URL}/profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const rawResponse = await response.text();
        let result: { data?: ProfileData; error?: string } = {};
        if (rawResponse) {
          try {
            result = JSON.parse(rawResponse);
          } catch {
            result = { error: rawResponse };
          }
        }

        console.log("[profile] save response", {
          status: response.status,
          ok: response.ok,
          rawResponse,
          parsedError: result.error,
          sentFields: Object.keys(fields),
        });

        if (!response.ok) {
          if (options?.allowFailure) {
            return null;
          }
          throw new Error(result.error || "Gagal memperbarui profil");
        }

        return result.data;
      };

      let latestProfileData: ProfileData | null | undefined;
      if (hasBanjarChange) {
        latestProfileData = await submitProfileUpdate({
          banjar: trimmedBanjar,
        });
      }

      if (hasImageChange && newProfileImage) {
        const photoResult = await submitProfileUpdate(
          {
            banjar: hasBanjarChange ? trimmedBanjar : undefined,
            profile_picture: newProfileImage,
          },
          { allowFailure: true }
        );

        if (photoResult?.profile_picture) {
          latestProfileData = photoResult;
        } else if (!hasBanjarChange) {
          Alert.alert(
            "Peringatan",
            "Banjar tidak berubah, tetapi upload foto profil masih gagal di backend. Perubahan foto belum tersimpan."
          );
        }
      }

      Alert.alert("Sukses", "Profil berhasil diperbarui");
      setProfile(prev => ({
        ...prev,
        banjar: hasBanjarChange ? trimmedBanjar : prev.banjar,
        profile_picture: latestProfileData?.profile_picture || prev.profile_picture,
      }));
      if (!hasImageChange || latestProfileData?.profile_picture) {
        setNewProfileImage(null);
      }
    } catch (error: unknown) {
      console.error("Save error:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan perubahan";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const hasUnsavedChanges = (newBanjar || "").trim() !== (profile.banjar || "").trim() || newProfileImage !== null;

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
              router.push("/(auth)/login");
            },
          },
        ]
      );
    } else {
      await SecureStore.deleteItemAsync("token");
      router.push("/(auth)/login");
    }
  };

  const hasChanges = (newBanjar || "").trim() !== (profile.banjar || "").trim() || newProfileImage !== null;

  return (
    <PaperProvider>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 bg-white shadow-sm">
          <TouchableOpacity onPress={handleImagePick} className="relative">
            <Image
              source={{
                uri: newProfileImage?.uri || resolveBackendAssetUrl(profile.profile_picture) || "https://www.gravatar.com/avatar/default?s=200",
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
            className={`mx-4 mt-4 p-3 rounded-lg flex-row justify-center items-center ${isSaving ? 'bg-emerald-300' : 'bg-emerald-500'
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

        {/* Banjar Input */}
        <View className="mt-4 mx-4 bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-sm font-medium text-gray-500">Banjar</Text>
          <TextInput
            value={newBanjar}
            onChangeText={setNewBanjar}
            placeholder="Masukkan banjar"
            placeholderTextColor="#9ca3af"
            className="mt-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-gray-700"
          />
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
