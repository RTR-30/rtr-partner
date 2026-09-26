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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { TopUpService, TopUpVerifyService, UpdateBankDetailsService, UserDetailsService, walletService, WithdrawRequestService } from "./helper";
import RenderPayment from "./renderPayment";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import Loader from "../../../Common/Loader";
import {
    CFErrorResponse,
    CFPaymentGatewayService,
} from "react-native-cashfree-pg-sdk";

import {
    CFEnvironment,
    CFSession,
} from "cashfree-pg-api-contract";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { openCashfreePayment } from "../../../utils/secureFile";

const PaymentScreen = () => {
    const value = "My Wallet";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>({});
    const [walletData, setWalletData] = useState<any>([]);

    const [topUp, setTopUp] = useState<any>({
        amount: ''
    });
    const [withdraw, setWithdraw] = useState<any>({
        amount: 0,
        accountNumber: "",
        ifsc: "",
        accountName: "",
        upi: "",
        branch: ""
    })

    const [showTopUp, setShowTopup] = useState<boolean>(false);
    const [showWithdraw, setShowWithdraw] = useState<boolean>(false);
    const [amountCount, setAmountCount] = useState<any>('');

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
            amount: 0,
        });
        setErrorMsg({
            topUp: '',
            withdraw: '',
        });
    }

    const goToRequestList = () => {
        navigation.navigate("RequestList")
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

    const updateBankDetails = async () => {
        if (!withdraw?.accountNumber || !withdraw?.ifsc || !withdraw?.accountName ||
            !withdraw?.upi || !withdraw?.branch
        ) {
            showError("Fill all require details")
            return
        }

        setLoading(true)
        const payload = {
            bank_account_number: withdraw?.accountNumber,
            bank_ifsc: withdraw?.ifsc,
            bank_account_name: withdraw?.accountName,
            bank_upi: withdraw?.upi,
            bank_branch: withdraw?.branch
        }

        try {
            const res = await UpdateBankDetailsService(payload)
            const { data: { message = "", success = false } } = res;

            if (success === true) {
                handleWithdrawRequest();
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false)
        }
    }

    const handleWithdrawRequest = async () => {
        setLoading(true)
        const payload = {
            amount: withdraw?.amount
        }
        try {
            const res = await WithdrawRequestService(payload);
            const { data: { message = '', success = false } } = res;

            if (success === true) {
                showSuccess(message)
                closeWithdraw()
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const SubmitTopup = async () => {
        setLoading(true)
        setErrorMsg({ topUp: '', withdraw: '' });
        const payload = {
            amount: topUp?.amount
        }
        try {
            const res = await TopUpService(payload);
            const { data: { success = false, payment_link = "", message = "", link_id = "", order_id = "", session_id = "" } } = res

            if (success === true) {
                await AsyncStorage.setItem("cashfree_link_id", String(link_id));
                await openCashfreePayment(order_id, session_id);
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

    useEffect(() => {
        const initializeCashfree = async () => {
            try {
                CFPaymentGatewayService.setCallback({
                    onVerify: async (orderID: string) => {
                        const linkId = await AsyncStorage.getItem("cashfree_link_id");

                        if (!linkId) {
                            showError("Payment link ID not found");
                            return;
                        }
                        showSuccess("payment done");
                        handleWallet();
                        fetchUserDetails();
                        closeTopUp();

                    },

                    onError: (error: CFErrorResponse, orderID: string) => {
                        setLoading(false);
                        showError("Payment failed or cancelled");
                    },
                });
            } catch (error) {
                showError(error);
            }
        };

        initializeCashfree();

        return () => {
            CFPaymentGatewayService.removeCallback();
        };
    }, []);

    useEffect(() => {
        if (userData) {

            setWithdraw((prev: any) => ({
                ...prev,
                accountNumber: userData?.bank_account_number ?? "",
                ifsc: userData?.bank_ifsc ?? "",
                accountName: userData?.bank_account_name ?? "",
                upi: userData?.bank_upi ?? "",
                branch: userData?.bank_branch ?? "",
            }));
        }
    }, [userData]);


    useFocusEffect(
        React.useCallback(() => {
            fetchUserDetails();
            handleWallet();
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
            <View className="rounded-t-[40px] p-3 bg-[#fff]" style={{ flex: 9 }}>
                <View className="w-full bg-white p-1 flex-row justify-between">
                    <View className="my-2 w-[45%] border-[2px] justify-center items-center rounded-xl p-2" style={{ backgroundColor: "#FFF", elevation: 3, borderColor: COLORS?.primary }}>
                        <Text className="text-black text-[12px] font-medium text-center">Wallet Balance</Text>
                        <Text className="text-[14px] font-bold text-center" style={{ color: COLORS.primary }}>₹{userData?.wallet_balance}</Text>
                    </View>

                    <View className="my-2 w-[45%] border-[2px] justify-center items-center rounded-xl p-2" style={{ backgroundColor: "#FFF", elevation: 3, borderColor: COLORS?.primary }}>
                        <Text className="text-black text-[12px] font-medium text-center">Total Transaction</Text>
                        <Text className="text-[14px] font-bold text-center" style={{ color: COLORS.primary }}>₹{totalAmount}</Text>
                    </View>
                </View>

                <View className="w-full bg-white p-1 flex-row justify-around">
                    <View className="w-[30%] h-10 rounded-lg" style={{ backgroundColor: COLORS?.primary }}>
                        <TouchableOpacity onPress={() => openTopUp()} className="w-full h-full justify-center items-center">
                            <Text className="text-white text-[12px] font-bold text-center">Top Up</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="w-[30%] h-10 rounded-lg" style={{ backgroundColor: COLORS?.primary }}>
                        <TouchableOpacity onPress={() => openWithdraw()} className="w-full h-full justify-center items-center">
                            <Text className="text-white text-[12px] font-bold text-center">Withdraw</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="w-[30%] h-10 rounded-lg" style={{ backgroundColor: COLORS?.primary }}>
                        <TouchableOpacity onPress={goToRequestList} className="w-full h-full justify-center items-center">
                            <Text className="text-white text-[12px] font-bold text-center">Request List</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="w-full flex-1">
                    <View className="mt-2 w-full justify-center items-center">
                        <Text className="text-center text-black text-[12px] font-bold">Transaction History</Text>
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
                                    <Text style={{ flex: 1, color: "#fff", fontWeight: "700", fontSize: 14 }}>Description</Text>
                                    <Text style={{ flex: 1, color: "#fff", fontWeight: "700", fontSize: 14 }}>Date & Time</Text>
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

                        <Text className="text-black text-[16px] font-medium mb-2">Bank Account Name *</Text>
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

                        <Text className="text-black text-[16px] font-medium mb-2">Bank Account Number *</Text>
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

                        <Text className="text-black text-[16px] font-medium mb-2">Bank IFSC *</Text>
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

                        <Text className="text-black text-[16px] font-medium mb-2">Bank Branch *</Text>
                        <TextInput
                            value={withdraw.branch}
                            onChangeText={(text) => {
                                setWithdraw({
                                    ...withdraw,
                                    branch: text.toUpperCase(),
                                });
                            }}
                            placeholder="Enter Branch"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            className="w-full h-12 text-black text-[16px] px-3 rounded-xl mb-4"
                            style={{ borderWidth: 1, borderColor: COLORS.primary }}
                        />

                        <Text className="text-black text-[16px] font-medium mb-2">Gpay number *</Text>
                        <TextInput
                            value={withdraw.upi}
                            onChangeText={(text) => {
                                setWithdraw({
                                    ...withdraw,
                                    upi: text.toUpperCase(),
                                });
                            }}
                            placeholder="Enter Gpay Number"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            keyboardType="numeric"
                            className="w-full h-12 text-black text-[16px] px-3 rounded-xl mb-4"
                            style={{ borderWidth: 1, borderColor: COLORS.primary }}
                        />

                        <Text className="text-black text-[16px] font-medium mb-2">Enter Withdraw Amount</Text>
                        <View className="w-full rounded-xl flex-row justify-around items-center">
                            {/* ₹100 */}
                            <View className="rounded-xl p-2 w-[25%] justify-center items-center" style={{ borderColor: COLORS.primary, borderWidth: 1 }}>
                                <Text className="text-[16px] text-black font-bold">₹100</Text>
                            </View>

                            <Text className="text-[20px] text-black font-bold">X</Text>

                            {/* Count */}
                            <View className="rounded-xl w-[25%]" style={{ borderColor: COLORS.primary, borderWidth: 1 }} >
                                <TextInput
                                    value={amountCount}
                                    onChangeText={(text) => {
                                        const numericValue = text.replace(/[^0-9]/g, "");
                                        setAmountCount(numericValue);
                                        const count = Number(numericValue);
                                        setWithdraw({
                                            ...withdraw,
                                            amount: count > 0 ? String(count * 100) : "",
                                        });
                                        setErrorMsg({
                                            ...errorMsg,
                                            withdraw: "",
                                        });
                                    }}
                                    placeholder="Count"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    className="text-black text-[16px] font-bold"
                                />
                            </View>

                            <Text className="text-[20px] text-black font-bold">=</Text>

                            {/* Total */}
                            <View className="rounded-xl p-2 w-[25%] justify-center items-center" style={{ borderColor: COLORS.primary, borderWidth: 1 }}>
                                <Text className="text-[16px] text-black font-bold">₹{Number(amountCount || 0) * 100}</Text>
                            </View>
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
                                    if (!Number(withdraw?.amount) || enteredAmount <= 0) {
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

                                    updateBankDetails()

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

