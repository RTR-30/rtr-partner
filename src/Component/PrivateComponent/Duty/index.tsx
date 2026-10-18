import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    SafeAreaView,
} from "react-native";

import Loader from "../../../Common/Loader";
import { fetchAllDuty, gearTypeService } from "./helper";
import RenderList from "./renderList";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";
import Ionicons from "react-native-vector-icons/Ionicons";

const DutyScreen = () => {
    const navigation: any = useNavigation();
    const isEnabled = useSelector((state: any) => state.status?.isEnabled);
    const [latlong, setlatLong] = useState<any>(null);

    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [dutyData, setDutyData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<any>(null);
    const [currentPageLimit, setCurrentPageLimit] = useState<number>(10);
    const [gearType, setGearType] = useState<any[]>([]);
    const [selectedGearType, setSelectedGearType] = useState<string>("All");

    const selectedGearTypeRef = React.useRef(selectedGearType);
    selectedGearTypeRef.current = selectedGearType;

    const currentPageLimitRef = React.useRef(currentPageLimit);
    currentPageLimitRef.current = currentPageLimit;

    const latlongRef = React.useRef(latlong);
    latlongRef.current = latlong;

    const fetchData = async (limit: any, page: any, region: any, gearTypeToFetch?: string) => {
        if (!footerLoader) {
            setShowLoader(true);
        }

        const activeGearType = gearTypeToFetch !== undefined ? gearTypeToFetch : selectedGearType;

        try {
            const response = await fetchAllDuty(
                limit,
                page,
                region?.lat,
                region?.long,
                activeGearType
            );

            const {
                data: { bookingList = [], message = "", status = 0 },
            } = response;

            if (status === 200) {
                setTotalDataList(response.data.total);
                setDutyData(bookingList);
            } else {
                showError(message || "Unable to fetch duties");
            }
        } catch (error) {
            showError("Network error while fetching duties");
        } finally {
            setShowLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    };

    const fetchGearType = async () => {
        try {
            const res = await gearTypeService();
            const {
                data: { success = false, data = [], message = "" },
            } = res;

            if (success === true) {
                setGearType(["All", ...data]);
            }
        } catch (error) {
            console.log("Error loading gear types:", error);
        }
    };

    const onRefresh = () => {
        setOnRefreshing(true);
        setShowLoader(false);
        setFooterLoader(false);
        setTotalDataList(null);
        setCurrentPageLimit(10);
        setDutyData([]);
        fetchUserData().finally(() => {
            setShowLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        });
    };

    const loadMore = () => {
        if (totalDataList && dutyData.length >= totalDataList) return;
        if (footerLoader || showLoader) return;

        const nextLimit = currentPageLimit + 10;
        setCurrentPageLimit(nextLimit);
        setFooterLoader(true);
        fetchData(nextLimit, 1, latlong);
    };

    const fetchUserData = async () => {
        try {
            const region: any = await AsyncStorage.getItem("latlong");
            if (region) {
                const regi = JSON.parse(region);
                setlatLong(regi);
                await fetchData(currentPageLimitRef.current, 1, regi, selectedGearTypeRef.current);
            }
        } catch (error) {
            showError("Error retrieving location for duties");
        }
    };

    const renderLoader = () => {
        if (!footerLoader || totalDataList === dutyData.length) return null;
        return (
            <View className="flex-row justify-center items-center py-3.5">
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text className="text-xs text-gray-500 font-semibold ml-2">Loading more duties...</Text>
            </View>
        );
    };

    useEffect(() => {
        if (isEnabled) {
            fetchData(currentPageLimit, 1, latlong, selectedGearType);
        }
    }, [selectedGearType]);

    useFocusEffect(
        React.useCallback(() => {
            if (isEnabled) {
                // Fetch immediately when user lands on Duty screen
                fetchUserData();
                fetchGearType();

                // Poll API once every 2 minutes while on this screen
                const intervalId = setInterval(() => {
                    fetchUserData();
                }, 2 * 60 * 1000);

                // Clean up interval when user navigates away or unmounts
                return () => clearInterval(intervalId);
            }
        }, [isEnabled])
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Top Branded App Header */}
            <View
                className="h-[60px] flex-row items-center justify-between px-4"
                style={{ backgroundColor: COLORS.primary }}
            >
                <View className="flex-1">
                    <Text className="text-xl font-black text-white tracking-wide">
                        Available Duties
                    </Text>
                    <Text className="text-[11px] text-white/80 font-medium mt-0.5">
                        Live Customer Trip Feed
                    </Text>
                </View>

                {/* Online / Offline status badge in header */}
                <View
                    className={`flex-row items-center px-2.5 py-1 rounded-xl ${
                        isEnabled ? "bg-white/20" : "bg-black/25"
                    }`}
                >
                    <View
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                            isEnabled ? "bg-emerald-400" : "bg-red-400"
                        }`}
                    />
                    <Text
                        className={`text-xs font-bold ${
                            isEnabled ? "text-white" : "text-red-200"
                        }`}
                    >
                        {isEnabled ? "Online" : "Offline"}
                    </Text>
                </View>
            </View>

            {/* Main Surface Card */}
            <View className="flex-1 bg-gray-50 rounded-t-[28px] overflow-hidden px-3.5 pt-3">
                {!isEnabled ? (
                    /* Offline State View */
                    <View className="flex-1 justify-center items-center px-4">
                        <View
                            className="bg-white rounded-3xl p-6 items-center w-full border border-gray-200"
                            style={{ elevation: 4 }}
                        >
                            <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4 border-2 border-red-200">
                                <Ionicons name="power" size={44} color="#DC2626" />
                            </View>

                            <View className="bg-red-100 px-3 py-1 rounded-xl mb-2.5">
                                <Text className="text-[11px] font-extrabold text-red-600 tracking-wider">
                                    DUTY STATUS: OFFLINE
                                </Text>
                            </View>

                            <Text className="text-xl font-black text-gray-900 mb-2 text-center">
                                You're Currently Offline
                            </Text>
                            <Text className="text-[13px] text-gray-500 text-center leading-5 mb-5">
                                To start receiving live customer bookings and duties near your
                                location, please switch your duty status to Online.
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={() => navigation.navigate("Home")}
                                className="flex-row items-center justify-center w-full py-3.5 rounded-xl mb-4"
                                style={{ backgroundColor: COLORS.primary, elevation: 3 }}
                            >
                                <Ionicons
                                    name="radio-outline"
                                    size={20}
                                    color="#FFF"
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-[15px] font-extrabold text-white">
                                    Go to Home & Turn Online
                                </Text>
                            </TouchableOpacity>

                            {/* Driver Tips */}
                            <View className="w-full bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={14}
                                        color="#059669"
                                    />
                                    <Text className="text-[11px] text-gray-600 font-medium flex-1 ml-1.5">
                                        Stay online during peak rush hours for more duties
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={14}
                                        color="#059669"
                                    />
                                    <Text className="text-[11px] text-gray-600 font-medium flex-1 ml-1.5">
                                        Ensure location GPS is always active on your phone
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    /* Online State View */
                    <>
                        {/* Live Status Sub-header & Filter Bar */}
                        <View className="mb-2.5">
                            <View className="flex-row justify-between items-center py-1.5 px-0.5">
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                                    <Text className="text-[13px] font-bold text-slate-800">
                                        Live Booking Requests
                                    </Text>
                                </View>

                                {dutyData.length > 0 && (
                                    <View className="bg-slate-200 px-2.5 py-1 rounded-lg">
                                        <Text className="text-[11px] font-bold text-slate-700">
                                            {dutyData.length}{" "}
                                            {dutyData.length === 1 ? "Duty" : "Duties"}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Gear Type Filter Tabs */}
                            {gearType.length > 0 && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingVertical: 4, paddingRight: 10 }}
                                    className="mt-1.5"
                                >
                                    {gearType.map((item, index) => {
                                        const isSelected = selectedGearType === item;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                activeOpacity={0.8}
                                                onPress={() => setSelectedGearType(item)}
                                                className={`flex-row items-center px-3.5 py-2 rounded-full mr-2 ${
                                                    isSelected
                                                        ? "border-transparent"
                                                        : "bg-white border border-slate-200"
                                                }`}
                                                style={
                                                    isSelected
                                                        ? {
                                                              backgroundColor: COLORS.primary,
                                                              elevation: 2,
                                                          }
                                                        : {}
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        item === "All"
                                                            ? "grid-outline"
                                                            : "car-sport-outline"
                                                    }
                                                    size={13}
                                                    color={isSelected ? "#FFF" : "#4B5563"}
                                                    style={{ marginRight: 5 }}
                                                />
                                                <Text
                                                    className={`text-xs font-bold ${
                                                        isSelected
                                                            ? "text-white"
                                                            : "text-slate-600"
                                                    }`}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )}
                        </View>

                        {/* Content Area: Centered Loader, Duty List, or Clean No Data Found */}
                        {showLoader && dutyData.length === 0 ? (
                            /* Centered Screen Loader when loading */
                            <View className="flex-1 justify-center items-center py-10">
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text className="text-xs text-gray-500 font-semibold mt-3">
                                    Loading available duties...
                                </Text>
                            </View>
                        ) : dutyData.length > 0 ? (
                            <FlatList
                                data={dutyData}
                                renderItem={({ item }: any) => (
                                    <RenderList item={item} setShowLoader={setShowLoader} />
                                )}
                                keyExtractor={(item, index) =>
                                    String(item?.Id ?? index)
                                }
                                refreshControl={
                                    <RefreshControl
                                        refreshing={onRefreshing}
                                        onRefresh={onRefresh}
                                        tintColor={COLORS.primary}
                                        colors={[COLORS.primary]}
                                    />
                                }
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
                                ListFooterComponent={renderLoader}
                                onEndReached={loadMore}
                                onEndReachedThreshold={0.3}
                            />
                        ) : (
                            /* No Data Found without Image */
                            <View className="flex-1 justify-center items-center py-10">
                                <View className="w-16 h-16 rounded-full bg-slate-100 justify-center items-center mb-3.5">
                                    <Ionicons name="briefcase-outline" size={32} color="#94A3B8" />
                                </View>
                                <Text className="text-[17px] font-black text-slate-800 mb-1.5 text-center">
                                    No Duties Found
                                </Text>
                                <Text className="text-[13px] text-slate-500 text-center leading-[18px] mb-4 max-w-[280px]">
                                    Customer bookings in your service area will appear here
                                    automatically as they arrive.
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={onRefresh}
                                    className="flex-row items-center px-4 py-2.5 rounded-xl border border-red-200 bg-red-50"
                                >
                                    <Ionicons
                                        name="refresh"
                                        size={16}
                                        color={COLORS.primary}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text
                                        className="text-[13px] font-bold"
                                        style={{ color: COLORS.primary }}
                                    >
                                        Refresh Duty Feed
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </View>

            {/* Global Loader Overlay centered on screen for actions */}
            {showLoader && dutyData.length > 0 && (
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

export default DutyScreen;
