import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";
import Loader from "../../../Common/Loader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { CancelRequestService, RequestListService } from "./helper";
import Ionicons from "react-native-vector-icons/Ionicons";

const RequestList = () => {
    const value = "Withdraw Request List";
    const backNavigate = true;

    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [requestList, setRequestList] = useState<any[]>([]);

    const fetchRequestList = async (isPullRefresh = false) => {
        if (isPullRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await RequestListService();
            const {
                data: { message = "", success = false, data = [] },
            } = res;

            if (success) {
                setRequestList(data);
            } else {
                showError(message || "Failed to load withdrawal requests");
            }
        } catch (error) {
            showError("Network error loading requests");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const cancelRequest = async (id: any) => {
        setLoading(true);
        const payload = {
            requestId: id,
        };
        try {
            const res = await CancelRequestService(payload);
            const {
                data: { message = "", success = false },
            } = res;
            if (success) {
                showSuccess(message || "Request cancelled successfully");
                fetchRequestList();
            } else {
                showError(message || "Failed to cancel request");
            }
        } catch (error) {
            showError("Error cancelling request");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCancel = (id: any) => {
        Alert.alert(
            "Cancel Request",
            "Are you sure you want to cancel this withdrawal request?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: () => cancelRequest(id),
                },
            ]
        );
    };

    const formatDateTime = (dateTime: any) => {
        if (!dateTime) return "-";
        try {
            const parsed = new Date(dateTime);
            if (isNaN(parsed.getTime())) return String(dateTime);
            const dateStr = parsed.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            const timeStr = parsed.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            return `${dateStr} • ${timeStr}`;
        } catch {
            return String(dateTime);
        }
    };

    const getStatusConfig = (status: string) => {
        const upper = String(status || "").toUpperCase();
        switch (upper) {
            case "PENDING":
                return {
                    label: "Pending",
                    bgClass: "bg-amber-50 border-amber-200",
                    textClass: "text-amber-700",
                    icon: "time-outline",
                    iconColor: "#B45309",
                };
            case "APPROVED":
                return {
                    label: "Approved",
                    bgClass: "bg-emerald-50 border-emerald-200",
                    textClass: "text-emerald-700",
                    icon: "checkmark-circle-outline",
                    iconColor: "#047857",
                };
            case "REJECTED":
                return {
                    label: "Rejected",
                    bgClass: "bg-red-50 border-red-200",
                    textClass: "text-red-700",
                    icon: "close-circle-outline",
                    iconColor: "#B91C1C",
                };
            case "CANCELLED":
                return {
                    label: "Cancelled",
                    bgClass: "bg-gray-100 border-gray-200",
                    textClass: "text-gray-600",
                    icon: "ban-outline",
                    iconColor: "#4B5563",
                };
            default:
                return {
                    label: status || "Submitted",
                    bgClass: "bg-slate-100 border-slate-200",
                    textClass: "text-slate-700",
                    icon: "information-circle-outline",
                    iconColor: "#334155",
                };
        }
    };

    const RenderItem = ({ item }: any) => {
        const statusConfig = getStatusConfig(item?.status);

        return (
            <View
                className="mx-4 mb-3.5 bg-white rounded-2xl p-4 border border-gray-200"
                style={{ elevation: 2 }}
            >
                {/* Header: Amount & Status Badge */}
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            Withdrawal Amount
                        </Text>
                        <View className="flex-row items-baseline">
                            <Text
                                className="text-sm font-bold mr-0.5"
                                style={{ color: COLORS.primary }}
                            >
                                ₹
                            </Text>
                            <Text
                                className="text-2xl font-black"
                                style={{ color: COLORS.primary }}
                            >
                                {item.amount}
                            </Text>
                        </View>
                    </View>

                    {/* Status Pill */}
                    <View
                        className={`flex-row items-center px-2.5 py-1 rounded-xl border ${statusConfig.bgClass}`}
                    >
                        <Ionicons
                            name={statusConfig.icon as any}
                            size={13}
                            color={statusConfig.iconColor}
                            style={{ marginRight: 4 }}
                        />
                        <Text className={`text-xs font-bold ${statusConfig.textClass}`}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Bank & Account Details Box */}
                <View className="bg-gray-50 rounded-xl p-3 my-3 border border-gray-100">
                    {/* Account Name */}
                    <View className="flex-row items-center mb-2">
                        <View className="w-6 h-6 rounded-full bg-white justify-center items-center mr-2 border border-gray-200">
                            <Ionicons name="person-outline" size={13} color="#475569" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                                Account Holder
                            </Text>
                            <Text className="text-xs font-bold text-gray-800" numberOfLines={1}>
                                {item?.bank_details?.account_name || "N/A"}
                            </Text>
                        </View>
                    </View>

                    {/* Account Number & IFSC Grid */}
                    <View className="flex-row justify-between pt-1 border-t border-gray-200/60">
                        <View className="flex-1 pr-2">
                            <Text className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                                Account Number
                            </Text>
                            <Text className="text-xs font-bold text-gray-800 mt-0.5">
                                {item?.bank_details?.account_number || "N/A"}
                            </Text>
                        </View>

                        <View className="flex-1 pl-2 items-end">
                            <Text className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                                IFSC Code
                            </Text>
                            <Text className="text-xs font-bold text-gray-800 mt-0.5">
                                {item?.bank_details?.ifsc || "N/A"}
                            </Text>
                        </View>
                    </View>

                    {/* UPI (if provided) */}
                    {item?.bank_details?.upi ? (
                        <View className="flex-row items-center mt-2 pt-1 border-t border-gray-200/60">
                            <Ionicons
                                name="phone-portrait-outline"
                                size={12}
                                color="#64748B"
                                style={{ marginRight: 4 }}
                            />
                            <Text className="text-[11px] font-semibold text-gray-600">
                                UPI: {item.bank_details.upi}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Footer: Date & Time */}
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Ionicons
                            name="calendar-outline"
                            size={12}
                            color="#9CA3AF"
                            style={{ marginRight: 4 }}
                        />
                        <Text className="text-[11px] text-gray-400 font-medium">
                            {formatDateTime(item?.created_at)}
                        </Text>
                    </View>

                    <Text className="text-[10px] font-semibold text-gray-400">
                        ID: #{String(item?.id || "").slice(-6)}
                    </Text>
                </View>

                {/* Cancel Action Button (only for PENDING status) */}
                {item.status === "PENDING" && (
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleConfirmCancel(item.id)}
                        className="mt-3 flex-row items-center justify-center py-2.5 px-4 rounded-xl border border-red-200 bg-red-50"
                    >
                        <Ionicons
                            name="close-circle-outline"
                            size={15}
                            color="#DC2626"
                            style={{ marginRight: 5 }}
                        />
                        <Text className="text-xs font-bold text-red-600">
                            Cancel Request
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    useEffect(() => {
        fetchRequestList();
    }, []);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Top Header Bar */}
            <View className="h-14 justify-center">
                <Header value={value} backNavigate={backNavigate} />
            </View>

            {/* Main Content Area */}
            <View className="flex-1 rounded-t-[32px] bg-gray-50 overflow-hidden pt-3">
                {/* Count Header Bar */}
                {requestList.length > 0 && (
                    <View className="flex-row justify-between items-center px-4 mb-2">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            All Requests
                        </Text>
                        <View className="bg-slate-200 px-2 py-0.5 rounded-md">
                            <Text className="text-[10px] font-bold text-slate-700">
                                {requestList.length} Total
                            </Text>
                        </View>
                    </View>
                )}

                {requestList.length === 0 && !loading ? (
                    /* Clean Empty State without Image */
                    <View className="flex-1 justify-center items-center px-6 py-10">
                        <View className="w-16 h-16 rounded-full bg-slate-100 justify-center items-center mb-3">
                            <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
                        </View>
                        <Text className="text-base font-bold text-slate-800 mb-1 text-center">
                            No Withdrawal Requests
                        </Text>
                        <Text className="text-xs text-slate-500 text-center max-w-[260px] leading-5 mb-4">
                            Any withdrawal requests you submit from your wallet will appear here with live tracking status.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => fetchRequestList(true)}
                            className="flex-row items-center px-4 py-2 rounded-xl border border-red-200 bg-red-50"
                        >
                            <Ionicons
                                name="refresh"
                                size={15}
                                color={COLORS.primary}
                                style={{ marginRight: 5 }}
                            />
                            <Text
                                className="text-xs font-bold"
                                style={{ color: COLORS.primary }}
                            >
                                Refresh Requests
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={requestList}
                        keyExtractor={(item: any, index: number) =>
                            String(item?.id ?? index)
                        }
                        renderItem={({ item }: any) => <RenderItem item={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => fetchRequestList(true)}
                                tintColor={COLORS.primary}
                                colors={[COLORS.primary]}
                            />
                        }
                    />
                )}
            </View>

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

export default RequestList;