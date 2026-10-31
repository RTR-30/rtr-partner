import React, { useEffect, useState, useCallback } from "react";
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Share,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import Ionicons from "react-native-vector-icons/Ionicons";
import { referalHistoryService } from "./helper";
import { getUserDetailsService } from "../Home/helper";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";
import Loader from "../../../Common/Loader";

const GiftImg = require("../../../../assets/Imgs/Gifts.png");

const MyReferal = () => {
    const value = "Refer & Earn";
    const backNavigate = true;

    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>(null);
    const [referalHistory, setReferalHistory] = useState<any[]>([]);
    const [copied, setCopied] = useState<boolean>(false);

    const [referalAmount, setReferalAmount] = useState({
        pending: 0,
        confirm: 0,
    });

    const copyToClipboard = () => {
        const code = userData?.referral_code || userData?.ReferralCode;
        if (code) {
            Clipboard.setString(code);
            setCopied(true);
            showSuccess("Referral code copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        } else {
            showError("Referral code not available");
        }
    };

    const shareReferral = async () => {
        const code = userData?.referral_code || userData?.ReferralCode;
        if (!code) {
            showError("Referral code not available to share");
            return;
        }
        try {
            await Share.share({
                message: `Drive & earn with RTR Partner! Use my referral code ${code} when registering to earn exclusive bonus rewards: https://play.google.com/store/apps/details?id=com.rtrpartner`,
            });
        } catch (error) {
            console.warn("Share error:", error);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const cached = await AsyncStorage.getItem("UserData");
            if (cached) {
                const parsed = JSON.parse(cached);
                setUserData((prev: any) => prev || parsed);
            }
        } catch (e) {}

        try {
            const res = await getUserDetailsService();
            const { data: { success = false, user = {} } } = res;

            if (success === true) {
                setUserData(user);
            }
        } catch (error) {
            console.log("Error loading user details in MyReferal:", error);
        }
    };

    const fetchReferalHistory = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);

        try {
            const res = await referalHistoryService();
            const { data: { history = [], success = false } } = res;

            if (success === true) {
                setReferalHistory(history || []);

                let pending = 0;
                let confirm = 0;

                (history || []).forEach((item: any) => {
                    const amount = Number(item.reward_amount) || 0;
                    if (item.status === "PENDING") {
                        pending += amount;
                    } else {
                        confirm += amount;
                    }
                });

                setReferalAmount({
                    pending,
                    confirm,
                });
            } else {
                showError("Could not load referral history");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to load referral history");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReferalHistory(true);
        fetchUserDetails();
    }, []);

    const formatDateTime = (dateString: any) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    useEffect(() => {
        fetchUserDetails();
        fetchReferalHistory();
    }, []);

    const referralCode =
        userData?.referral_code || userData?.ReferralCode || "---";

    const renderHeader = () => (
        <View className="mb-4">
            {/* Promo Hero Card */}
            <View
                className="bg-white rounded-3xl p-5 border border-slate-100 mb-4"
                style={{ elevation: 2 }}
            >
                {/* Top Promo Row with Illustration */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <View className="self-start bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full mb-1.5">
                            <Text
                                className="text-[10px] font-extrabold tracking-wider uppercase"
                                style={{ color: COLORS.primary }}
                            >
                                Share & Earn
                            </Text>
                        </View>
                        <Text className="text-[20px] font-black text-slate-900 tracking-tight">
                            Invite Driver Friends
                        </Text>
                        <Text className="text-[12px] text-slate-500 font-medium mt-1 leading-4">
                            Share your referral code and earn bonuses when your friends register and complete trips.
                        </Text>
                    </View>

                    <View className="w-20 h-20 justify-center items-center">
                        <Image
                            source={GiftImg}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Earnings Summary Grid */}
                <View className="flex-row gap-2.5 mb-4">
                    {/* Confirmed Bonus */}
                    <View className="flex-1 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-emerald-800">
                                Confirmed
                            </Text>
                            <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#15803d"
                            />
                        </View>
                        <Text className="text-[18px] font-black text-emerald-950">
                            ₹{referalAmount.confirm}
                        </Text>
                    </View>

                    {/* Pending Bonus */}
                    <View className="flex-1 bg-amber-50/70 border border-amber-100 rounded-2xl p-3">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-amber-800">
                                Pending
                            </Text>
                            <Ionicons name="time" size={14} color="#b45309" />
                        </View>
                        <Text className="text-[18px] font-black text-amber-950">
                            ₹{referalAmount.pending}
                        </Text>
                    </View>
                </View>

                {/* Referral Code Voucher Box */}
                <View className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3.5 flex-row items-center justify-between mb-3">
                    <View className="flex-1 mr-2">
                        <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            Your Referral Code
                        </Text>
                        <Text className="text-[20px] font-black text-slate-900 tracking-wider mt-0.5">
                            {referralCode}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={copyToClipboard}
                        className={`px-4 py-2.5 rounded-xl flex-row items-center shadow-sm ${
                            copied ? "bg-emerald-600" : "bg-[#E0211F]"
                        }`}
                        style={{
                            backgroundColor: copied
                                ? "#059669"
                                : COLORS.primary,
                            elevation: 2,
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={copied ? "checkmark" : "copy-outline"}
                            size={16}
                            color="#ffffff"
                            style={{ marginRight: 5 }}
                        />
                        <Text className="text-white text-[13px] font-bold">
                            {copied ? "Copied" : "Copy"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Share Button */}
                <TouchableOpacity
                    onPress={shareReferral}
                    className="w-full bg-slate-900 h-12 rounded-xl flex-row items-center justify-center shadow-sm"
                    style={{ elevation: 2 }}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="share-social-outline"
                        size={18}
                        color="#ffffff"
                        style={{ marginRight: 8 }}
                    />
                    <Text className="text-white text-[14px] font-bold">
                        Share With Friends
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Referral History Section Header */}
            <View className="flex-row items-center justify-between mt-2 px-1">
                <Text className="text-[15px] font-extrabold text-slate-800">
                    Referral History
                </Text>
                <View className="bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                    <Text className="text-[11px] font-bold text-slate-600">
                        {referalHistory.length}{" "}
                        {referalHistory.length === 1 ? "Invite" : "Invites"}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderHistoryItem = ({ item }: { item: any }) => {
        const isPending = item.status === "PENDING";
        const refereeTitle =
            item.referee_name ||
            (item.referee_id
                ? `Partner #${item.referee_id}`
                : `Referral #${item.id || "-"}`);

        return (
            <View
                className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
                style={{ elevation: 1 }}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-9 h-9 rounded-full bg-slate-100 justify-center items-center mr-2.5">
                            <Ionicons
                                name="person-outline"
                                size={17}
                                color="#475569"
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-[14px] font-bold text-slate-800"
                                numberOfLines={1}
                            >
                                {refereeTitle}
                            </Text>
                            {item.created_at ? (
                                <Text className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    Joined {formatDateTime(item.created_at)}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View
                        className={`px-2.5 py-1 rounded-md flex-row items-center ${
                            isPending ? "bg-amber-100" : "bg-emerald-100"
                        }`}
                    >
                        <Ionicons
                            name={
                                isPending
                                    ? "time-outline"
                                    : "checkmark-circle-outline"
                            }
                            size={12}
                            color={isPending ? "#b45309" : "#15803d"}
                            style={{ marginRight: 3 }}
                        />
                        <Text
                            className={`text-[11px] font-bold ${
                                isPending ? "text-amber-800" : "text-emerald-800"
                            }`}
                        >
                            {item.status || "Completed"}
                        </Text>
                    </View>
                </View>

                {/* Progress / Reward Row */}
                {(item.rides_completed !== undefined || item.reward_amount) && (
                    <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 mt-1">
                        {item.rides_completed !== undefined ? (
                            <View className="flex-row items-center bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <Ionicons
                                    name="car-outline"
                                    size={13}
                                    color="#64748b"
                                    style={{ marginRight: 4 }}
                                />
                                <Text className="text-[11px] font-bold text-slate-600">
                                    {item.rides_completed} / 5 rides completed
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-[12px] font-semibold text-slate-500">
                                Reward Amount
                            </Text>
                        )}

                        {item.reward_amount ? (
                            <Text className="text-[14px] font-extrabold text-emerald-600">
                                +₹{item.reward_amount}
                            </Text>
                        ) : null}
                    </View>
                )}
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View className="items-center justify-center py-12 px-6">
                <View
                    className="w-16 h-16 rounded-full bg-white justify-center items-center mb-3 border border-slate-100 shadow-sm"
                    style={{ elevation: 1 }}
                >
                    <Ionicons name="gift-outline" size={30} color="#94a3b8" />
                </View>
                <Text className="text-[16px] font-bold text-slate-800 mb-1">
                    No Referral History
                </Text>
                <Text className="text-[12px] text-slate-400 text-center leading-4 max-w-[240px]">
                    Share your code with friends and family to see your invite
                    rewards here.
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: COLORS.primary }}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.primary}
            />

            {loading && !refreshing && <Loader />}

            {/* Screen Header */}
            <View className="h-14 justify-center">
                <Header value={value} backNavigate={backNavigate} />
            </View>

            {/* Content Sheet */}
            <View className="flex-1 bg-slate-50 rounded-t-[32px] overflow-hidden">
                <FlatList
                    data={referalHistory || []}
                    keyExtractor={(item, index) =>
                        item.id?.toString() || index.toString()
                    }
                    renderItem={renderHistoryItem}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 16,
                        paddingBottom: 40,
                        flexGrow: 1,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
};

export default MyReferal;