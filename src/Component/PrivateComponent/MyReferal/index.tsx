import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../../../Common/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from "react-native-vector-icons/Ionicons";
import { showError } from "../../../Common/ToastMessage";
import { referalHistoryService } from "./helper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { COLORS } from "../../../utils/ColorCode";

const GiftImg = require('../../../../assets/Imgs/Gift.png')

const MyReferal = () => {
    const value = "My Referal";
    const backNavigate = true;

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [referalHistory, setReferalHistory] = useState<any>(null);

    const [referalAmount, setReferalAmount] = useState<any>({
        pending: 0,
        confirm: 0
    })

    const copyToClipboard = () => {
        Clipboard.setString(userData?.referral_code);
    };

console.log(referalHistory);

    const fetchReferalHistory = async (token: any) => {
        setLoading(true);

        try {
            const res = await referalHistoryService(token)
            const { data: { history = [], success = false } } = res

            if (success === true) {
                setReferalHistory(history)

                let pending = 0;
                let confirm = 0;

                history.forEach((item: any) => {
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
                showError("Error Referal History")
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false);
        }
    }

    const formatDateTime = (dateString: any) => {
        const date = new Date(dateString);

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        const getUserData = async () => {
            const user: any = await AsyncStorage.getItem("UserData");
            const token: any = await AsyncStorage.getItem("token")

            if (user) {
                setUserData(JSON.parse(user));
                await fetchReferalHistory(token)
            }
        }

        getUserData();
    }, []);

    return (
        <View className="flex-1" style={{backgroundColor: COLORS.primary}}>
            <View className="flex-1">
                <Header value={value} backNavigate={backNavigate} />
            </View>

            <View className="flex-[9] bg-white rounded-t-[30px]">
                <View className="w-full p-5 rounded-b-[30px]" style={{backgroundColor:COLORS.primary}}>
                    <View className="mt-1">
                        <Text className="text-white font-bold text-[25px] text-center">Referal Your Friend And Earn</Text>
                    </View>

                    <View className="mt-2 w-full justify-center items-center">
                        <View>
                            <Image
                                source={GiftImg}
                                style={{ width: 120, height: 120, resizeMode: "contain" }}
                            />
                        </View>

                        <View className="flex-row justify-between mt-2 px-2 w-full">
                            <View className="items-center">
                                <Text className="text-white font-bold">Pending</Text>
                                <Text className="text-white text-[18px]">
                                    ₹{referalAmount.pending}
                                </Text>
                            </View>

                            <View className="items-center">
                                <Text className="text-white font-bold">Confirmed</Text>
                                <Text className="text-white text-[18px]">
                                    ₹{referalAmount.confirm}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-5 border-dashed flex-row w-full border-white border-[1px] p-3">
                        <View className="w-[60%] justify-center items-center border-dashed border-r-[1px] border-white">
                            <Text className="text-white font-semibold text-[16px]">Your Refer Code</Text>
                            <Text className="text-white font-bold text-[25px] mt-2">{userData?.referral_code}</Text>
                        </View>

                        <View className="w-[40%] justify-center items-center">
                            <TouchableOpacity onPress={copyToClipboard}>
                                <Text className="text-white font-bold text-[20px]">Copy Code</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="mt-1 w-full p-2">
                    <Text className="text-black font-bold text-[14px]">My Referal History</Text>
                    <View className="p-2">
                        <FlatList
                            data={referalHistory || []}
                            keyExtractor={(item, index) =>
                                item.id?.toString() || index.toString()
                            }
                            renderItem={({ item }) => (
                                <View className="w-full flex-row border border-gray-300 bg-white rounded-lg p-3 mb-2">
                                    <View className="w-[80%]">
                                        <Text className="text-black font-semibold">
                                            Name : {item.referee_name}
                                        </Text>

                                        <Text className="text-gray-500 font-bold">
                                            Joined : {formatDateTime(item.created_at)}
                                        </Text>

                                        <Text className="text-green-600 font-bold mt-1">
                                            {item.status}
                                        </Text>
                                    </View>

                                    <View className="w-[20%] justify-center items-center">
                                        <Text className="text-black font-bold text-[12px]">{item?.rides_completed} / 5</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                <View className="items-center mt-10">
                                    <Text className="text-gray-500">
                                        No referral history found
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

export default MyReferal