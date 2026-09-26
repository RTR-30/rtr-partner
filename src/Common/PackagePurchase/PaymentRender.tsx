import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity
} from "react-native";

const PaymentRender = ({ item, packages, selectedPaymentId, setSelectedPaymentId, setSelectPaymentData }: any) => {

    const handleSelect = (item: any) => {
        setSelectedPaymentId(item?.id);
        setSelectPaymentData(item);
    };

    useEffect(() => {
        if(!selectedPaymentId){
            handleSelect(packages?.[0])
        }
        
    },[selectedPaymentId, packages])

    return (
        <View className={`border-[1px] ${selectedPaymentId === item?.id ? "border-green-800 bg-green-600" : "border-black bg-white"} rounded-lg w-40`}>
            <TouchableOpacity onPress={() => handleSelect(item)} className="justify-center items-center p-2">
                <Text className={`text-[14px] ${selectedPaymentId === item?.id ? "text-white" : "text-black"} font-bold`}>₹ {item.amount}</Text>
                <Text className={`text-[12px] ${selectedPaymentId === item?.id ? "text-white" : "text-black"}`}>{item.name}</Text>
                <Text className={`text-[12px] ${selectedPaymentId === item?.id ? "text-white" : "text-black"}`}>{item.validity_days} days</Text>
            </TouchableOpacity>
        </View>
    )
}

export default PaymentRender;