import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    Text,
    Image,
    ToastAndroid,
} from "react-native";
import Header from "../../../Common/Header";
import { paymentCard } from "../../../Common/images";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { walletService } from "./helper";
import RenderPayment from "./renderPayment";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";

const PaymentScreen = () => {
    const value = "My Wallet"
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [walletData, setWalletData] = useState<any>([]);

    const totalAmount = (walletData ?? [])
        .filter((payment: any) => payment.status === "SUCCESS")
        .reduce(
            (sum: number, payment: any) => sum + parseFloat(payment.amount),
            0
        );

    const handleWallet = async (tokens: any) => {
        setLoading(true)
        try {
            const res = await walletService(tokens);
            const { data = [], message = "", success = false } = res?.data

            if (success === true) {
                setWalletData(data);
            } else {
                showError(message)
            }
        } catch (error: any) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserData = async () => {
        try {
            const tokens: any = await AsyncStorage.getItem("token");
            const userDatas: any = await AsyncStorage.getItem("UserData")
            if (tokens || userDatas) {
                const datas = JSON.parse(userDatas)
                await setToken(tokens);
                await setUserData(datas)
                await handleWallet(tokens);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );
    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <View className="flex-1">
                <Header value={value} />
            </View>

            <View className="flex-[9] rounded-t-[40px] p-3 bg-[#fff]">
                <View className="w-full h-[40%] bg-white">
                    <Image
                        source={paymentCard}
                        className="h-full w-full rounded-[20px]"
                        resizeMode="contain"
                    />

                    <View className="absolute ml-5 w-full mt-[10%]">
                        <Text className="text-white text-[18px] font-bold">{userData?.name}</Text>
                    </View>

                    <View className="absolute w-full mt-44 ml-5">
                        <Text className="text-white text-[18px] font-medium">Total Transaction</Text>
                        <Text className="text-white text-[28px] font-bold ml-5">₹{totalAmount}</Text>
                    </View>
                </View>

                <View className="w-full h-[60%]">
                    <View className="mt-2 w-full justify-center items-center">
                        <Text className="text-center text-black text-[18px] font-bold">Transaction History</Text>
                    </View>

                    {walletData.length === 0 ?
                        <Text className="text-center text-red-700 text-[18px] font-bold mt-10">No Transaction</Text> :
                        <FlatList
                            data={walletData}
                            keyExtractor={(item: any) => item.id.toString()}

                            ListHeaderComponent={() => (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        backgroundColor: "#1E293B",
                                        paddingVertical: 12,
                                        paddingHorizontal: 12,
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        marginBottom: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            flex: 1,
                                            color: "#fff",
                                            fontWeight: "700",
                                            fontSize: 14,
                                        }}
                                    >
                                        Amount
                                    </Text>

                                    <Text
                                        style={{
                                            flex: 1,
                                            color: "#fff",
                                            fontWeight: "700",
                                            fontSize: 14,
                                        }}
                                    >
                                        Payment Method
                                    </Text>

                                    <Text
                                        style={{
                                            flex: 1,
                                            color: "#fff",
                                            fontWeight: "700",
                                            fontSize: 14,
                                            textAlign: "right",
                                        }}
                                    >
                                        Date & Time
                                    </Text>
                                </View>
                            )}

                            renderItem={({ item }: any) => (
                                <RenderPayment item={item} />
                            )}

                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            style={{ marginTop: 10 }}
                        />
                    }
                </View>
            </View>
        </View>
    );
};

export default PaymentScreen;

