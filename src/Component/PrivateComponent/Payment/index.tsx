import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../Common/Header";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
    TopUpService,
    TopUpVerifyService,
    UpdateBankDetailsService,
    UserDetailsService,
    walletService,
    WithdrawRequestService,
} from "./helper";
import RenderPayment from "./renderPayment";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import {
    CFErrorResponse,
    CFPaymentGatewayService,
} from "react-native-cashfree-pg-sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { openCashfreePayment } from "../../../utils/secureFile";
import Ionicons from "react-native-vector-icons/Ionicons";

const PaymentScreen = () => {
    const value = "My Wallet";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>({});
    const [walletData, setWalletData] = useState<any>([]);

    const [topUp, setTopUp] = useState<any>({
        amount: "",
    });
    const [withdraw, setWithdraw] = useState<any>({
        amount: 0,
        accountNumber: "",
        ifsc: "",
        accountName: "",
        upi: "",
        branch: "",
    });

    const [showTopUp, setShowTopup] = useState<boolean>(false);
    const [showWithdraw, setShowWithdraw] = useState<boolean>(false);
    const [amountCount, setAmountCount] = useState<any>("");

    const [errorMsg, setErrorMsg] = useState<any>({
        topUp: "",
        withdraw: "",
    });

    const openTopUp = () => {
        const balance = Number(userData?.wallet_balance ?? 0);
        setTopUp({
            amount: balance < 0 ? String(Math.abs(balance)) : "50",
        });
        setShowTopup(true);
    };

    const closeTopUp = () => {
        setShowTopup(false);
        setErrorMsg({
            topUp: "",
            withdraw: "",
        });
        setTopUp({
            amount: "",
        });
    };

    const openWithdraw = () => {
        setShowWithdraw(true);
    };

    const closeWithdraw = () => {
        setShowWithdraw(false);
        setWithdraw((prev: any) => ({
            ...prev,
            amount: 0,
        }));
        setAmountCount("");
        setErrorMsg({
            topUp: "",
            withdraw: "",
        });
    };

    const goToRequestList = () => {
        navigation.navigate("RequestList");
    };

    const totalAmount = (walletData ?? [])
        .filter((payment: any) => payment.status === "SUCCESS")
        .reduce(
            (sum: number, payment: any) => sum + parseFloat(payment.amount || 0),
            0
        );

    const TopUpVerify = async (linkIdss: any) => {
        setLoading(true);

        const payload = {
            linkId: linkIdss,
        };

        try {
            const res = await TopUpVerifyService(payload);
            const {
                data: { message = "", success = false },
            } = res;

            if (success === true) {
                handleWallet();
                fetchUserDetails();
                closeTopUp();
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const updateBankDetails = async () => {
        if (
            !withdraw?.accountNumber ||
            !withdraw?.ifsc ||
            !withdraw?.accountName ||
            !withdraw?.upi ||
            !withdraw?.branch
        ) {
            showError("Fill all require details");
            return;
        }

        setLoading(true);
        const payload = {
            bank_account_number: withdraw?.accountNumber,
            bank_ifsc: withdraw?.ifsc,
            bank_account_name: withdraw?.accountName,
            bank_upi: withdraw?.upi,
            bank_branch: withdraw?.branch,
        };

        try {
            const res = await UpdateBankDetailsService(payload);
            const {
                data: { message = "", success = false },
            } = res;

            if (success === true) {
                handleWithdrawRequest();
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawRequest = async () => {
        setLoading(true);
        const payload = {
            amount: withdraw?.amount,
        };
        try {
            const res = await WithdrawRequestService(payload);
            const {
                data: { message = "", success = false },
            } = res;

            if (success === true) {
                showSuccess(message);
                closeWithdraw();
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const SubmitTopup = async () => {
        setLoading(true);
        setErrorMsg({ topUp: "", withdraw: "" });
        const payload = {
            amount: topUp?.amount,
        };
        try {
            const res = await TopUpService(payload);
            const {
                data: {
                    success = false,
                    payment_link = "",
                    message = "",
                    link_id = "",
                    order_id = "",
                    session_id = "",
                },
            } = res;

            if (success === true) {
                await AsyncStorage.setItem("cashfree_link_id", String(link_id));
                await openCashfreePayment(order_id, session_id);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWallet = async () => {
        setLoading(true);
        try {
            const res = await walletService();
            const { data = [], message = "", success = false } = res?.data;

            if (success === true) {
                setWalletData(data);
            } else {
                showError(message);
            }
        } catch (error: any) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const res = await UserDetailsService();
            const {
                data: { success = false, user = {} },
            } = res;

            if (success === true) {
                setUserData(user);
            } else {
                showError("user details error");
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

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
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View className="h-14 justify-center">
                <Header value={value} />
            </View>

            {/* Main Surface Card */}
            <View className="flex-1 rounded-t-[32px] p-4 bg-gray-50 overflow-hidden">
                {/* Metric Cards Row */}
                <View className="flex-row justify-between mb-3.5">
                    {/* Wallet Balance Card */}
                    <View
                        className="w-[48%] bg-white rounded-2xl p-3.5 border border-gray-200"
                        style={{ elevation: 3 }}
                    >
                        <View className="flex-row items-center mb-1.5">
                            <Ionicons
                                name="wallet-outline"
                                size={16}
                                color={COLORS.primary}
                                style={{ marginRight: 5 }}
                            />
                            <Text className="text-gray-500 text-xs font-semibold">
                                Wallet Balance
                            </Text>
                        </View>
                        <Text
                            className="text-lg font-black"
                            style={{ color: COLORS.primary }}
                        >
                            ₹{userData?.wallet_balance ?? 0}
                        </Text>
                    </View>

                    {/* Total Completed Volume Card */}
                    <View
                        className="w-[48%] bg-white rounded-2xl p-3.5 border border-gray-200"
                        style={{ elevation: 3 }}
                    >
                        <View className="flex-row items-center mb-1.5">
                            <Ionicons
                                name="swap-horizontal-outline"
                                size={16}
                                color="#059669"
                                style={{ marginRight: 5 }}
                            />
                            <Text className="text-gray-500 text-xs font-semibold">
                                Total Completed
                            </Text>
                        </View>
                        <Text className="text-lg font-black text-emerald-600">
                            ₹{totalAmount}
                        </Text>
                    </View>
                </View>

                {/* Quick Action Buttons */}
                <View className="flex-row justify-between mb-4">
                    {/* Top Up */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={openTopUp}
                        className="flex-1 py-3 px-2 rounded-xl items-center mr-2 flex-row justify-center"
                        style={{ backgroundColor: COLORS.primary, elevation: 3 }}
                    >
                        <Ionicons
                            name="add-circle"
                            size={16}
                            color="#FFF"
                            style={{ marginRight: 5 }}
                        />
                        <Text className="text-white text-xs font-extrabold">Top Up</Text>
                    </TouchableOpacity>

                    {/* Withdraw */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={openWithdraw}
                        className="flex-1 py-3 px-2 rounded-xl items-center mr-2 flex-row justify-center bg-slate-800"
                        style={{ elevation: 2 }}
                    >
                        <Ionicons
                            name="arrow-up-circle"
                            size={16}
                            color="#FFF"
                            style={{ marginRight: 5 }}
                        />
                        <Text className="text-white text-xs font-extrabold">Withdraw</Text>
                    </TouchableOpacity>

                    {/* Request List */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={goToRequestList}
                        className="flex-1 py-3 px-2 rounded-xl items-center flex-row justify-center bg-slate-800"
                        style={{ elevation: 2 }}
                    >
                        <Ionicons
                            name="receipt-outline"
                            size={16}
                            color="#FFF"
                            style={{ marginRight: 5 }}
                        />
                        <Text className="text-white text-xs font-extrabold">Requests</Text>
                    </TouchableOpacity>
                </View>

                {/* Transaction History Section */}
                <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-2.5 px-0.5">
                        <View className="flex-row items-center">
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color="#475569"
                                style={{ marginRight: 5 }}
                            />
                            <Text className="text-sm font-extrabold text-slate-800">
                                Transaction History
                            </Text>
                        </View>
                        {walletData.length > 0 && (
                            <View className="bg-slate-200 px-2 py-0.5 rounded-md">
                                <Text className="text-[10px] font-bold text-slate-700">
                                    {walletData.length} Records
                                </Text>
                            </View>
                        )}
                    </View>

                    {walletData.length === 0 ? (
                        <View className="flex-1 justify-center items-center py-10">
                            <View className="w-16 h-16 rounded-full bg-slate-100 justify-center items-center mb-3">
                                <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
                            </View>
                            <Text className="text-base font-bold text-slate-800 mb-1 text-center">
                                No Transactions Found
                            </Text>
                            <Text className="text-xs text-slate-500 text-center max-w-[260px] leading-5">
                                Your wallet top-ups, duty payouts, and withdrawals will appear here.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={walletData}
                            keyExtractor={(item: any, index: number) =>
                                String(item?.id ?? index)
                            }
                            ListHeaderComponent={() => (
                                <View className="flex-row bg-slate-800 py-3 px-3 rounded-t-xl mb-0.5">
                                    <Text className="flex-1 text-white font-bold text-xs">
                                        Amount
                                    </Text>
                                    <Text className="flex-1 text-white font-bold text-xs">
                                        Method
                                    </Text>
                                    <Text className="flex-1 text-white font-bold text-xs">
                                        Description
                                    </Text>
                                    <Text className="flex-1 text-white font-bold text-xs text-right">
                                        Date & Time
                                    </Text>
                                </View>
                            )}
                            renderItem={({ item }: any) => (
                                <RenderPayment item={item} />
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 24 }}
                        />
                    )}
                </View>
            </View>

            {/* Top Up Modal */}
            <Modal
                visible={showTopUp}
                transparent={true}
                animationType="fade"
                onRequestClose={closeTopUp}
            >
                <View className="flex-1 justify-center items-center px-5 bg-black/50">
                    <View
                        className="w-full bg-white rounded-3xl p-5"
                        style={{ elevation: 6 }}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-xl font-black text-gray-900">
                                Top Up Wallet
                            </Text>
                            <TouchableOpacity
                                onPress={closeTopUp}
                                className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
                            >
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Enter Amount (₹)
                        </Text>

                        <View
                            className="flex-row items-center border border-gray-300 rounded-xl px-3 bg-gray-50 h-12 mb-3"
                            style={{ height: 48 }}
                        >
                            <Text className="text-lg font-black text-gray-800 mr-2">₹</Text>
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
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                className="flex-1 text-base font-bold text-gray-900"
                            />
                        </View>

                        {/* Quick Presets */}
                        <View className="flex-row justify-between mb-3">
                            {["50", "100", "200", "500"].map((preset) => (
                                <TouchableOpacity
                                    key={preset}
                                    onPress={() => setTopUp({ amount: preset })}
                                    className="py-1.5 px-3 rounded-lg border border-gray-200 bg-gray-50"
                                >
                                    <Text className="text-xs font-bold text-gray-700">
                                        + ₹{preset}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {errorMsg.topUp ? (
                            <View className="bg-red-50 p-2 rounded-lg mb-3">
                                <Text className="text-red-600 text-xs font-semibold">
                                    {errorMsg.topUp}
                                </Text>
                            </View>
                        ) : null}

                        <View className="flex-row justify-between mt-2">
                            <TouchableOpacity
                                onPress={closeTopUp}
                                className="w-[46%] h-12 rounded-xl justify-center items-center bg-gray-100"
                            >
                                <Text className="text-sm font-bold text-gray-700">
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (!topUp.amount || Number(topUp.amount) <= 0) {
                                        setErrorMsg({
                                            topUp: "Please enter a valid amount",
                                            withdraw: "",
                                        });
                                        return;
                                    }
                                    const walletBalance = Number(
                                        userData?.wallet_balance || 0
                                    );
                                    const enteredAmount = Number(topUp.amount);

                                    // Wallet balance >= 0 → minimum ₹50
                                    if (walletBalance >= 0 && enteredAmount < 50) {
                                        setErrorMsg({
                                            topUp: "Minimum top-up amount is ₹50",
                                            withdraw: "",
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
                                                withdraw: "",
                                            });
                                            return;
                                        }
                                    }

                                    SubmitTopup();
                                }}
                                className="w-[46%] h-12 rounded-xl justify-center items-center"
                                style={{ backgroundColor: COLORS.primary, elevation: 3 }}
                            >
                                <Text className="text-white text-sm font-extrabold">
                                    Continue
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                visible={showWithdraw}
                transparent={true}
                animationType="fade"
                onRequestClose={closeWithdraw}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="flex-1 justify-center items-center px-5 bg-black/50"
                >
                    <View
                        className="w-full bg-white rounded-3xl p-5 max-h-[90%]"
                        style={{ elevation: 6 }}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-xl font-black text-gray-900">
                                Withdraw Wallet
                            </Text>
                            <TouchableOpacity
                                onPress={closeWithdraw}
                                className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
                            >
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-xs font-bold text-gray-700 mb-1">
                                Bank Account Name *
                            </Text>
                            <TextInput
                                value={withdraw.accountName}
                                onChangeText={(text) => {
                                    setWithdraw({
                                        ...withdraw,
                                        accountName: text,
                                    });
                                }}
                                placeholder="Enter account name"
                                placeholderTextColor="#9CA3AF"
                                className="w-full h-11 text-gray-900 text-sm px-3 rounded-xl mb-3 border border-gray-300 bg-gray-50"
                            />

                            <Text className="text-xs font-bold text-gray-700 mb-1">
                                Bank Account Number *
                            </Text>
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
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                className="w-full h-11 text-gray-900 text-sm px-3 rounded-xl mb-3 border border-gray-300 bg-gray-50"
                            />

                            <View className="flex-row justify-between mb-3">
                                <View className="w-[48%]">
                                    <Text className="text-xs font-bold text-gray-700 mb-1">
                                        Bank IFSC *
                                    </Text>
                                    <TextInput
                                        value={withdraw.ifsc}
                                        onChangeText={(text) => {
                                            setWithdraw({
                                                ...withdraw,
                                                ifsc: text.toUpperCase(),
                                            });
                                        }}
                                        placeholder="Enter IFSC code"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                        className="w-full h-11 text-gray-900 text-sm px-3 rounded-xl border border-gray-300 bg-gray-50"
                                    />
                                </View>

                                <View className="w-[48%]">
                                    <Text className="text-xs font-bold text-gray-700 mb-1">
                                        Bank Branch *
                                    </Text>
                                    <TextInput
                                        value={withdraw.branch}
                                        onChangeText={(text) => {
                                            setWithdraw({
                                                ...withdraw,
                                                branch: text.toUpperCase(),
                                            });
                                        }}
                                        placeholder="Enter Branch"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="characters"
                                        className="w-full h-11 text-gray-900 text-sm px-3 rounded-xl border border-gray-300 bg-gray-50"
                                    />
                                </View>
                            </View>

                            <Text className="text-xs font-bold text-gray-700 mb-1">
                                Gpay number *
                            </Text>
                            <TextInput
                                value={withdraw.upi}
                                onChangeText={(text) => {
                                    setWithdraw({
                                        ...withdraw,
                                        upi: text.toUpperCase(),
                                    });
                                }}
                                placeholder="Enter Gpay Number"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                keyboardType="numeric"
                                className="w-full h-11 text-gray-900 text-sm px-3 rounded-xl mb-3 border border-gray-300 bg-gray-50"
                            />

                            <Text className="text-xs font-bold text-gray-700 mb-1">
                                Enter Withdraw Amount
                            </Text>
                            <View className="w-full rounded-xl flex-row justify-around items-center p-2 bg-gray-50 border border-gray-300 mb-1">
                                {/* ₹100 */}
                                <View className="rounded-lg p-2 w-[28%] justify-center items-center bg-white border border-gray-200">
                                    <Text className="text-sm text-gray-900 font-extrabold">
                                        ₹100
                                    </Text>
                                </View>

                                <Text className="text-base text-gray-500 font-bold">X</Text>

                                {/* Count */}
                                <View className="rounded-lg w-[28%] bg-white border border-gray-200 justify-center items-center py-1">
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
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        className="text-gray-900 text-sm font-extrabold text-center p-0"
                                    />
                                </View>

                                <Text className="text-base text-gray-500 font-bold">=</Text>

                                {/* Total */}
                                <View className="rounded-lg p-2 w-[28%] justify-center items-center bg-emerald-50 border border-emerald-200">
                                    <Text className="text-sm text-emerald-700 font-black">
                                        ₹{Number(amountCount || 0) * 100}
                                    </Text>
                                </View>
                            </View>

                            {errorMsg.withdraw ? (
                                <View className="bg-red-50 p-2 rounded-lg my-1">
                                    <Text className="text-red-600 text-xs font-semibold">
                                        {errorMsg.withdraw}
                                    </Text>
                                </View>
                            ) : null}

                            <Text className="text-gray-500 text-[11px] mt-1 mb-3">
                                Withdrawal amount must be in multiples of ₹100
                            </Text>

                            <View className="flex-row justify-between mb-1">
                                <TouchableOpacity
                                    onPress={closeWithdraw}
                                    className="w-[46%] h-12 rounded-xl justify-center items-center bg-gray-100"
                                >
                                    <Text className="text-gray-700 text-sm font-bold">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

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
                                                withdraw:
                                                    "Withdrawal amount must be in multiples of ₹100",
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

                                        updateBankDetails();
                                    }}
                                    className="w-[46%] h-12 rounded-xl justify-center items-center"
                                    style={{ backgroundColor: COLORS.primary, elevation: 3 }}
                                >
                                    <Text className="text-white text-sm font-extrabold">
                                        Continue
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Global Loader Overlay */}
            {loading && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.45)",
                        zIndex: 9999,
                    }}
                >
                    <View className="p-5 bg-white rounded-2xl justify-center items-center shadow-lg">
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text className="text-xs font-bold text-gray-700 mt-2">
                            Please wait...
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default PaymentScreen;
