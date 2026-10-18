import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    ScrollView,
    StatusBar,
    SafeAreaView,
    Alert,
} from "react-native";
import Header from "../../../Common/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const MenuScreen = () => {
    const value = "Menu";
    const navigation: any = useNavigation();
    const [userData, setUserData] = useState<any>(null);
    const [imageError, setImageError] = useState(false);

    const getUserData = async () => {
        try {
            const userStr = await AsyncStorage.getItem("UserData");
            if (userStr) {
                const parsed = JSON.parse(userStr);
                setUserData(parsed);
                setImageError(false);
            }
        } catch (error) {
            console.log("Error loading user data in Menu:", error);
        }
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

    useFocusEffect(
        React.useCallback(() => {
            getUserData();
        }, [])
    );

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("UserData");
            await AsyncStorage.clear();
            showSuccess("Logged out successfully");
            navigation.navigate("Login");
        } catch (error: any) {
            showError("Logout failed");
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out of your partner account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: handleLogout,
                },
            ]
        );
    };

    const menuSections = [
        {
            title: "WORK & PERFORMANCE",
            items: [
                {
                    title: "Statistics",
                    subtitle: "Earnings, completed rides & trip analytics",
                    icon: "stats-chart",
                    iconColor: "#059669",
                    iconBg: "bg-emerald-50",
                    route: "Statistics",
                },
                {
                    title: "Refer a Friend",
                    subtitle: "Invite driver friends and earn bonus rewards",
                    icon: "gift",
                    iconColor: "#7C3AED",
                    iconBg: "bg-purple-50",
                    route: "MyReferal",
                },
            ],
        },
        {
            title: "SUPPORT & HELPDESK",
            items: [
                {
                    title: "Help & Feedback",
                    subtitle: "Frequently asked questions & app feedback",
                    icon: "help-buoy",
                    iconColor: "#D97706",
                    iconBg: "bg-amber-50",
                    route: "HelpAndFeedback",
                },
                {
                    title: "Contact Us",
                    subtitle: "24/7 dedicated RTR Partner Helpline",
                    icon: "call",
                    iconColor: "#2563EB",
                    iconBg: "bg-blue-50",
                    route: "ContactUs",
                },
            ],
        },
    ];

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header Bar */}
            <View className="h-14 justify-center">
                <Header value={value} />
            </View>

            {/* Main Content Surface */}
            <View className="flex-1 rounded-t-[32px] bg-gray-50 overflow-hidden px-4 pt-4">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    {/* Driver Profile Card */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate("Profile")}
                        className="bg-white rounded-2xl p-4 mb-5 border border-gray-200 flex-row items-center justify-between"
                        style={{ elevation: 2 }}
                    >
                        <View className="flex-row items-center flex-1 pr-3">
                            {userData?.profilepic && !imageError ? (
                                <Image
                                    source={{ uri: userData.profilepic }}
                                    className="w-14 h-14 rounded-full mr-3.5 border border-gray-200"
                                    resizeMode="cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <View
                                    className="w-14 h-14 rounded-full justify-center items-center mr-3.5"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <Text
                                        className="text-white text-lg font-bold"
                                        style={{ fontSize: 18, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 }}
                                    >
                                        {getFirstTwoLetters(userData?.name)}
                                    </Text>
                                </View>
                            )}

                            <View className="flex-1">
                                <Text
                                    className="text-base font-extrabold text-gray-900"
                                    numberOfLines={1}
                                >
                                    {userData?.name || "Driver Partner"}
                                </Text>
                                <Text
                                    className="text-xs text-gray-500 font-medium mt-0.5"
                                    numberOfLines={1}
                                >
                                    {userData?.mobileno ||
                                        userData?.phno ||
                                        userData?.email ||
                                        "View & Edit Profile"}
                                </Text>

                                <View className="flex-row items-center mt-1.5">
                                    <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                                    <Text className="text-[11px] font-bold text-emerald-700">
                                        Verified Partner
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center">
                            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                        </View>
                    </TouchableOpacity>

                    {/* Menu Navigation Sections */}
                    {menuSections.map((section, sectionIndex) => (
                        <View key={sectionIndex} className="mb-4">
                            <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                {section.title}
                            </Text>

                            <View
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                                style={{ elevation: 1 }}
                            >
                                {section.items.map((item, itemIndex) => (
                                    <TouchableOpacity
                                        key={itemIndex}
                                        activeOpacity={0.7}
                                        onPress={() => navigation.navigate(item.route)}
                                        className={`flex-row items-center justify-between p-3.5 ${itemIndex !== section.items.length - 1
                                                ? "border-b border-gray-100"
                                                : ""
                                            }`}
                                    >
                                        <View className="flex-row items-center flex-1 pr-2">
                                            <View
                                                className={`w-10 h-10 rounded-xl justify-center items-center mr-3 ${item.iconBg}`}
                                            >
                                                <Ionicons
                                                    name={item.icon as any}
                                                    size={20}
                                                    color={item.iconColor}
                                                />
                                            </View>

                                            <View className="flex-1">
                                                <Text className="text-sm font-bold text-gray-900">
                                                    {item.title}
                                                </Text>
                                                <Text
                                                    className="text-[11px] text-gray-400 font-medium mt-0.5"
                                                    numberOfLines={1}
                                                >
                                                    {item.subtitle}
                                                </Text>
                                            </View>
                                        </View>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={18}
                                            color="#D1D5DB"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Account Section: Logout */}
                    <View className="mb-4">
                        <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 px-1">
                            ACCOUNT
                        </Text>

                        <View
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                            style={{ elevation: 1 }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={confirmLogout}
                                className="flex-row items-center justify-between p-3.5"
                            >
                                <View className="flex-row items-center flex-1 pr-2">
                                    <View className="w-10 h-10 rounded-xl bg-red-50 justify-center items-center mr-3">
                                        <Ionicons
                                            name="log-out"
                                            size={20}
                                            color="#DC2626"
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-red-600">
                                            Logout
                                        </Text>
                                        <Text className="text-[11px] text-gray-400 font-medium mt-0.5">
                                            Sign out of your driver partner account
                                        </Text>
                                    </View>
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color="#FECACA"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* App Version Info Footer */}
                    <View className="items-center mt-3">
                        <Text className="text-[11px] text-gray-400 font-medium">
                            RTR Partner App • Version 1.0.0
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default MenuScreen;
