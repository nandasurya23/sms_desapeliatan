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
import { Modal, Portal, Button, Menu, Provider } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { locations } from "@/data/locations";
import { useRouter } from "expo-router";

const BankSampah = () => {
  const [modalVisible, setModalVisible] = useState(false); // Modal
  const [menuVisible, setMenuVisible] = useState(false); // Dropdown
  const [jenisSampah, setJenisSampah] = useState("Pilih Jenis Sampah"); // Jenis Sampah
  const [alamat, setAlamat] = useState(""); // Alamat
  const [beratSampah, setBeratSampah] = useState(""); // Berat Sampah
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // Gambar
  const [totalPenjualan, setTotalPenjualan] = useState(0); 
  const router = useRouter();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);
      setSelectedImages(selected);
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

    Alert.alert(
      "Konfirmasi Penjualan",
      `Apakah Anda yakin ingin menjual ${beratSampah}Kg sampah ${jenisSampah}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: () => {
            // Update total penjualan
            setTotalPenjualan((prevTotal) => prevTotal + parseFloat(beratSampah));

            // Reset form
            setAlamat("");
            setBeratSampah("");
            setJenisSampah("Pilih Jenis Sampah");
            setSelectedImages([]);

            // Format pesan WhatsApp yang lebih rapi
            const message = `Saya ingin menjual ${beratSampah} Kg sampah ${jenisSampah} dengan alamat ${alamat}`;

            // Encode message untuk memastikan karakter-karakter khusus diubah menjadi format URL yang benar
            const waUrl = `https://wa.me/6281339684249?text=${encodeURIComponent(message)}`;
            Linking.openURL(waUrl).catch((err) => console.error("Failed to open WhatsApp:", err));
          },
        },
      ]
    );
  };

  return (
    <Provider>
      <View className="flex-1 bg-gray-200">
        {/* Header */}
        <View className="bg-white p-4 flex-row items-center justify-between">
          <Ionicons name="stats-chart" size={24} color="#3DA656" />
          <View>
            <Text className="text-xl font-bold">Total Penjualan</Text>
            <Text className="text-lg text-gray-600">{totalPenjualan} kg Sampah</Text>
          </View>
          <Ionicons name="leaf-outline" size={24} color="#3DA656" />
        </View>

        {/* List Lokasi Bank Sampah */}
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View className="flex-row bg-white rounded-lg shadow p-4 mb-4">
              {/* Gambar */}
              <Image
                source={item.image}
                className="w-20 h-20 rounded-lg mr-4"
                resizeMode="cover"
              />
              {/* Detail */}
              <View className="flex-1">
                <Text className="text-lg font-bold">{item.name}</Text>
                <Text className="text-gray-600">{item.address}</Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text className="ml-1 text-gray-700">{item.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="#3DA656" />
            </View>
          )}
        />

        {/* Tombol Jual Sampah */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-4 right-4 bg-green-600 p-4 rounded-full"
        >
          <Ionicons name="cart-outline" size={30} color="white" />
        </TouchableOpacity>

        {/* Modal Form */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: "#ddd",
              padding: 20,
              marginHorizontal: 20,
              borderRadius: 10,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Form Penjualan Sampah</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Alamat */}
              <View className="mb-4">
                <Text className="text-xl font-bold mb-1">Alamat</Text>
                <View className="flex-row items-center bg-white rounded-xl px-4 py-3">
                  <Ionicons name="home-outline" size={20} color="#3DA656" />
                  <TextInput
                    placeholder="Masukkan alamat Anda"
                    value={alamat}
                    onChangeText={setAlamat}
                    className="flex-1 ml-2"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              {/* Berat Sampah */}
              <View className="mb-4">
                <Text className="text-xl font-bold mb-1">Berat Sampah (Kg)</Text>
                <View className="flex-row items-center bg-white rounded-xl px-4 py-3">
                  <Ionicons name="scale-outline" size={20} color="#3DA656" />
                  <TextInput
                    placeholder="Masukkan berat sampah"
                    value={beratSampah}
                    onChangeText={setBeratSampah}
                    keyboardType="numeric"
                    className="flex-1 ml-2"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              {/* Dropdown Jenis Sampah */}
              <View className="mb-4">
                <Text className="text-xl font-bold mb-1">Jenis Sampah</Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={closeMenu}
                  anchor={
                    <TouchableOpacity
                      onPress={openMenu}
                      className="flex-row items-center bg-white rounded-xl px-4 py-3"
                    >
                      <Text className="flex-1 ml-2">{jenisSampah}</Text>
                      <Ionicons name="chevron-down" size={20} color="#3DA656" />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setJenisSampah("Plastik");
                      closeMenu();
                    }}
                    title="Plastik"
                  />
                  <Menu.Item
                    onPress={() => {
                      setJenisSampah("Botol");
                      closeMenu();
                    }}
                    title="Botol"
                  />
                  <Menu.Item
                    onPress={() => {
                      setJenisSampah("Kertas");
                      closeMenu();
                    }}
                    title="Kertas"
                  />
                </Menu>
              </View>

              {/* Pilih Gambar */}
              <View className="mb-4">
                <Text className="text-xl font-bold mb-1">Foto Sampah</Text>
                <Button
                  mode="outlined"
                  onPress={pickImages}
                  className="flex-row items-center"
                  icon="image-multiple"
                >
                  Pilih Gambar
                </Button>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                  {selectedImages.map((uri) => (
                    <View key={uri} className="relative mr-4">
                      <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                      <TouchableOpacity
                        onPress={() => removeImage(uri)}
                        className="absolute top-0 right-0 bg-red-500 rounded-full p-1"
                      >
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Tombol Konfirmasi Penjualan */}
              <Button mode="contained" onPress={handleSell}>
                Konfirmasi Penjualan
              </Button>
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </Provider>

  );
};

export default BankSampah;
