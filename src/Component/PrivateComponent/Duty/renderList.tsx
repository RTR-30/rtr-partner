import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    ToastAndroid
} from 'react-native';

import notifee from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import LocalNotification from "../../../Common/Notification/index";

import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { UpdateBooking } from "./helper";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const RenderList = ({ item, setShowLoader }: any) => {
    const navigation: any = useNavigation();
    const [userData, setUserData] = useState<any>(null);

    const fetchUpdate = async () => {
        setShowLoader(true);
        const data = {
            bookingId: item.Id
        }

        try {
            const res = await UpdateBooking(data)
            showSuccess(res?.data.message);
            navigation.navigate("MyDuty");
        } catch (error:any) {
            showError(error)
        } finally {
            setShowLoader(false);
        }
    }

    const formatDateTime = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            ...(includeTime && {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        });
    };

    const formatEndDate = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };
    
    return (
        <View className="w-full mb-3 rounded-2xl border-black shadow-black border-[0.1px] bg-white" style={{ elevation: 3 }}>
            <View className="flex-row w-full justify-center rounded-t-2xl items-center">
                <View className="w-[50%] p-2 bg-green-600 rounded-tl-2xl border-[0.3px]">
                    <Text className="text-white font-bold text-[18px] text-center">{item.Status}</Text>
                </View>

                <View className="w-[50%] p-2 bg-yellow-300 rounded-tr-2xl border-[0.3px]">
                    <Text className={`text-black font-bold text-[18px] text-center`}>Total   ₹ {item.EstimateAmount}</Text>
                </View>
            </View>

            <View className="flex-row w-full mt-2 p-1">
                <View className="w-[50%] justify-center items-center">
                    <Text className="text-black font-bold text-[14px]">Start Date</Text>
                    <Text className="text-blue-600 font-bold text-[14px]">{formatDateTime(item?.StartDate)}</Text>
                </View>

                {
                    item.EndDate && (
                        <View className="w-[50%] justify-center items-center">
                            <Text className="text-black font-bold text-[14px]">End Date</Text>
                            <Text className="text-blue-600 font-bold text-[14px]">{formatEndDate(item.EndDate)}</Text>
                        </View>
                    )
                }
            </View>

            <View className="w-full p-2">
                <View className="w-full flex-row">
                    <View className="w-[100%]">
                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Name</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.Name}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Address</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.Address}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Hours</Text>
                            </View>
                            <View className="w-[75%]]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.Hours}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Gear Type</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.GearType}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Payment Status</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className={`${item.PaymentStatus === "UnPaid" ? "text-red-600" : "text-green-600"} font-bold text-[14px]`}> :   {item.PaymentStatus}</Text>
                            </View>
                        </View>
                    </View>

                    {/* <View className="w-[20%] justify-center items-center">
                        <View className="mt-1 w-full">
                            <TouchableOpacity className="bg-[#5a639c] rounded-[10px] w-full h-[40px] justify-center items-center">
                                <Ionicons name="call" size={20} color={"white"} />
                            </TouchableOpacity>
                        </View>

                        <View className="mt-5 w-full">
                            <TouchableOpacity className="bg-[#5a639c] rounded-[10px] w-full h-[40px] justify-center items-center">
                                <Text className="text-white text-center font-bold text-[16px]">View</Text>
                            </TouchableOpacity>
                        </View>
                    </View> */}
                </View>
            </View>

            <View className="p-2 w-full justify-around flex-row items-center">
                <TouchableOpacity onPress={()=>fetchUpdate()} className="w-[70%] justify-center items-center bg-[#5a639c] rounded-xl">
                    <Text className="text-center text-white font-bold text-[18px]">Click Here To Accept</Text>
                </TouchableOpacity>
            </View>
        </View >
    );
};

export default RenderList;