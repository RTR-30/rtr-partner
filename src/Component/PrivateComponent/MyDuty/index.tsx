import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    SafeAreaView,
    Modal,
    StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../../Common/Header";
import RenderHelper from "./RenderHelper";
import { AcceptList } from "./helper";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";

const MyDuty = () => {
    const value = "My Duty";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [data, setData] = useState<any[]>([]);

    const [payDetails, setPayDetails] = useState<any>({
        payment_link: "",
        qr_code: "",
        link_id: "",
        active: false,
    });

    const fetchAcceptList = async (showFullLoader = true) => {
        if (showFullLoader) {
            setLoading(true);
        }
        try {
            const res = await AcceptList();
            const { data: { bookings = [], success = false } } = res;

            if (success === true && Array.isArray(bookings)) {
                setData(bookings);
            } else if (Array.isArray(bookings)) {
                setData(bookings);
            }
        } catch {
            showError("Unable to load accepted duties");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAcceptList(true);
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAcceptList(false);
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Dead-Center Fullscreen Loading Modal */}
            <Modal transparent visible={loading && !refreshing} animationType="fade">
                <Loader />
            </Modal>

            {/* Screen Header Bar */}
            <View className="h-14 justify-center" style={{ backgroundColor: COLORS.primary }}>
                <Header value={value} />
            </View>

            {/* Main Surface Card */}
            <View className="flex-1 bg-gray-50 rounded-t-[24px] overflow-hidden px-3 pt-3">
                {data.length > 0 ? (
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) =>
                            item?.Id ? String(item.Id) : String(index)
                        }
                        renderItem={({ item }) => (
                            <RenderHelper
                                item={item}
                                setLoading={setLoading}
                                fetchAcceptList={() => fetchAcceptList(false)}
                                payDetails={payDetails}
                                setPayDetails={setPayDetails}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                    />
                ) : (
                    /* Compact Centered Empty State */
                    <View className="flex-1 justify-center items-center px-4">
                        <View
                            className="bg-white rounded-2xl p-5 items-center w-full border border-gray-100"
                            style={styles.cardShadow}
                        >
                            <View className="w-16 h-16 rounded-full bg-red-50 justify-center items-center mb-3 border border-red-100">
                                <Ionicons
                                    name="clipboard-outline"
                                    size={30}
                                    color={COLORS.primary}
                                />
                            </View>

                            <Text className="text-base font-black text-gray-900 mb-1 text-center">
                                No Duties Assigned
                            </Text>

                            <Text className="text-xs text-gray-500 text-center leading-4 mb-4 px-2">
                                You don't have any accepted or active duties right now.
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={() => navigation.navigate("Duty")}
                                className="w-full py-3 rounded-xl flex-row items-center justify-center"
                                style={{ backgroundColor: COLORS.primary }}
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={16}
                                    color="#FFFFFF"
                                    style={{ marginRight: 6 }}
                                />
                                <Text className="text-xs font-bold text-white">
                                    Browse Available Duties
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default MyDuty;

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
});
