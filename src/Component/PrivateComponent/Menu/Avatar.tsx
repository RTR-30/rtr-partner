import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultImg: any = {
  img1: require('../../../../assets/Avatar/A1.png'),
  img2: require('../../../../assets/Avatar/A2.png'),
  img3: require('../../../../assets/Avatar/A3.png'),
  img4: require('../../../../assets/Avatar/A4.png'),
  img5: require('../../../../assets/Avatar/A5.png'),
  img6: require('../../../../assets/Avatar/A6.png'),
};

const AvatarPickerModal = ({ openPic, setOpenPic, setProfilePic }: any) => {
  const [selectedKey, setSelectedKey] = useState(null);

  if (!openPic) return null;

  const handleSelect = async (key: any) => {
    setSelectedKey(key);
    setProfilePic({ type: 'default', key }); // Store key instead of image object
    await AsyncStorage.setItem("avatarKey", key); // Optional: persist avatar
    setOpenPic(false);
  };

  return (
    <View className="absolute w-full h-full justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 5 }}>
      <View className="w-[80%] h-[70%] bg-white rounded-[10px] p-4">
        <Text className="text-lg font-bold text-center mb-4 text-black">Choose Avatar</Text>
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.keys(defaultImg).map((key: any, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(key)}
              style={{ margin: 10 }}
              accessibilityLabel={`Select avatar ${index + 1}`}
              accessible={true}
            >
              <Image
                source={defaultImg[key]}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 2,
                  borderColor: selectedKey === key ? 'blue' : 'gray'
                }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={() => setOpenPic(false)} className="mt-4 self-center">
          <Text className="text-red-500 text-base font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { defaultImg };
export default AvatarPickerModal;
