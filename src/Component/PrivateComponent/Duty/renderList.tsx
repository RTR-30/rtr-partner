import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { UpdateBooking } from "./helper";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";

interface RenderListProps {
    item: any;
    setShowLoader: (show: boolean) => void;
}

const RenderList = ({ item, setShowLoader }: RenderListProps) => {
    const navigation: any = useNavigation();

    const fetchUpdate = async () => {
        setShowLoader(true);
        const data = {
            bookingId: item.Id,
        };

        try {
            const res = await UpdateBooking(data);
            showSuccess(res?.data?.message || "Duty accepted successfully!");
            navigation.navigate("MyDuty");
        } catch (error: any) {
            showError(error?.message || error || "Failed to accept booking");
        } finally {
            setShowLoader(false);
        }
    };

    const formatDateTime = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "Flexible Timing";
        try {
            const parsedDate = new Date(dateTime);
            if (isNaN(parsedDate.getTime())) return String(dateTime);
            return parsedDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                ...(includeTime && {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            });
        } catch {
            return String(dateTime);
        }
    };

    const formatEndDate = (dateTime: any) => {
        if (!dateTime) return "";
        try {
            const parsedDate = new Date(dateTime);
            if (isNaN(parsedDate.getTime())) return String(dateTime);
            return parsedDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return String(dateTime);
        }
    };

    const isPaid = item?.PaymentStatus?.toLowerCase() === "paid";

    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
            style={{ elevation: 3 }}
        >
            {/* Header: Status Pill & Estimated Fare */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-xs font-bold text-emerald-700 tracking-wide">
                        {item.Status || "Available Duty"}
                    </Text>
                </View>

                <View className="items-end">
                    <Text className="text-[10px] font-bold text-gray-400 tracking-wider">
                        EST. EARNING
                    </Text>
                    <View className="flex-row items-baseline">
                        <Text
                            className="text-sm font-bold mr-0.5"
                            style={{ color: COLORS.primary }}
                        >
                            ₹
                        </Text>
                        <Text
                            className="text-[22px] font-black"
                            style={{ color: COLORS.primary }}
                        >
                            {item.EstimateAmount || 0}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Quick Specs Chips */}
            <View className="flex-row flex-wrap mb-3.5">
                {/* Hours Chip */}
                {item.Hours ? (
                    <View className="flex-row items-center bg-gray-100 px-2.5 py-1 rounded-lg mr-2 mb-1">
                        <Ionicons name="time-outline" size={13} color="#D97706" />
                        <Text className="text-xs font-semibold text-gray-700 ml-1.5">
                            {item.Hours} Hours
                        </Text>
                    </View>
                ) : null}

                {/* Gear Type Chip */}
                {item.GearType ? (
                    <View className="flex-row items-center bg-gray-100 px-2.5 py-1 rounded-lg mr-2 mb-1">
                        <Ionicons name="speedometer-outline" size={13} color="#2563EB" />
                        <Text className="text-xs font-semibold text-gray-700 ml-1.5">
                            {item.GearType}
                        </Text>
                    </View>
                ) : null}

                {/* Payment Status Chip */}
                <View
                    className={`flex-row items-center px-2.5 py-1 rounded-lg mr-2 mb-1 ${
                        isPaid ? "bg-emerald-50" : "bg-amber-50"
                    }`}
                >
                    <Ionicons
                        name={isPaid ? "checkmark-circle" : "cash-outline"}
                        size={13}
                        color={isPaid ? "#059669" : "#D97706"}
                    />
                    <Text
                        className={`text-xs font-semibold ml-1.5 ${
                            isPaid ? "text-emerald-700" : "text-amber-700"
                        }`}
                    >
                        {isPaid ? "Prepaid" : "Cash on Duty"}
                    </Text>
                </View>
            </View>

            {/* Details Box */}
            <View className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3.5">
                {/* Pickup Address */}
                <View className="flex-row items-start">
                    <View className="w-7 h-7 rounded-full justify-center items-center mr-2.5 mt-0.5 bg-red-50">
                        <Ionicons name="location" size={14} color={COLORS.primary} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">
                            PICKUP LOCATION
                        </Text>
                        <Text className="text-[13px] font-bold text-gray-800 leading-5" numberOfLines={2}>
                            {item.Address || "Customer address specified on booking"}
                        </Text>
                    </View>
                </View>

                {/* Divider inside details */}
                <View className="h-[1px] bg-gray-200 my-2.5" />

                {/* Schedule & Customer Info */}
                <View className="flex-row justify-between">
                    {/* Start Date */}
                    <View className="flex-1 pr-1.5">
                        <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">
                            START SCHEDULE
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="calendar-outline" size={13} color="#4B5563" />
                            <Text className="text-xs font-semibold text-gray-700 ml-1.5">
                                {formatDateTime(item?.StartDate)}
                            </Text>
                        </View>
                    </View>

                    {/* Customer Name or End Date */}
                    <View className="flex-1 pr-1.5">
                        <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">
                            {item.EndDate ? "RETURN SCHEDULE" : "CUSTOMER"}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons
                                name={item.EndDate ? "repeat-outline" : "person-outline"}
                                size={13}
                                color="#4B5563"
                            />
                            <Text className="text-xs font-semibold text-gray-700 ml-1.5" numberOfLines={1}>
                                {item.EndDate
                                    ? formatEndDate(item.EndDate)
                                    : item.Name || "Customer"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Accept Duty Action Button */}
            <TouchableOpacity
                activeOpacity={0.88}
                onPress={fetchUpdate}
                className="rounded-xl py-3.5 px-4 flex-row justify-between items-center"
                style={{ backgroundColor: COLORS.primary, elevation: 3 }}
            >
                <View className="flex-row items-center">
                    <Ionicons name="flash" size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text className="text-[15px] font-extrabold text-white tracking-wide">
                        Accept This Duty
                    </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
};

export default RenderList;