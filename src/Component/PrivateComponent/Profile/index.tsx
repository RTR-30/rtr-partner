import React, { useEffect, useState } from "react";
import {
    ScrollView,
    TextInput,
    StatusBar,
    Image,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImageCropPicker from "react-native-image-crop-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUserService } from "./helper";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import Header from "../../../Common/Header";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const Profile = () => {
    const navigation: any = useNavigation();
    const value = "My Profile";
    const backNavigate = true;

    const [loading, setLoading] = useState<boolean>(false);
    const [edit, setEdit] = useState<boolean>(false);
    const [photoPickerVisible, setPhotoPickerVisible] = useState<boolean>(false);
    const [imageError, setImageError] = useState<boolean>(false);

    const [profile, setProfile] = useState<any>({
        name: "",
        email: "",
        phno: "",
        address: "",
        img: "",
    });

    const [originalProfile, setOriginalProfile] = useState<any>({
        name: "",
        email: "",
        phno: "",
        address: "",
        img: "",
    });

    const fetchUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("UserData");

            if (storedUserData) {
                const parsedUser = JSON.parse(storedUserData);
                const userState = {
                    name: parsedUser?.name || parsedUser?.Name || "",
                    email: parsedUser?.email || parsedUser?.Email || "",
                    phno: parsedUser?.mobileno || parsedUser?.MobileNo || parsedUser?.phno || "",
                    address: parsedUser?.address || parsedUser?.Address || "",
                    img: parsedUser?.profilepic || parsedUser?.ProfilePic || parsedUser?.img || "",
                };
                setProfile(userState);
                setOriginalProfile(userState);
                setImageError(false);
            }
        } catch (error: any) {
            showError(error?.message || "Failed to load profile");
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const openCamera = () => {
        setPhotoPickerVisible(false);
        ImageCropPicker.openCamera({
            width: 500,
            height: 500,
            cropping: true,
        })
            .then((image) => {
                setProfile((prev: any) => ({ ...prev, img: image.path }));
                setImageError(false);
                setEdit(true);
            })
            .catch((err) => {
                if (err?.code !== "E_PICKER_CANCELLED") {
                    showError("Unable to access camera");
                }
            });
    };

    const openGallery = () => {
        setPhotoPickerVisible(false);
        ImageCropPicker.openPicker({
            width: 500,
            height: 500,
            cropping: true,
        })
            .then((image) => {
                setProfile((prev: any) => ({ ...prev, img: image.path }));
                setImageError(false);
                setEdit(true);
            })
            .catch((err) => {
                if (err?.code !== "E_PICKER_CANCELLED") {
                    showError("Unable to open gallery");
                }
            });
    };

    const handleUpdate = async () => {
        if (!profile.name || !profile.name.trim()) {
            showError("Please enter your name");
            return;
        }

        setLoading(true);

        const payload = {
            name: profile?.name?.trim(),
            email: profile?.email,
            mobileno: profile?.phno,
            profilepic: profile?.img,
            address: profile?.address,
        };

        try {
            const res = await updateUserService(payload);
            const { data: { status = 0, message = "", user = {} } } = res;
            if (status === 200) {
                await AsyncStorage.setItem("UserData", JSON.stringify(user));
                setOriginalProfile(profile);
                setEdit(false);
                showSuccess(message || "Profile updated successfully!");
            } else {
                showError(message || "Failed to update profile");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setProfile(originalProfile);
        setImageError(false);
        setEdit(false);
    };

    const getFirstTwoLetters = (name?: string) => {
        if (!name || typeof name !== "string") return "DP";
        const trimmed = name.trim();
        if (!trimmed || trimmed.toLowerCase() === "driver partner") return "DP";
        const cleaned = trimmed.replace(/[^a-zA-Z0-9]/g, "");
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2).toUpperCase();
        }
        if (cleaned.length === 1) {
            return cleaned.toUpperCase();
        }
        return "DP";
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Full-screen Loading Modal */}
            <Modal transparent visible={loading} animationType="fade">
                <Loader />
            </Modal>

            {/* Screen Header Bar */}
            <View className="h-[60px] justify-center" style={{ backgroundColor: COLORS.primary }}>
                <Header
                    value={value}
                    backNavigate={backNavigate}
                    // edit={!edit}
                    // clickEdit={() => setEdit(true)}
                />
            </View>

            {/* Hero Profile Banner Area */}
            <View className="items-center pt-1 pb-7 px-4" style={{ backgroundColor: COLORS.primary }}>
                {/* Avatar Container with Camera Badge */}
                <View className="relative">
                    <View
                        className="w-28 h-28 rounded-full bg-white p-1 border-2 border-white/60 items-center justify-center shadow-lg"
                        style={{ elevation: 5 }}
                    >
                        {profile.img && !imageError ? (
                            <Image
                                source={{ uri: profile.img }}
                                resizeMode="cover"
                                className="w-full h-full rounded-full"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <View className="w-full h-full rounded-full bg-slate-100 items-center justify-center">
                                <Text
                                    className="text-[28px] font-black"
                                    style={{ color: COLORS.primary, fontWeight: "900" }}
                                >
                                    {getFirstTwoLetters(profile.name)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Camera Edit Badge */}
                    <TouchableOpacity
                        onPress={() => setPhotoPickerVisible(true)}
                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-slate-900 border-2 border-white items-center justify-center shadow-md active:opacity-80"
                        style={{ elevation: 6 }}
                        activeOpacity={0.8}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="camera" size={17} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* User Name */}
                <Text
                    className="text-white text-[20px] font-black mt-3 tracking-tight text-center"
                    numberOfLines={1}
                >
                    {profile.name || "Driver Partner"}
                </Text>

                {/* Verified Status Pill */}
                <View className="flex-row items-center bg-white/20 border border-white/25 px-3 py-1 rounded-full mt-1.5 self-center">
                    <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color="#ffffff"
                        style={{ marginRight: 5 }}
                    />
                    <Text className="text-white text-[11px] font-bold">
                        Verified Partner
                    </Text>
                </View>
            </View>

            {/* Main Content Curved Sheet */}
            <View className="flex-1 bg-slate-50 rounded-t-[32px] overflow-hidden shadow-2xl">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="flex-1"
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            paddingBottom: 40,
                        }}
                    >
                        {/* Edit Mode Notification Banner */}
                        {edit && (
                            <View className="bg-red-50 border border-red-200/80 rounded-2xl p-3.5 mb-4 flex-row items-center justify-between shadow-sm">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2.5">
                                        <Ionicons name="create" size={16} color={COLORS.primary} />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className="text-[13px] font-extrabold"
                                            style={{ color: COLORS.primary }}
                                        >
                                            Edit Mode Active
                                        </Text>
                                        <Text className="text-[11px] font-medium text-red-500">
                                            Modify fields below and save changes
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleCancelEdit}
                                    className="bg-white border border-red-200 px-3 py-1.5 rounded-xl shadow-xs"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-[11px] font-bold text-slate-700">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Field: Full Name */}
                        <View className="mb-3.5">
                            <View className="flex-row items-center justify-between mb-1.5 px-1">
                                <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    Full Name
                                </Text>
                                {edit && (
                                    <Text
                                        className="text-[10px] font-bold"
                                        style={{ color: COLORS.primary }}
                                    >
                                        Editable
                                    </Text>
                                )}
                            </View>

                            <View
                                className={`bg-white rounded-2xl px-3.5 py-1 flex-row items-center border ${
                                    edit ? "border-red-200 shadow-sm" : "border-slate-100"
                                }`}
                                style={{ elevation: 1 }}
                            >
                                <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3">
                                    <Ionicons
                                        name="person-outline"
                                        size={18}
                                        color={edit ? COLORS.primary : "#64748b"}
                                    />
                                </View>

                                <TextInput
                                    value={profile.name}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, name: text })
                                    }
                                    placeholder="Enter Full Name"
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 text-[15px] font-bold text-slate-900 py-3"
                                    editable={edit}
                                />
                            </View>
                        </View>

                        {/* Field: Email Address (Read-Only) */}
                        <View className="mb-3.5">
                            <View className="flex-row items-center justify-between mb-1.5 px-1">
                                <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    Email Address
                                </Text>
                                <View className="flex-row items-center bg-slate-200/70 px-2 py-0.5 rounded-full">
                                    <Ionicons
                                        name="lock-closed"
                                        size={9}
                                        color="#64748b"
                                        style={{ marginRight: 3 }}
                                    />
                                    <Text className="text-[9px] font-bold text-slate-600">
                                        Locked
                                    </Text>
                                </View>
                            </View>

                            <View
                                className="bg-slate-100/70 rounded-2xl px-3.5 py-1 flex-row items-center border border-slate-200/60"
                                style={{ elevation: 0 }}
                            >
                                <View className="w-9 h-9 rounded-xl bg-slate-200/60 items-center justify-center mr-3">
                                    <Ionicons name="mail-outline" size={18} color="#94a3b8" />
                                </View>

                                <TextInput
                                    value={profile.email}
                                    placeholder="Email Address"
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 text-[15px] font-bold text-slate-500 py-3"
                                    editable={false}
                                />
                            </View>
                        </View>

                        {/* Field: Mobile Number */}
                        <View className="mb-3.5">
                            <View className="flex-row items-center justify-between mb-1.5 px-1">
                                <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    Mobile Number
                                </Text>
                                {edit && (
                                    <Text
                                        className="text-[10px] font-bold"
                                        style={{ color: COLORS.primary }}
                                    >
                                        Editable
                                    </Text>
                                )}
                            </View>

                            <View
                                className={`bg-white rounded-2xl px-3.5 py-1 flex-row items-center border ${
                                    edit ? "border-red-200 shadow-sm" : "border-slate-100"
                                }`}
                                style={{ elevation: 1 }}
                            >
                                <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3">
                                    <Ionicons
                                        name="call-outline"
                                        size={18}
                                        color={edit ? COLORS.primary : "#64748b"}
                                    />
                                </View>

                                <TextInput
                                    value={profile.phno}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, phno: text })
                                    }
                                    keyboardType="phone-pad"
                                    placeholder="Enter Mobile Number"
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 text-[15px] font-bold text-slate-900 py-3"
                                    editable={edit}
                                />
                            </View>
                        </View>

                        {/* Field: Address */}
                        <View className="mb-5">
                            <View className="flex-row items-center justify-between mb-1.5 px-1">
                                <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    Address
                                </Text>
                                {edit && (
                                    <Text
                                        className="text-[10px] font-bold"
                                        style={{ color: COLORS.primary }}
                                    >
                                        Editable
                                    </Text>
                                )}
                            </View>

                            <View
                                className={`bg-white rounded-2xl px-3.5 py-2 flex-row items-start border ${
                                    edit ? "border-red-200 shadow-sm" : "border-slate-100"
                                }`}
                                style={{ elevation: 1 }}
                            >
                                <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center mr-3 mt-1">
                                    <Ionicons
                                        name="location-outline"
                                        size={18}
                                        color={edit ? COLORS.primary : "#64748b"}
                                    />
                                </View>

                                <TextInput
                                    value={profile.address}
                                    onChangeText={(text) =>
                                        setProfile({ ...profile, address: text })
                                    }
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    placeholder="Enter Address"
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 text-[14px] font-bold text-slate-900 py-2 min-h-[70px]"
                                    editable={edit}
                                />
                            </View>
                        </View>

                        {/* Action Buttons: Save & Discard or Edit Profile */}
                        {edit ? (
                            <View className="mt-2">
                                <TouchableOpacity
                                    onPress={handleUpdate}
                                    className="w-full py-4 rounded-2xl flex-row items-center justify-center shadow-md active:opacity-90"
                                    style={{ backgroundColor: COLORS.primary, elevation: 3 }}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color="#ffffff"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text className="text-white text-[16px] font-black tracking-wide">
                                        Save Changes
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleCancelEdit}
                                    className="w-full py-3.5 rounded-2xl bg-slate-200/70 items-center justify-center mt-3"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-slate-700 text-[14px] font-bold">
                                        Discard Changes
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setEdit(true)}
                                className="w-full py-4 rounded-2xl bg-white border border-slate-200 flex-row items-center justify-center shadow-xs active:bg-slate-50 mt-2"
                                style={{ elevation: 1 }}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={18}
                                    color={COLORS.primary}
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-slate-900 text-[15px] font-extrabold">
                                    Edit Profile
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            {/* Photo Picker Modal Sheet */}
            <Modal
                transparent
                visible={photoPickerVisible}
                animationType="slide"
                onRequestClose={() => setPhotoPickerVisible(false)}
                statusBarTranslucent
            >
                <TouchableWithoutFeedback onPress={() => setPhotoPickerVisible(false)}>
                    <View className="flex-1 justify-end bg-black/60">
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View className="bg-white rounded-t-[32px] pt-3 pb-8 px-5 w-full shadow-2xl">
                                <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-3" />

                                <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-4">
                                    <Text className="text-[18px] font-black text-slate-900">
                                        Update Profile Photo
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setPhotoPickerVisible(false)}
                                        className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                                    >
                                        <Ionicons name="close" size={17} color="#64748b" />
                                    </TouchableOpacity>
                                </View>

                                {/* Option: Camera */}
                                <TouchableOpacity
                                    onPress={openCamera}
                                    className="flex-row items-center p-3.5 bg-slate-50 rounded-2xl mb-2.5 active:bg-slate-100"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 items-center justify-center mr-3.5">
                                        <Ionicons name="camera" size={22} color={COLORS.primary} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[15px] font-bold text-slate-900">
                                            Take Photo
                                        </Text>
                                        <Text className="text-[12px] text-slate-400 font-medium">
                                            Use camera to capture a new photo
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                                </TouchableOpacity>

                                {/* Option: Gallery */}
                                <TouchableOpacity
                                    onPress={openGallery}
                                    className="flex-row items-center p-3.5 bg-slate-50 rounded-2xl mb-4 active:bg-slate-100"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center mr-3.5">
                                        <Ionicons name="images" size={22} color="#475569" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[15px] font-bold text-slate-900">
                                            Choose from Gallery
                                        </Text>
                                        <Text className="text-[12px] text-slate-400 font-medium">
                                            Select photo from device library
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                                </TouchableOpacity>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    onPress={() => setPhotoPickerVisible(false)}
                                    className="w-full h-12 rounded-xl bg-slate-100 items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-[14px] font-bold text-slate-700">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

export default Profile;