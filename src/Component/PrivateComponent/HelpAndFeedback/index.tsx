import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../../Common/Header";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";
import { getTermsAndConditionsService, TermsResponse, TermItem } from "./helper";

const HelpAndFeedback = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [termsData, setTermsData] = useState<TermsResponse | null>(null);

    const fetchTerms = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await getTermsAndConditionsService("partner");
            if (res && res.data && res.data.success) {
                setTermsData(res.data);
            } else {
                const errMsg = res?.data?.message || "Failed to load Terms & Conditions";
                showError(errMsg);
            }
        } catch (error: any) {
            showError(error?.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    const headerTitle = termsData?.heading || "Terms & Conditions";
    const termsList: TermItem[] = (termsData && Array.isArray(termsData.data)) ? termsData.data : [];

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {loading && !refreshing && (
                <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
                    <Loader />
                </View>
            )}

            {/* Screen Header */}
            <View className="h-14 justify-center">
                <Header value={headerTitle} backNavigate={true} />
            </View>

            {/* Content Sheet */}
            <View className="flex-1 bg-white rounded-t-[30px] overflow-hidden">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchTerms(true)}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {/* Optional Intro Content */}
                    {!!termsData?.content && (
                        <View className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-4 flex-row items-start">
                            <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3 mt-0.5">
                                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-800 font-medium text-[14px] leading-5">
                                    {termsData.content}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Dynamic Terms List from API */}
                    {termsList.length > 0 ? (
                        termsList.map((item: TermItem, index: number) => (
                            <View
                                key={index}
                                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-3.5 shadow-sm"
                            >
                                <View className="flex-row items-center mb-2">
                                    <View className="w-8 h-8 rounded-xl bg-red-50 items-center justify-center mr-2.5 border border-red-100">
                                        <Ionicons name="document-text-outline" size={17} color={COLORS.primary} />
                                    </View>
                                    <Text className="text-slate-900 font-bold text-[15px] flex-1 leading-5">
                                        {item.title}
                                    </Text>
                                </View>
                                <Text className="text-slate-600 font-normal text-[13.5px] leading-5 pl-1">
                                    {item.description}
                                </Text>
                            </View>
                        ))
                    ) : !loading ? (
                        <View className="py-16 items-center justify-center">
                            <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
                            <Text className="text-slate-500 font-medium text-[15px] mt-3">
                                No Terms & Conditions found
                            </Text>
                            <TouchableOpacity
                                onPress={() => fetchTerms()}
                                className="mt-4 px-5 py-2.5 rounded-full"
                                style={{ backgroundColor: COLORS.primary }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-semibold text-[14px]">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default HelpAndFeedback;