import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Image,
    ScrollView,
    SafeAreaView,
    TextInput,
    Platform
} from "react-native"
import PaymentRender from "./PaymentRender";
import { showError, showSuccess } from "../ToastMessage";
import { PaymentProcessService, PurchacePackageService } from "./helper";
import { COLORS } from "../../utils/ColorCode";
import { CFErrorResponse, CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";
import { openCashfreePayment } from "../../utils/secureFile";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getUserDetailsService } from "../../Component/PrivateComponent/Home/helper";

const Logo = require(`../../../assets/Imgs/Logo.png`)

const PackagePurchase = () => {
    const navigation: any = useNavigation();
    const [loader, setLoader] = useState<boolean>(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<any>("");
    const [selectPaymentData, setSelectPaymentData] = useState<any>(null);
    const [openPayment, setOpenPayment] = useState<boolean>(false);

    const [checkWallet, setCheckWallet] = useState<boolean>(false);
    const [totalWallet, setTotalWallet] = useState<any>(0);
    const [walletAmount, setWalletAmount] = useState<any>("");

    let descriptionList: string[] = [];

    if (Array.isArray(selectPaymentData?.description)) {
        descriptionList = selectPaymentData.description;
    } else if (typeof selectPaymentData?.description === "string") {
        try {
            const parsed = JSON.parse(selectPaymentData.description);
            if (Array.isArray(parsed)) {
                descriptionList = parsed;
            } else {
                descriptionList = [selectPaymentData.description];
            }
        } catch (error) {
            descriptionList = [selectPaymentData.description];
        }
    }

    const fetchUserDetails = async () => {
        setLoader(true)
        try {
            const res = await getUserDetailsService();
            const { data: { success = false, user = {} } } = res

            if (success === true) {
                setTotalWallet(user?.wallet_balance)
            } else {
                showError("user details error")
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    const PaymentProcess = async () => {

        setLoader(true)
        try {
            const res = await PaymentProcessService();

            const { data: { data = [], success = false } } = res
            if (success === true) {
                setPackages(data)
            } else {
                showError("Payment error")
            }

        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    const closePackage = () => {
        navigation.goBack();
    }

    const handleClosePayment = () => {
        setOpenPayment(false)
    }

    const openWallet = () => {
        setCheckWallet(true);
    }

    const closeWallet = () => {
        setWalletAmount("");
        setCheckWallet(false)
    }

    const purchacePackage = async (id: any, useWallet: boolean) => {
        setLoader(true);
        const packagePrice = Number(selectPaymentData?.amount || 0);
        const enteredWalletAmount = Number(walletAmount || 0);

        const payload = {
            packageId: id,
            walletAmountToUse: useWallet ? enteredWalletAmount : 0
        }

        try {
            const res = await PurchacePackageService(payload)
            const { data: { success = false, message = '', link_id = '', payment_link = '', qr_code = '', order_id = "", session_id = "" } } = res;

            if (success === true) {
                if (packagePrice === enteredWalletAmount) {
                    closePackage()
                } else {
                    await openCashfreePayment(order_id, session_id);
                }
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    const purchaseCondition = () => {
        const packagePrice = Number(selectPaymentData?.amount || 0);
        const walletBalance = Number(totalWallet || 0);
        const enteredWalletAmount = Number(walletAmount || 0);

        if (!selectPaymentData?.id) {
            showError("Please select a package");
            return;
        }

        if (!walletAmount || enteredWalletAmount <= 0) {
            showError("Please enter wallet amount");
            return;
        }

        if (enteredWalletAmount > walletBalance) {
            showError("Wallet amount cannot exceed your wallet balance");
            return;
        }

        if (enteredWalletAmount > packagePrice) {
            showError("Wallet amount cannot exceed package price");
            return;
        }

        // Valid wallet payment
        purchacePackage(selectPaymentData.id, true);
    };

    useEffect(() => {
        const initializeCashfree = async () => {
            try {
                CFPaymentGatewayService.setCallback({
                    onVerify: async () => {
                        showSuccess("payment done");
                        closePackage()
                    },

                    onError: (error: CFErrorResponse, orderID: string) => {
                        setLoader(false);
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
        fetchUserDetails();
        PaymentProcess();
    }, []);

    return (
        <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: "#000" }}>
            <View className="bg-[#f2f2f2] h-[100%] w-[100%]">
                <View className="justify-center w-full items-center">
                    <Image
                        source={Logo}
                        className="w-full h-72"
                        resizeMode="cover"
                    />
                </View>

                <View className="mt-5 justify-center items-center w-full">
                    <Text className="text-blue-600 text-[16px] font-bold">Access Duty Features</Text>
                </View>

                <View className="mt-2 w-[90%] flex-row flex-wrap p-2 self-center">
                    <FlatList
                        data={packages}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <PaymentRender
                                item={item} packages={packages}
                                selectedPaymentId={selectedPaymentId}
                                setSelectedPaymentId={setSelectedPaymentId}
                                setSelectPaymentData={setSelectPaymentData}
                            />
                        )}
                        keyExtractor={(item, index) => String(item?.id ?? index)}
                        showsVerticalScrollIndicator={false}
                        columnWrapperStyle={{
                            justifyContent: "space-between",
                            marginBottom: 10,
                        }}
                    />
                </View>

                <View className="w-[95%] self-center mt-2">
                    <Text className="py-2 w-full text-center text-[16px] font-bold text-blue-600">Package Details</Text>
                    {descriptionList.map((description, index) => (
                        <View key={index} className="flex-row items-center mb-2" >
                            <Text className="text-black font-bold text-[14px]"> •{" "} </Text>
                            <Text className="text-black text-[14px] font-bold flex-1"> {description.trim()} </Text>
                        </View>
                    ))}
                </View>

                <View className="absolute bottom-4 w-full justify-center items-center">
                    <TouchableOpacity onPress={() => { setOpenPayment(true) }} className="w-[90%] justify-center items-center p-3 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                        <Text className="text-[20px] font-bold text-center text-white">Purchase Package</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[60%] justify-center items-center mt-4" onPress={closePackage}>
                        <Text className="text-[20px] font-bold text-center" style={{ color: COLORS?.primary }}>Cancel Purchase</Text>
                    </TouchableOpacity>
                </View>

            </View>
            {openPayment ?
                <View className="absolute h-full w-full justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View className="bg-[#f2f2f2] w-[85%] p-5 rounded-lg">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-[20px] font-bold" style={{ color: COLORS.primary }}>Confirm Purchase</Text>

                            <TouchableOpacity onPress={handleClosePayment}>
                                <Text className="text-gray-500 text-[24px] font-bold">×</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-2">
                            <Text className="text-black text-[18px] font-bold mb-2">{selectPaymentData?.name || "Selected Package"}</Text>

                            <View className="flex-row items-center mb-4">
                                <Text className="text-black text-[16px]">Package Price:</Text>
                                <Text className="text-[18px] font-bold ml-2" style={{ color: COLORS.primary }}>₹{selectPaymentData?.amount || 0}</Text>
                            </View>
                        </View>

                        <View className="mt-2">
                            <View className="w-full flex-row">
                                <View className="w-[90%]">
                                    <Text className="text-black text-[16px] font-bold">Use Wallet Amount</Text>
                                </View>

                                <View className="w-[10%]">
                                    <TouchableOpacity onPress={() => checkWallet ? closeWallet() : openWallet()}>
                                        <Ionicons name={checkWallet ? "checkbox" : "checkbox-outline"} size={20} color={checkWallet ? "darkblue" : "black"} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {checkWallet ?
                                <View className="w-full">
                                    <View className="mt-2">
                                        <Text className="text-black text-[12px] font-bold">Total Wallet Amount ₹{totalWallet}</Text>
                                        <TextInput
                                            value={String(walletAmount)}
                                            onChangeText={(text) => {
                                                const numericValue = text.replace(/[^0-9]/g, "");
                                                setWalletAmount(numericValue);
                                            }}
                                            placeholder="Enter wallet amount"
                                            placeholderTextColor="#888"
                                            keyboardType="numeric"
                                            className="w-full border border-gray-400 rounded-lg px-3 mt-2 text-black"
                                            style={{ height: 45, backgroundColor: "#fff" }}
                                        />
                                    </View>
                                </View> : null
                            }
                        </View>

                        <View className="w-full mt-5 flex-row justify-around">
                            {checkWallet ?
                                <TouchableOpacity onPress={purchaseCondition} className="w-[50%] bg-[#D99B21] p-2 justify-center items-center rounded-md">
                                    <Text className="text-white font-bold text-[14px]">Use Wallet Pay</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => purchacePackage(selectPaymentData?.id, false)} className="w-[50%] bg-[#D99B21] p-2 justify-center items-center rounded-md">
                                    <Text className="text-white font-bold text-[14px]">Pay</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View> : null
            }
        </SafeAreaView>
    )
}

export default PackagePurchase;