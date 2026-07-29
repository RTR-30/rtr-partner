import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { showError } from "../ToastMessage";

interface Props {
    onImageSelect: (image: any) => void;
    primaryColor: string;
}

const CustomImagePicker = ({ onImageSelect, primaryColor }: Props) => {

    const openCamera = () => {
        ImageCropPicker.openCamera({
            width: 500,
            height: 500,
            cropping: true,
        })
            .then((image) => {
                onImageSelect(image);
            })
            .catch((err) => {
                showError("Camera Error");
            });
    };

    const openGallery = () => {
        ImageCropPicker.openPicker({
            width: 500,
            height: 500,
            cropping: true,
        })
            .then((image) => {
                onImageSelect(image);
            })
            .catch((err) => {
                showError("Gallery Error");
            });
    };

    return (
        <View className="mt-5 flex-row justify-around w-full">
            <TouchableOpacity
                className="p-2 rounded-xl"
                style={{ backgroundColor: primaryColor }}
                onPress={openCamera}
            >
                <Text className="text-white text-[13px] font-bold">
                    Choose From Camera
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="p-2 rounded-xl"
                style={{ backgroundColor: primaryColor }}
                onPress={openGallery}
            >
                <Text className="text-white text-[13px] font-bold">
                    Choose From Gallery
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CustomImagePicker;