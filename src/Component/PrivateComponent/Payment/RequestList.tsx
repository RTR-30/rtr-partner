import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";
import Loader from "../../../Common/Loader";
import { showError } from "../../../Common/ToastMessage";
import { CancelRequestService, RequestListService } from "./helper";

const RequestList = () => {
    const value = "Withdraw Request List";
    const backNavigate = true;

    const [loading, setLoading] = useState<boolean>(false);
    const [requestList, setRequestList] = useState<any[]>([]);

    const fetchRequestList = async () => {
        setLoading(true)
        try {
            const res = await RequestListService();
            const { data: { message = "", success = false, data = [] } } = res
            
            if (success) {
                setRequestList(data)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const cancelRequest = async (id: any) => {
        setLoading(true);
        const payload = {
            requestId: id
        }
        try{
            const res = await CancelRequestService(payload);
            const { data: { message = "", success = false } } = res
            if (success) {
                fetchRequestList();
            } else {
                showError(message)
            }
        } catch(error) {
            showError(error);
        } finally{
            setLoading(false)
        }
    }

    const RenderItem = ({ item }: any) => {
        console.log(item);
        
        return (
            <View className="mx-4 mt-3 rounded-xl p-4" style={{ backgroundColor: "#fff", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, }} >
                <View className="flex-row justify-between">
                    <Text className="text-base text-black font-bold">₹{item.amount}</Text>
                    <Text
                        className="font-bold"
                        style={{
                            color:
                                item.status === "PENDING"
                                    ? "#F59E0B"
                                    : item.status === "APPROVED"
                                    ? "#22C55E"
                                    : item.status === "REJECTED"
                                    ? "#EF4444"
                                    : item.status === "CANCELLED"
                                    ? "#6B7280"
                                    : "#000",
                        }}
                    >
                        {item.status}
                    </Text>
                </View>

                <Text className="mt-1 text-gray-500">Account Name: {item?.bank_details?.account_name}</Text>
                <Text className="mt-1 text-gray-500">Account Number: {item?.bank_details?.account_number}</Text>
                <Text className="mt-1 text-gray-500">IFSC: {item?.bank_details?.ifsc}</Text>
                <Text className="mt-1 text-gray-500">upi: {item?.bank_details?.upi || "-"}</Text>
                <Text className="mt-1 text-gray-500">{new Date(item.created_at).toLocaleString()}</Text>

                {/* Cancel option only for PENDING */}
                {item.status === "PENDING" && (
                    <TouchableOpacity
                        className="mt-4 rounded-lg py-3"
                        style={{ backgroundColor: "#EF4444" }}
                        onPress={() => {
                            cancelRequest(item.id)
                        }}
                    >
                        <Text className="text-center font-bold text-white">Cancel Request</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    useEffect(() => {
        fetchRequestList()
    }, [])

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <View className="flex-1">
                <Header value={value} backNavigate={backNavigate} />
            </View>

            {loading && (
                <View className="h-full w-full absolute" style={{ zIndex: 999 }}>
                    <Loader />
                </View>
            )}

            <View className="bg-white" style={{ flex: 9 }}>
                <FlatList
                    data={requestList}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={({ item }: any) => (
                        <RenderItem item={item} />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    style={{ marginTop: 10 }}
                />
            </View>
        </SafeAreaView>
    )
}

export default RequestList;