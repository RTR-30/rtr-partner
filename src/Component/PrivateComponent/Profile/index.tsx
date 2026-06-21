import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView
} from "react-native"
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomImagePicker from "../../../Common/ImagePicker";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { updateUserService } from "./helper";


const NoImg = require("../../../../assets/Imgs/EtyImg.png");

const Profile = () => {
    const value = "My Profile"
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<any>(null);
    const [profile, setProfile] = useState<any>({
        name: '',
        email: '',
        phno: '',
        address: '',
        img: ''
    });
    const [edit, setEdit] = useState<boolean>(false);

    const handleUpdate = async () => {
        setLoading(true)

        const payload = {
            name: profile?.name,
            email: profile?.email,
            mobileno: profile?.phno,
            profilepic: profile?.img,
            address: profile?.address,
        }

        try {
            const res = await updateUserService(payload, token)
            const { data: { status = 0, message = "", user = {} } } = res

            if(status === 200){
                await AsyncStorage.setItem("UserData", JSON.stringify(user));
                closeEdit();
                showSuccess(message)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const openEdit = () => {
        setEdit(true)
    }

    const closeEdit = () => {
        setEdit(false)
    }

    const getUserData = async () => {
        const user = await AsyncStorage.getItem("UserData");
        const token: any = await AsyncStorage.getItem("token")

        if (user) {
            const parseData = JSON.parse(user)
            
            setProfile({
                name: parseData?.name,
                email: parseData?.email,
                phno: parseData?.mobileno,
                address: parseData?.address,
                img: parseData?.profilepic
            });
            setToken(token)
        }
    }

    useEffect(() => {
        if(profile.img !== ''){
            handleUpdate()
        }
    },[profile.img])

    useEffect(() => {
        getUserData();
    }, []);
    return (
        <View className="flex-1">
            <View className="flex-1" style={{ backgroundColor: COLORS.primary }}>
                <Header value={value} backNavigate={true} edit={true} clickEdit={openEdit} />
            </View>

            <View className="bg-[#cccccc] w-full h-full" style={{ flex: 9 }}>
                <View className="p-10 rounded-b-3xl" style={{ backgroundColor: COLORS.primary }}>
                    <View className="absolute bg-white p-2 self-center items-center w-[100%] rounded-2xl mt-4 h-60">
                        <View className="w-36 h-36 justify-center items-center mt-2" style={{ borderColor: COLORS.primary, borderWidth: 3, borderRadius: 20 }}>
                            <Image
                                source={
                                    profile.img
                                        ? { uri: profile.img }
                                        : NoImg
                                }
                                resizeMode="cover"
                                className="w-full h-full"
                                style={{ borderRadius: 20 }}
                            />
                        </View>

                        <View className="mt-3 flex-row justify-around w-full">
                            <CustomImagePicker
                                primaryColor={COLORS.primary}
                                onImageSelect={(image) => {
                                    setProfile({
                                        ...profile,
                                        img: image.path,
                                    });
                                }}
                            />
                        </View>
                    </View>
                </View>

                <View className="mt-52 px-4">
                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: 200,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Name */}
                        <View className="mb-4">
                            <Text
                                className="text-sm font-semibold mb-2"
                                style={{ color: COLORS.primary }}
                            >
                                Full Name
                            </Text>

                            <View
                                className="bg-white rounded-2xl px-4"
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                    elevation: 2,
                                }}
                            >
                                <TextInput
                                    value={profile.name}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, name: text })
                                    }
                                    placeholder="Enter Full Name"
                                    className="text-base text-black py-4"
                                    readOnly={!edit}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View className="mb-4">
                            <Text
                                className="text-sm font-semibold mb-2"
                                style={{ color: COLORS.primary }}
                            >
                                Email Address
                            </Text>

                            <View
                                className="bg-white rounded-2xl px-4"
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                    elevation: 2,
                                }}
                            >
                                <TextInput
                                    value={profile.email}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, email: text })
                                    }
                                    keyboardType="email-address"
                                    placeholder="Enter Email Address"
                                    className="text-base text-black py-4"
                                    readOnly={!edit}
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <View className="mb-4">
                            <Text
                                className="text-sm font-semibold mb-2"
                                style={{ color: COLORS.primary }}
                            >
                                Mobile Number
                            </Text>

                            <View
                                className="bg-white rounded-2xl px-4"
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                    elevation: 2,
                                }}
                            >
                                <TextInput
                                    value={profile.phno}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, phno: text })
                                    }
                                    keyboardType="phone-pad"
                                    placeholder="Enter Mobile Number"
                                    className="text-base text-black py-4"
                                    readOnly={!edit}
                                />
                            </View>
                        </View>

                        {/* Address */}
                        <View className="mb-4">
                            <Text
                                className="text-sm font-semibold mb-2"
                                style={{ color: COLORS.primary }}
                            >
                                Address
                            </Text>

                            <View
                                className="bg-white rounded-2xl px-4"
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                    elevation: 2,
                                }}
                            >
                                <TextInput
                                    value={profile.address}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, address: text })
                                    }
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    placeholder="Enter Address"
                                    className="text-base text-black py-4"
                                    readOnly={!edit}
                                />
                            </View>
                        </View>

                        {/* Update Button */}
                        {edit ?
                            <TouchableOpacity
                                className="rounded-2xl py-4 mt-4"
                                style={{ backgroundColor: COLORS.primary }}
                                onPress={handleUpdate}
                            >
                                <Text className="text-center text-white text-base font-bold">
                                    Update Profile
                                </Text>
                            </TouchableOpacity> : null
                        }

                    </ScrollView>
                </View>
            </View>
        </View>
    )
}

export default Profile;