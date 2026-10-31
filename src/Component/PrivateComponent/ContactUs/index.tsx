import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Linking,
    RefreshControl,
    StatusBar,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../../Common/Header";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";
import { getContactUsService, ContactUsResponse, ContactItem } from "./helper";

const ContactUs = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [contactData, setContactData] = useState<ContactUsResponse | null>(null);

    const fetchContactUs = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await getContactUsService("partner");
            if (res && res.data && res.data.success) {
                setContactData(res.data);
            } else {
                const errMsg = res?.data?.message || "Failed to load Contact Details";
                showError(errMsg);
            }
        } catch (error: any) {
            showError(error?.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchContactUs();
    }, [fetchContactUs]);

    const getPhoneNumbers = (phoneStr?: string): string[] => {
        if (!phoneStr) return [];
        return phoneStr
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
    };

    const makeCall = async (phoneNumber: string) => {
        const cleanNumber = phoneNumber.trim().replace(/\s+/g, "");
        const url = `tel:${cleanNumber}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                showError("Phone call not supported on this device");
            }
        } catch (err) {
            showError("Could not initiate phone call");
        }
    };

    const handleCallPress = () => {
        const phones = getPhoneNumbers(contactData?.contact?.phone);
        if (phones.length === 0) {
            showError("Phone number not available");
            return;
        }

        if (phones.length === 1) {
            makeCall(phones[0]);
        } else {
            Alert.alert(
                "Call Support",
                "Choose a phone number to call:",
                [
                    ...phones.map((phone) => ({
                        text: phone,
                        onPress: () => makeCall(phone),
                    })),
                    { text: "Cancel", style: "cancel" },
                ]
            );
        }
    };

    const openWhatsApp = async (phoneNumber: string) => {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
        const appUrl = `whatsapp://send?phone=${cleanNumber}`;
        const webUrl = `https://wa.me/${cleanNumber}`;

        try {
            const supported = await Linking.canOpenURL(appUrl);
            if (supported) {
                await Linking.openURL(appUrl);
            } else {
                await Linking.openURL(webUrl);
            }
        } catch (err) {
            showError("Could not open WhatsApp");
        }
    };

    const sendEmail = async (email: string) => {
        const url = `mailto:${email.trim()}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                showError("No email app installed on this device");
            }
        } catch (err) {
            showError("Could not open email app");
        }
    };

    const openInstagram = async (instaHandle: string) => {
        const cleanHandle = instaHandle.trim().replace("@", "");
        const appUrl = `instagram://user?username=${cleanHandle}`;
        const webUrl = instaHandle.startsWith("http")
            ? instaHandle
            : `https://instagram.com/${cleanHandle}`;

        try {
            const supported = await Linking.canOpenURL(appUrl);
            if (supported) {
                await Linking.openURL(appUrl);
            } else {
                await Linking.openURL(webUrl);
            }
        } catch (err) {
            showError("Could not open Instagram");
        }
    };

    const headerTitle = contactData?.heading || "Contact Us";
    const dataList: ContactItem[] =
        contactData && Array.isArray(contactData.data) ? contactData.data : [];

    const contact = contactData?.contact;
    const hasPhone = !!contact?.phone?.trim();
    const hasWhatsApp = !!contact?.whatsapp?.trim();
    const hasEmail = !!contact?.mail?.trim();
    const hasInsta = !!contact?.insta?.trim();

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {loading && !refreshing && (
                <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
                    <Loader />
                </View>
            )}

            {/* Header */}
            <View className="h-14 justify-center">
                <Header value={headerTitle} backNavigate={true} />
            </View>

            {/* Content Sheet */}
            <View className="flex-1 bg-white rounded-t-[30px] overflow-hidden">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchContactUs(true)}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {/* Optional Intro Content from API */}
                    {!!contactData?.content && (
                        <View className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-5 flex-row items-start">
                            <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center mr-3 mt-0.5">
                                <Ionicons name="headset" size={20} color={COLORS.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-[15px] mb-1">
                                    {contactData.heading || "Contact Support"}
                                </Text>
                                <Text className="text-slate-700 font-normal text-[13.5px] leading-5">
                                    {contactData.content}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Contact Channels Section */}
                    <View className="mb-4">
                        <Text className="text-slate-900 font-bold text-[16px] mb-3">
                            Connect With Us
                        </Text>

                        {/* Phone Card */}
                        {hasPhone && (
                            <TouchableOpacity
                                onPress={handleCallPress}
                                activeOpacity={0.7}
                                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-11 h-11 rounded-xl bg-red-500/10 items-center justify-center mr-3.5">
                                        <Ionicons name="call" size={22} color={COLORS.primary} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-[14.5px]">
                                            Phone Support
                                        </Text>
                                        <Text
                                            className="text-slate-500 font-medium text-[13px] mt-0.5"
                                            numberOfLines={1}
                                        >
                                            {contact?.phone}
                                        </Text>
                                    </View>
                                </View>
                                <View className="w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={16} color="#64748b" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* WhatsApp Card */}
                        {hasWhatsApp && (
                            <TouchableOpacity
                                onPress={() => openWhatsApp(contact!.whatsapp!)}
                                activeOpacity={0.7}
                                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-11 h-11 rounded-xl bg-emerald-500/10 items-center justify-center mr-3.5">
                                        <Ionicons name="logo-whatsapp" size={24} color="#10b981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-[14.5px]">
                                            WhatsApp Chat
                                        </Text>
                                        <Text className="text-slate-500 font-medium text-[13px] mt-0.5">
                                            {contact?.whatsapp}
                                        </Text>
                                    </View>
                                </View>
                                <View className="w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={16} color="#64748b" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Email Card */}
                        {hasEmail && (
                            <TouchableOpacity
                                onPress={() => sendEmail(contact!.mail!)}
                                activeOpacity={0.7}
                                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-11 h-11 rounded-xl bg-blue-500/10 items-center justify-center mr-3.5">
                                        <Ionicons name="mail" size={22} color="#3b82f6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-[14.5px]">
                                            Email Support
                                        </Text>
                                        <Text
                                            className="text-slate-500 font-medium text-[13px] mt-0.5"
                                            numberOfLines={1}
                                        >
                                            {contact?.mail}
                                        </Text>
                                    </View>
                                </View>
                                <View className="w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={16} color="#64748b" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Instagram Card (if available) */}
                        {hasInsta && (
                            <TouchableOpacity
                                onPress={() => openInstagram(contact!.insta!)}
                                activeOpacity={0.7}
                                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-11 h-11 rounded-xl bg-pink-500/10 items-center justify-center mr-3.5">
                                        <Ionicons name="logo-instagram" size={22} color="#ec4899" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-[14.5px]">
                                            Instagram
                                        </Text>
                                        <Text
                                            className="text-slate-500 font-medium text-[13px] mt-0.5"
                                            numberOfLines={1}
                                        >
                                            {contact?.insta}
                                        </Text>
                                    </View>
                                </View>
                                <View className="w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={16} color="#64748b" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Dynamic Data Items from API */}
                    {dataList.length > 0 && (
                        <View className="mt-3">
                            <Text className="text-slate-900 font-bold text-[16px] mb-3">
                                Additional Information
                            </Text>
                            {dataList.map((item: ContactItem, index: number) => (
                                <View
                                    key={index}
                                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3 shadow-sm"
                                >
                                    <View className="flex-row items-center mb-1.5">
                                        <View className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 items-center justify-center mr-2.5">
                                            <Ionicons
                                                name="information-circle-outline"
                                                size={17}
                                                color={COLORS.primary}
                                            />
                                        </View>
                                        <Text className="text-slate-900 font-bold text-[14.5px] flex-1 leading-5">
                                            {item.title}
                                        </Text>
                                    </View>
                                    <Text className="text-slate-600 font-normal text-[13.5px] leading-5 pl-1">
                                        {item.description}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Empty / Error state */}
                    {!loading && !hasPhone && !hasWhatsApp && !hasEmail && dataList.length === 0 && (
                        <View className="py-16 items-center justify-center">
                            <Ionicons name="headset-outline" size={48} color="#94a3b8" />
                            <Text className="text-slate-500 font-medium text-[15px] mt-3">
                                No contact details found
                            </Text>
                            <TouchableOpacity
                                onPress={() => fetchContactUs()}
                                className="mt-4 px-5 py-2.5 rounded-full"
                                style={{ backgroundColor: COLORS.primary }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-semibold text-[14px]">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default ContactUs;