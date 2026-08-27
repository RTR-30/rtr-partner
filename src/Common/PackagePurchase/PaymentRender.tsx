import React from "react";
import {
    View,
    Text,
    TouchableOpacity
} from "react-native";
import { COLORS } from "../../utils/ColorCode";
import { showError } from "../ToastMessage";
import { PurchacePackageService } from "./helper";


const PaymentRender = ({ item, setLoader, token, setPaymentData }: any) => {

    const purchacePackage = async (id: any) => {

        setLoader(true);
        const payload = {
            packageId: id
        }

        try {
            const res = await PurchacePackageService(payload, token)
            const { data: { success = false, message = '', link_id = '', payment_link = '', qr_code = '' } } = res;
            if (success === true) {
                const payment = {
                    packageid: id,
                    link_id: link_id,
                    payment_link: payment_link,
                    qr_code: qr_code,
                    success: success
                }
                setPaymentData(payment)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    return (
        <View className="w-full p-2 border-[1px] border-black rounded-lg">
            <View className="w-full justify-center flex-row p-2 border-b-[0.5px] border-black">
                <Text className="font-bold text-[14px]" style={{ color: COLORS.primary }}>{item?.name}</Text>
            </View>

            <View className="w-full p-2 flex-row">
                <Text className="font-bold text-[14px]" style={{ color: COLORS.primary }}>Validity : </Text>
                <Text className="font-bold text-[14px] text-black">{item?.validity_days} days</Text>
            </View>

            <View className="w-full p-2">
                <Text className="font-bold text-[14px]" style={{ color: COLORS.primary }}>Details : </Text>
                <Text className="font-bold text-[14px] text-black">{item?.description}</Text>
            </View>

            <View className="mt-2 w-full p-1 justify-center items-center">
                <TouchableOpacity onPress={() => purchacePackage(item?.id)} className="rounded-xl justify-center items-center w-[30%]" style={{ backgroundColor: COLORS.primary }}>
                    <Text className="text-white font-bold text-[12px] my-1">Pay</Text>
                    <Text className="text-white font-bold text-[12px] my-1">{item?.amount}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default PaymentRender;