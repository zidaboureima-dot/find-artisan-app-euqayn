import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleBottomSheet from '../components/BottomSheet';


export default function MainScreen() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const handleOpenBottomSheet = () => {
    setIsBottomSheetVisible(true);
  };

  return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          <Image
            source={require('../assets/images/final_quest_240x240.png')}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
          <Text style={commonStyles.title}>This is a placeholder app.</Text>
          <Text style={commonStyles.text}>Your app will be displayed here when it's ready.</Text>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 30,
            }}
            onPress={handleOpenBottomSheet}
          >
            <Text style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
            }}>
              Open Bottom Sheet
            </Text>
          </TouchableOpacity>
        </View>

        <SimpleBottomSheet
          isVisible={isBottomSheetVisible}
          onClose={() => setIsBottomSheetVisible(false)}
        />
      </SafeAreaView>
  );
}
