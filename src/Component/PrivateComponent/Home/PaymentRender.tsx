import React from "react";
import {
    View,
    Text,
    TouchableOpacity
} from "react-native";
import { COLORS } from "../../../utils/ColorCode";


const PaymentRender = ({ item }: any) => {

    return (
        <View className="w-full p-2 border-[1px] border-black rounded-lg">
            <View className="w-full justify-between flex-row p-2 border-b-[0.5px] border-black">
                <Text className="font-bold text-[14px]" style={{color: COLORS.primary}}>{item?.name}</Text>
                <Text className="font-bold text-[14px] text-black">Validity : {item?.validity_days} days</Text>
            </View>

            <View className="mt-4 w-full p-2">
                <Text className="font-bold text-[14px]" style={{color: COLORS.primary}}>Details</Text>
                <Text className="font-bold text-center text-[14px] text-black">{item?.description}</Text>
            </View>

            <View className="mt-2 w-full p-1 justify-center items-center">
                <TouchableOpacity className="p-1 rounded-xl justify-center items-center w-[40%]" style={{backgroundColor: COLORS.primary}}>
                    <Text className="text-white font-bold text-[14px] my-1">Pay</Text>
                    <Text className="text-white font-bold text-[14px] my-1">{item?.amount}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default PaymentRender;