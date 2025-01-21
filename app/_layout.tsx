import { Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import "../global.css";
import { Slot } from 'expo-router/build/exports';
import BottomNavbar from '@/components/BottomNavbar';

const _layout = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot /> 
      </View>
      <BottomNavbar /> 
    </SafeAreaView>

  )
}

export default _layout
