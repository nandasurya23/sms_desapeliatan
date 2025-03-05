import { View, Text, SafeAreaView, ScrollView, Image } from 'react-native'
import React from 'react'
import YoutubeIframe from 'react-native-youtube-iframe';


const index = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="flex-row justify-between items-center px-4 py-8 bg-white">
          <View className="flex-1 ml-4">
            <Text className="text-xl font-bold">Edukasi & Tips Daur Ulang</Text>
          </View>
        </View>
        <View className="px-4 mt-4">
          <View className="bg-white rounded-xl shadow-md p-4 w-full">
            <Image
              source={require("../../assets/images/edukasi.png")}
              className="w-full h-44 rounded-xl mb-5"
              resizeMode="cover"
            />
            <View>
              <Text className="bg-gradientEnd py-2 px-2 w-1/3 text-white rounded-full text-center text-lg mb-4">Edukasi</Text>
              <Text className="text-xl font-medium mb-4">Dari Sampah ke Barang Bernilai - Proses Daur Ulang Kertas, Plastik, dan Logam</Text>
              <Text className="text-lg font-normal">4 hari yang lalu</Text>
            </View>
          </View>

          <View className="bg-white rounded-xl shadow-md p-4 w-full mt-10">
            <YoutubeIframe
              height={200} 
              play={true} 
              videoId={"Dn7AROdyVKo"} 
              onChangeState={(event) => console.log(event)} // Event listener untuk status video
            />
            <View>
              <Text className="bg-gradientEnd py-2 px-2 w-1/3 text-white rounded-full text-center text-lg mb-4">Edukasi</Text>
              <Text className="text-xl font-medium mb-4">Cara membuat lubang biopori</Text>
              <Text className="text-lg font-normal">1 hari yang lalu</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default index