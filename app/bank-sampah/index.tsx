import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { Modal, Portal, Menu, Provider } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { locations } from "@/data/locations";
import { useRouter } from "expo-router";

interface Location {
  id: string;
  name: string;
  address: string;
  image: any;
  rating: number;
  distance?: number;
}

const BankSampah = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [jenisSampah, setJenisSampah] = useState("Pilih Jenis Sampah");
  const [alamat, setAlamat] = useState("");
  const [beratSampah, setBeratSampah] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [totalPenjualan, setTotalPenjualan] = useState(0);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const pickImages = async (useCamera: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Using MediaTypeOptions
      allowsMultipleSelection: true,
      quality: 1,
    };

    let result;

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin diperlukan', 'Izin kamera diperlukan untuk mengambil foto');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setSelectedImages(prev => [...prev, ...selected].slice(0, 3));
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prevImages) => prevImages.filter((image) => image !== uri));
  };

  const handleSell = () => {
    if (!alamat || !beratSampah || jenisSampah === "Pilih Jenis Sampah") {
      Alert.alert("Error", "Harap lengkapi semua data sebelum menjual!");
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert("Error", "Harap tambahkan foto sampah!");
      return;
    }

    Alert.alert(
      "Konfirmasi Penjualan",
      `Apakah Anda yakin ingin menjual ${beratSampah}Kg sampah ${jenisSampah}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: () => {
            setTotalPenjualan((prevTotal) => prevTotal + parseFloat(beratSampah));
            resetForm();
            const message = `Halo, saya ingin menjual sampah:\n\n• Jenis: ${jenisSampah}\n• Berat: ${beratSampah} kg\n• Alamat: ${alamat}\n\nTerima kasih.`;
            const waUrl = `https://wa.me/6281339684249?text=${encodeURIComponent(message)}`;
            Linking.openURL(waUrl).catch((err) =>
              console.error("Gagal membuka WhatsApp:", err)
            );
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setAlamat("");
    setBeratSampah("");
    setJenisSampah("Pilih Jenis Sampah");
    setSelectedImages([]);
    setModalVisible(false);
  };

  return (
    <Provider>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Ionicons name="leaf" size={24} color="#10b981" />
            <View className="items-center">
              <Text className="text-gray-500 font-medium">Total Penjualan</Text>
              <Text className="text-gray-800 text-xl font-bold mt-1">
                {totalPenjualan} kg
              </Text>
            </View>
            <Ionicons name="stats-chart" size={24} color="#10b981" />
          </View>
        </View>

        {/* List Lokasi Bank Sampah */}
        <FlatList<Location>
          data={locations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }}
          ListHeaderComponent={
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Lokasi Bank Sampah Terdekat
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row bg-white rounded-xl p-4 mb-3 shadow-sm items-center"
              activeOpacity={0.8}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${item.address}`)}
            >
              <Image
                source={item.image}
                className="w-16 h-16 rounded-lg mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">
                  {item.name}
                </Text>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                  {item.address}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="flex-row items-center mr-3">
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text className="text-gray-700 text-xs ml-1">
                      {item.rating.toFixed(1)}
                    </Text>
                  </View>
                  {item.distance && (
                    <View className="bg-gray-100 rounded-full px-2 py-1">
                      <Text className="text-gray-600 text-xs">
                        {item.distance} km
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-emerald-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>

        {/* Modal Form - Fixed with wrapper View */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: "white",
              marginHorizontal: 20,
              borderRadius: 12,
              padding: 0,
            }}
          >
            <View style={{ overflow: 'hidden', borderRadius: 12 }}>
              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
                {/* Modal Header */}
                <View className="px-5 pt-5 pb-3 border-b border-gray-100 flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-gray-800">
                    Form Penjualan Sampah
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="p-1"
                  >
                    <Ionicons name="close" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View className="p-5">
                  {/* Alamat */}
                  <View className="mb-5">
                    <Text className="text-gray-700 font-medium mb-2">
                      Alamat Lengkap
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#10b981"
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        placeholder="Contoh: Jl. Merdeka No. 10, RT 01/RW 02"
                        placeholderTextColor="#9ca3af"
                        value={alamat}
                        onChangeText={setAlamat}
                        className="flex-1 text-gray-700"
                        multiline
                      />
                    </View>
                  </View>

                  {/* Berat Sampah */}
                  <View className="mb-5">
                    <Text className="text-gray-700 font-medium mb-2">
                      Berat Sampah (kg)
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <Ionicons
                        name="scale-outline"
                        size={18}
                        color="#10b981"
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        placeholder="Contoh: 2.5"
                        placeholderTextColor="#9ca3af"
                        value={beratSampah}
                        onChangeText={setBeratSampah}
                        keyboardType="numeric"
                        className="flex-1 text-gray-700"
                      />
                    </View>
                  </View>

                  {/* Jenis Sampah */}
                  <View className="mb-5">
                    <Text className="text-gray-700 font-medium mb-2">
                      Jenis Sampah
                    </Text>
                    <Menu
                      visible={menuVisible}
                      onDismiss={closeMenu}
                      anchor={
                        <TouchableOpacity
                          onPress={openMenu}
                          className="flex-row items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                          activeOpacity={0.8}
                        >
                          <Text
                            className={
                              jenisSampah === "Pilih Jenis Sampah"
                                ? "text-gray-400"
                                : "text-gray-700 font-medium" // Added font-medium for better visibility
                            }
                          >
                            {jenisSampah}
                          </Text>
                          <Ionicons
                            name="chevron-down-outline"
                            size={18}
                            color="#10b981"
                          />
                        </TouchableOpacity>
                      }
                      contentStyle={{
                        backgroundColor: 'white', // Ensure white background
                        borderRadius: 8,
                        marginTop: 8, // Add some spacing
                      }}
                    >
                      <Menu.Item
                        onPress={() => {
                          setJenisSampah("Plastik");
                          closeMenu();
                        }}
                        title="Plastik"
                        titleStyle={{
                          color: "#1f2937",
                          fontSize: 14, // Consistent font size
                        }}
                        style={{ backgroundColor: 'white' }} // Explicit background
                      />
                      <Menu.Item
                        onPress={() => {
                          setJenisSampah("Botol");
                          closeMenu();
                        }}
                        title="Botol"
                        titleStyle={{
                          color: "#1f2937",
                          fontSize: 14,
                        }}
                        style={{ backgroundColor: 'white' }}
                      />
                      <Menu.Item
                        onPress={() => {
                          setJenisSampah("Kertas");
                          closeMenu();
                        }}
                        title="Kertas"
                        titleStyle={{
                          color: "#1f2937",
                          fontSize: 14,
                        }}
                        style={{ backgroundColor: 'white' }}
                      />
                    </Menu>
                  </View>

                  {/* Foto Sampah */}
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-700 font-medium">Foto Sampah</Text>
                      <Text className="text-gray-400 text-xs">
                        {selectedImages.length}/3 foto
                      </Text>
                    </View>

                    <View className="flex-row space-x-3 mb-3">
                      <TouchableOpacity
                        onPress={() => pickImages(true)}
                        className="flex-1 items-center justify-center bg-gray-50 rounded-lg py-3 border border-gray-200"
                        activeOpacity={0.8}
                        disabled={selectedImages.length >= 3}
                      >
                        <Ionicons
                          name="camera-outline"
                          size={20}
                          color="#10b981"
                        />
                        <Text className="text-gray-500 mt-1 text-xs">Kamera</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => pickImages(false)}
                        className="flex-1 items-center justify-center bg-gray-50 rounded-lg py-3 border border-gray-200"
                        activeOpacity={0.8}
                        disabled={selectedImages.length >= 3}
                      >
                        <Ionicons
                          name="image-outline"
                          size={20}
                          color="#10b981"
                        />
                        <Text className="text-gray-500 mt-1 text-xs">Galeri</Text>
                      </TouchableOpacity>
                    </View>

                    {selectedImages.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mt-3"
                      >
                        <View className="flex-row space-x-3">
                          {selectedImages.map((uri) => (
                            <View key={uri} className="relative">
                              <Image
                                source={{ uri }}
                                className="w-20 h-20 rounded-lg"
                              />
                              <TouchableOpacity
                                onPress={() => removeImage(uri)}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                              >
                                <Ionicons name="close" size={14} color="white" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    )}
                  </View>

                  {/* Tombol Submit */}
                  <TouchableOpacity
                    onPress={handleSell}
                    className="bg-emerald-500 rounded-lg py-3 items-center justify-center mt-2"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold">Konfirmasi Penjualan</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

export default BankSampah;