import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    Text,
    Image,
    ToastAndroid,
    TouchableOpacity,
    Modal,
    TextInput,
    Linking,
    Alert,
} from "react-native";
import Header from "../../../Common/Header";
import { paymentCard } from "../../../Common/images";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TopUpService, TopUpVerifyService, UserDetailsService, walletService } from "./helper";
import RenderPayment from "./renderPayment";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";
import Loader from "../../../Common/Loader";

const PaymentScreen = () => {
    const value = "My Wallet"
    const [loading, setLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>({});
    const [walletData, setWalletData] = useState<any>([]);

    const [topUp, setTopUp] = useState<any>({
        amount: ''
    });
    const [linkIds, setLinkIds] = useState<any>(null)
    const [withdraw, setWithdraw] = useState<any>({
        amount: '',
        accountNumber: userData?.bank_account_number,
        ifsc: userData?.bank_ifsc,
        accountName: userData?.bank_account_name
    })

    const [showTopUp, setShowTopup] = useState<boolean>(false);
    const [showWithdraw, setShowWithdraw] = useState<boolean>(false);

    const [verifyTopUp, setVerifyTopUp] = useState<boolean>(false);

    const [errorMsg, setErrorMsg] = useState<any>({
        topUp: '',
        withdraw: ''
    })

    const openTopUp = () => {
        const balance = Number(userData?.wallet_balance ?? 0);
        setTopUp({
            amount: balance < 0 ? String(Math.abs(balance)) : "50",
        });
        setShowTopup(true);
    }

    const closeTopUp = () => {
        setShowTopup(false);
        setErrorMsg({
            topUp: '',
            withdraw: '',
        });
        setTopUp({
            amount: "",
        });
    }

    const openWithdraw = () => {
        setShowWithdraw(true);
    }

    const closeWithdraw = () => {
        setShowWithdraw(false);
        setWithdraw({
            amount: "",
        });
        setErrorMsg({
            topUp: '',
            withdraw: '',
        });
    }

    const totalAmount = (walletData ?? [])
        .filter((payment: any) => payment.status === "SUCCESS")
        .reduce(
            (sum: number, payment: any) => sum + parseFloat(payment.amount),
            0
        );


    const TopUpVerify = async (linkIdss: any) => {
        setLoading(true);
        const payload = {
            linkId: linkIdss
        }
        try {
            const res = await TopUpVerifyService(payload);
            const { data: { message = '', success = false } } = res;

            if (success === true) {
                setVerifyTopUp(false);
                setLinkIds(null);
                handleWallet();
                fetchUserDetails();
                closeTopUp();
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const openCashfreePayment = async (paymentLink: string) => {
        try {

            if (!paymentLink) {
                Alert.alert("Error", "Payment link is empty");
                return;
            }

            setVerifyTopUp(true);
            await Linking.openURL(paymentLink);
        } catch (error: any) {

            Alert.alert(
                "Payment Error",
                error?.message || "Unable to open Cashfree payment"
            );
        }
    };

    const SubmitTopup = async () => {
        setLoading(true)
        setErrorMsg({
            topUp: '',
            withdraw: '',
        });
        const payload = {
            amount: topUp?.amount
        }
        try {
            const res = await TopUpService(payload);
            const { data: { success = false, payment_link = "", message = "", link_id = "" } } = res

            if (success === true) {
                setLinkIds(link_id)
                await openCashfreePayment(payment_link)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleWallet = async () => {
        setLoading(true)
        try {
            const res = await walletService();
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
    };

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const res = await UserDetailsService();
            console.log(res);
            const { data: { success = false, user = {} } } = res

            if (success === true) {
                setUserData(user)

            } else {
                showError("user details error")
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchUserDetails();
            // handleWallet();
        }, [])
    );
    return (
        <View className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <View className="flex-1">
                <Header value={value} />
            </View>

            {loading && (
                <View className="h-full w-full absolute" style={{ zIndex: 999 }}>
                    <Loader />
                </View>
            )}
            <View className="flex-[9] rounded-t-[40px] p-3 bg-[#fff]">
                <View className="w-full bg-white p-2 flex-row justify-between">
                    <View className="my-2 w-[45%] border-[2px] justify-center items-center rounded-xl p-2" style={{ backgroundColor: "#FFF", elevation: 3, borderColor: COLORS?.primary }}>
                        <Text className="text-black text-[18px] font-medium text-center">Wallet Balance</Text>
                        <Text className="text-[24px] font-bold text-center" style={{ color: COLORS.primary }}>₹{userData?.wallet_balance}</Text>
                    </View>

                    <View className="my-2 w-[45%] border-[2px] justify-center items-center rounded-xl p-2" style={{ backgroundColor: "#FFF", elevation: 3, borderColor: COLORS?.primary }}>
                        <Text className="text-black text-[18px] font-medium text-center">Total Transaction</Text>
                        <Text className="text-[24px] font-bold text-center" style={{ color: COLORS.primary }}>₹{totalAmount}</Text>
                    </View>
                </View>

                <View className="w-full bg-white p-2 flex-row justify-around">
                    <View className="w-[30%] h-12 rounded-lg" style={{ backgroundColor: COLORS?.primary }}>
                        <TouchableOpacity onPress={() => openTopUp()} className="w-full h-full justify-center items-center">
                            <Text className="text-white text-[18px] font-bold text-center">Top Up</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="w-[30%] h-12 rounded-lg" style={{ backgroundColor: COLORS?.primary }}>
                        <TouchableOpacity onPress={() => openWithdraw()} className="w-full h-full justify-center items-center">
                            <Text className="text-white text-[18px] font-bold text-center">Withdraw</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="w-[30%] h-12 rounded-lg" style={{ backgroundColor: COLORS?.primary }}>
                        <TouchableOpacity className="w-full h-full justify-center items-center">
                            <Text className="text-white text-[18px] font-bold text-center">Request List</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="w-full">
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
                                        flexDirection: "row", backgroundColor: "#1E293B", paddingVertical: 12, paddingHorizontal: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 5,
                                    }}
                                >
                                    <Text style={{ flex: 1, color: "#fff", fontWeight: "700", fontSize: 14 }}>Amount</Text>
                                    <Text style={{ flex: 1, color: "#fff", fontWeight: "700", fontSize: 14 }}>Payment Method</Text>
                                    <Text style={{ flex: 1, color: "#fff", fontWeight: "700", fontSize: 14, textAlign: "right" }}>Date & Time</Text>
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

            <Modal
                visible={showTopUp}
                transparent={true}
                animationType="fade"
                onRequestClose={closeTopUp}
            >
                <View
                    className="flex-1 justify-center items-center px-5"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", }}
                >
                    <View
                        className="w-full rounded-2xl p-5"
                        style={{ backgroundColor: "#fff", elevation: 5, }}
                    >
                        <Text className="text-black text-[22px] font-bold text-center mb-5">Top Up Wallet</Text>
                        <Text className="text-black text-[16px] font-medium mb-2">Enter Amount</Text>

                        <View
                            className="flex-row items-center rounded-xl px-3"
                            style={{ borderWidth: 1, borderColor: COLORS.primary, }}
                        >
                            <Text className="text-black text-[18px] font-bold mr-2">₹</Text>

                            <TextInput
                                value={topUp.amount}
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/[^0-9]/g, "");
                                    setTopUp({
                                        ...topUp,
                                        amount: numericValue,
                                    });
                                }}
                                placeholder="Enter amount"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                className="flex-1 text-black text-[18px]"
                            />

                        </View>
                        {errorMsg.topUp ? (
                            <Text className="text-red-600 text-[14px] font-medium mt-2">
                                {errorMsg.topUp}
                            </Text>
                        ) : null}

                        <View className="flex-row justify-between mt-6">
                            <TouchableOpacity
                                onPress={closeTopUp}
                                className="w-[45%] h-12 rounded-xl justify-center items-center"
                                style={{ backgroundColor: "#E5E7EB" }}
                            >
                                <Text className="text-black text-[16px] font-bold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (!topUp.amount || Number(topUp.amount) <= 0) {
                                        setErrorMsg({
                                            topUp: "Please enter a valid amount",
                                            withdraw: '',
                                        });
                                        return;
                                    }
                                    const walletBalance = Number(userData?.wallet_balance || 0);
                                    const enteredAmount = Number(topUp.amount);

                                    // Wallet balance >= 0 → minimum ₹50
                                    if (walletBalance >= 0 && enteredAmount < 50) {
                                        setErrorMsg({
                                            topUp: "Minimum top-up amount is ₹50",
                                            withdraw: '',
                                        });
                                        return;
                                    }

                                    if (walletBalance < 0) {
                                        const requiredTopUp = Math.ceil(
                                            Math.abs(walletBalance) * 0.75
                                        );
                                        if (enteredAmount < requiredTopUp) {
                                            setErrorMsg({
                                                topUp: `Minimum top-up amount is ₹${requiredTopUp}`,
                                                withdraw: '',
                                            });
                                            return;
                                        }
                                    }

                                    SubmitTopup();
                                }}
                                className="w-[45%] h-12 rounded-xl justify-center items-center"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Text className="text-white text-[16px] font-bold">Continue</Text>
                            </TouchableOpacity>
                        </View>

                        {verifyTopUp &&
                            <View className="mt-2 p-2 justify-center items-center">
                                <Text className="text-black text-[16px] font-bold">Once Payment Done Check To Verify</Text>
                                <TouchableOpacity onPress={() => TopUpVerify(linkIds)}>
                                    <Text className="text-[16px] font-bold" style={{ color: COLORS.primary }}>Verify</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showWithdraw}
                transparent={true}
                animationType="fade"
                onRequestClose={closeWithdraw}
            >
                <View className="flex-1 justify-center items-center px-5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View className="w-full rounded-2xl p-5" style={{ backgroundColor: "#fff", elevation: 5 }}>
                        <Text className="text-black text-[22px] font-bold text-center mb-5">Withdraw Wallet</Text>

                        <Text className="text-black text-[16px] font-medium mb-2">Bank Account Name</Text>
                        <TextInput
                            value={withdraw.accountName}
                            onChangeText={(text) => {
                                setWithdraw({
                                    ...withdraw,
                                    accountName: text,
                                });
                            }}
                            placeholder="Enter account name"
                            placeholderTextColor="#999"
                            className="w-full h-12 text-black text-[16px] px-3 rounded-xl mb-4"
                            style={{ borderWidth: 1, borderColor: COLORS.primary }}
                        />

                        <Text className="text-black text-[16px] font-medium mb-2">Bank Account Number</Text>
                        <TextInput
                            value={withdraw.accountNumber}
                            onChangeText={(text) => {
                                const numericValue = text.replace(/[^0-9]/g, "");

                                setWithdraw({
                                    ...withdraw,
                                    accountNumber: numericValue,
                                });
                            }}
                            placeholder="Enter account number"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            className="w-full h-12 text-black text-[16px] px-3 rounded-xl mb-4"
                            style={{ borderWidth: 1, borderColor: COLORS.primary }}
                        />

                        <Text className="text-black text-[16px] font-medium mb-2">Bank IFSC</Text>
                        <TextInput
                            value={withdraw.ifsc}
                            onChangeText={(text) => {
                                setWithdraw({
                                    ...withdraw,
                                    ifsc: text.toUpperCase(),
                                });
                            }}
                            placeholder="Enter IFSC code"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            className="w-full h-12 text-black text-[16px] px-3 rounded-xl mb-4"
                            style={{ borderWidth: 1, borderColor: COLORS.primary }}
                        />

                        <Text className="text-black text-[16px] font-medium mb-2">Enter Withdraw Amount</Text>
                        <View className="flex-row items-center rounded-xl px-3" style={{ borderWidth: 1, borderColor: COLORS.primary }}>
                            <Text className="text-black text-[18px] font-bold mr-2">₹</Text>

                            <TextInput
                                value={withdraw.amount}
                                onChangeText={(text) => {
                                    const numericValue = text.replace(/[^0-9]/g, "");

                                    setWithdraw({
                                        ...withdraw,
                                        amount: numericValue,
                                    });

                                    setErrorMsg({
                                        ...errorMsg,
                                        withdraw: "",
                                    });
                                }}
                                placeholder="Enter amount"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                className="flex-1 text-black text-[18px]"
                            />
                        </View>

                        {errorMsg.withdraw ? (
                            <Text className="text-red-600 text-[14px] font-medium mt-2">{errorMsg.withdraw}</Text>
                        ) : null}

                        <Text className="text-gray-500 text-[13px] mt-2">Withdrawal amount must be in multiples of ₹100</Text>
                        <View className="flex-row justify-between mt-6">

                            {/* Cancel */}
                            <TouchableOpacity onPress={closeWithdraw} className="w-[45%] h-12 rounded-xl justify-center items-center" style={{ backgroundColor: "#E5E7EB" }}>
                                <Text className="text-black text-[16px] font-bold">Cancel</Text>
                            </TouchableOpacity>

                            {/* Withdraw */}
                            <TouchableOpacity
                                onPress={() => {
                                    const enteredAmount = Number(withdraw?.amount);
                                    const walletBalance = Number(
                                        userData?.wallet_balance ?? 0
                                    );

                                    // Empty validation
                                    if (!withdraw?.amount || enteredAmount <= 0) {
                                        setErrorMsg({
                                            ...errorMsg,
                                            withdraw: "Please enter a valid amount",
                                        });
                                        return;
                                    }

                                    // Minimum ₹100
                                    if (enteredAmount < 100) {
                                        setErrorMsg({
                                            ...errorMsg,
                                            withdraw:
                                                "Minimum withdrawal amount is ₹100",
                                        });
                                        return;
                                    }

                                    // Only ₹100 multiples
                                    if (enteredAmount % 100 !== 0) {
                                        setErrorMsg({
                                            ...errorMsg,
                                            withdraw: "Withdrawal amount must be in multiples of ₹100",
                                        });
                                        return;
                                    }

                                    // Balance validation
                                    if (enteredAmount > walletBalance) {
                                        setErrorMsg({
                                            ...errorMsg,
                                            withdraw: "Insufficient wallet balance",
                                        });
                                        return;
                                    }

                                }}
                                className="w-[45%] h-12 rounded-xl justify-center items-center" style={{ backgroundColor: COLORS.primary }}
                            >
                                <Text className="text-white text-[16px] font-bold">Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PaymentScreen;

