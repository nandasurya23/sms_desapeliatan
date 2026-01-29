import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import YoutubeIframe from 'react-native-youtube-iframe';
import { MaterialIcons } from '@expo/vector-icons';

const index = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-6 bg-white shadow-sm">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">Edukasi & Tips</Text>
            <Text className="text-lg text-gray-500 mt-1">Daur Ulang & Lingkungan</Text>
          </View>
          <TouchableOpacity className="ml-4">
            <MaterialIcons name="search" size={28} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-5 mt-3">
          {/* Featured Article */}
          <Text className="text-lg font-semibold text-gray-700 mb-3">Artikel Terbaru</Text>
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <Image
              source={require("../../assets/images/edukasi.png")}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="p-5">
              <View className="flex-row items-center mb-3">
                <Text className="bg-green-500 py-1 px-3 text-white rounded-full text-sm font-medium">Edukasi</Text>
                <Text className="text-gray-500 text-sm ml-3">4 hari yang lalu</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-3">Dari Sampah ke Barang Bernilai</Text>
              <Text className="text-gray-600 mb-4">Proses daur ulang kertas, plastik, dan logam menjadi produk baru yang bermanfaat.</Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-green-600 font-medium">Baca Selengkapnya</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#059669" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Video Section */}
          <Text className="text-lg font-semibold text-gray-700 mb-3">Video Edukasi</Text>
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <YoutubeIframe
              height={200}
              play={false}
              videoId={"Dn7AROdyVKo"}
              webViewStyle={{ borderRadius: 12 }}
            />
            <View className="p-5">
              <View className="flex-row items-center mb-3">
                <Text className="bg-blue-500 py-1 px-3 text-white rounded-full text-sm font-medium">Video</Text>
                <Text className="text-gray-500 text-sm ml-3">1 hari yang lalu</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-3">Cara Membuat Lubang Biopori</Text>
              <Text className="text-gray-600 mb-4">Tutorial lengkap membuat biopori untuk resapan air di lingkungan rumah.</Text>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="flex-row items-center">
                  <MaterialIcons name="thumb-up" size={18} color="#4B5563" />
                  <Text className="text-gray-600 ml-1">125 Suka</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center">
                  <MaterialIcons name="share" size={18} color="#4B5563" />
                  <Text className="text-gray-600 ml-1">Bagikan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <Text className="text-lg font-semibold text-gray-700 mb-3">Tips Cepat</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              { icon: 'recycling' as 'recycling', title: 'Pilah Sampah', color: 'bg-purple-100' },
              { icon: 'shopping-bag' as 'shopping-bag', title: 'Bawa Tas Belanja', color: 'bg-amber-100' },
              { icon: 'water-drop' as 'water-drop', title: 'Hemat Air', color: 'bg-blue-100' },
              { icon: 'energy-savings-leaf' as 'energy-savings-leaf', title: 'Kompos Organik', color: 'bg-green-100' },
            ].map((item, index) => (
              <TouchableOpacity 
                key={index} 
                className={`w-[48%] ${item.color} rounded-xl p-4 mb-4`}
              >
                <View className="flex-row items-center">
                  <MaterialIcons name={item.icon} size={24} color="#374151" />
                  <Text className="text-gray-800 font-medium ml-2">{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default index