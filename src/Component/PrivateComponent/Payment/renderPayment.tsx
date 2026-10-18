import React from "react";
import { View, Text } from "react-native";

const RenderPayment = ({ item }: any) => {
    const formattedDate = item?.created_at
        ? new Date(item.created_at).toLocaleDateString("en-IN")
        : "";

    const formattedTime = item?.created_at
        ? new Date(item.created_at).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return (
        <View className="flex-row items-center bg-white py-3 px-3 border-b border-gray-100">
            {/* Amount */}
            <View className="flex-1 pr-1">
                <Text className="text-xs font-extrabold text-emerald-600">
                    ₹{item?.amount || 0}
                </Text>
            </View>

            {/* Payment Method */}
            <View className="flex-1 pr-1">
                <Text
                    className="text-[11px] font-bold text-blue-600 uppercase"
                    numberOfLines={1}
                >
                    {item?.transaction_type || "WALLET"}
                </Text>
            </View>

            {/* Description */}
            <View className="flex-1 pr-1">
                <Text
                    className="text-[11px] font-medium text-gray-700"
                    numberOfLines={2}
                >
                    {item?.description || "-"}
                </Text>
            </View>

            {/* Date & Time */}
            <View className="flex-1 items-end">
                <Text className="text-[11px] font-bold text-gray-800">
                    {formattedDate}
                </Text>
                <Text className="text-[10px] text-gray-400 mt-0.5">
                    {formattedTime}
                </Text>
            </View>
        </View>
    );
};

export default RenderPayment;