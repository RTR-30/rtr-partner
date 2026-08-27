import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Image
} from "react-native"
import PaymentRender from "./PaymentRender";
import { showError, showSuccess } from "../ToastMessage";
import { PaymentProcessService, VerifyPaymentService } from "./helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../utils/ColorCode";

interface Props {
    visible: boolean;
    onClose: () => void;
}

const PackagePurchase = ({ visible, onClose }: Props) => {
    const [loader, setLoader] = useState<boolean>(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [token, setToken] = useState<any>(null);
    const [paymentData, setPaymentData] = useState<any>({
        packageid: '',
        link_id: '',
        payment_link: '',
        qr_code: '',
        success: false
    })

    const verifyPayment = async () =>  {
        setLoader(true);
        const payload = {
            linkId: paymentData?.link_id,
            packageId: paymentData?.packageid
        }

        try{
            const res = await VerifyPaymentService(payload, token)
            const { data: {success = false, message = ""}} = res;

            if(success === true){
                showSuccess(message)
                onClose()
            } else{
                showError(message)
            }
        } catch(error){
            showError(error)
        } finally {
            setLoader(false);
        }
    }

    const PaymentProcess = async (tokens: any) => {

        setLoader(true)
        try {
            const res = await PaymentProcessService(tokens);
            const { data: { data = [], success = false } } = res
            if (success === true) {
                setPackages(data)
            } else {
                showError(false)
            }

        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    const closePayment = () => {
        onClose();
    }

    const fetchUserData = async () => {
        try {
            const storedUserData: any = await AsyncStorage.getItem("UserData");
            const usertoken: any = await AsyncStorage.getItem("token");

            if (usertoken) {
                setToken(usertoken)
                PaymentProcess(usertoken);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchUserData();
        }
    }, [visible]);

    return (

        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={closePayment}
        >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <View className="bg-[#f2f2f2] h-[80%] w-[90%] rounded-3xl p-3">
                            <View className="mt-3 w-full flex-row justify-between">
                                <Text className="text-black text-[16px] font-bold">Payment Process</Text>
                                <TouchableOpacity className="right-5" onPress={closePayment}>
                                    <Text className="text-[12px] font-bold" style={{color: COLORS?.primary}}>X</Text>
                                </TouchableOpacity>
                            </View>
                    {paymentData?.success === false ?
                        <>

                            <View className="mt-2">
                                <Text className="text-blue-600 text-[14px] text-center font-bold">Your payment is successfully completed then only you can get the ride</Text>
                            </View>

                            <View className="mt-4">
                                <Text className="text-black text-[14px] text-center font-bold">Choose Your Payment Option</Text>
                            </View>

                            <View className="mt-2 w-full">
                                <FlatList
                                    data={packages}
                                    renderItem={({ item }: any) =>
                                        <PaymentRender item={item} setLoader={setLoader} token={token} setPaymentData={setPaymentData} />
                                    }
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 10 }}
                                    style={{ marginTop: 3 }}
                                />
                            </View>
                        </> :
                        <>
                            <View className="mt-3 w-full">
                                <Text className="text-[16px] text-center font-bold" style={{color: COLORS.primary}}>Scan This Qr Code To Pay</Text>
                            </View>

                            <View className="mt-10">
                                <View className="w-full justify-center items-center p-2">
                                    <Image
                                        source={{
                                            uri: `${paymentData?.qr_code}`,
                                        }}
                                        resizeMode="cover"
                                        className="h-44 w-44"
                                    />
                                </View>
                            </View>

                            <View className="mt-10">
                                <View className="justify-center items-center mt-1">
                                    <Text className="text-[16px] text-center font-bold" style={{color: COLORS.primary}}>Once Payment Done Veryfy Your Package</Text>
                                </View>

                                <View className="mt-5 justify-center items-center">
                                    <TouchableOpacity onPress={verifyPayment} className="p-3 rounded-md w-[40%]" style={{backgroundColor: COLORS.primary}}>
                                        <Text className="text-[16px] text-center font-bold" style={{color: "#fff"}}>Verify</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    }


                </View>
            </View>
        </Modal>

    )
}

export default PackagePurchase;