import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList,
    ActivityIndicator,
} from "react-native";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";
import Ionicons from "react-native-vector-icons/Ionicons";
import { showError } from "../../../Common/ToastMessage";
import { StatisticService } from "./helper";
import DatePickers from "../../../Common/DatePicker";

const Statistics = () => {
    const value = "Statistics";
    const backNavigate = true;

    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<any>({});

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const filterOption = [
        { key: "All", value: "all_time" },
        { key: "Today", value: "today" },
        { key: "This Week", value: "this_week" },
        { key: "This Month", value: "this_month" },
    ];

    const defaultValue = "all_time";

    const [statisticsData, setStatisticsData] = useState<any>({
        filter: defaultValue,
        startDate: "",
        endDate: "",
    });

    /**
     * Format Date
     * Example: 2026-09-01
     */
    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    /**
     * Fetch Statistics API
     *
     * IMPORTANT:
     * Values are passed directly instead of reading state immediately
     * after setStatisticsData().
     */
    const fetchData = async (
        filter: string = defaultValue,
        startDateValue: string = "",
        endDateValue: string = ""
    ) => {
        setLoading(true);

        const payload = {
            filter,
            startDate: startDateValue,
            endDate: endDateValue,
        };
        
        try {
            const res = await StatisticService(payload);
            
            if (!res) {
                showError("No response from server");
                return;
            }

            const response = res?.data;
            
            if (response?.success) {
                setData(response?.data || {});
            } else {
                setData({});
                showError(
                    response?.message || "Something went wrong"
                );
            }
        } catch (error: any) {
            showError( error?.response?.data?.message || error?.message || "Something went wrong" );
        } finally {
            setLoading(false);
        }
    };

    const chooseFilter = ( isDateSearch: boolean, selectedFilter?: string ) => {
        if (isDateSearch) {
            if ( !statisticsData?.startDate || !statisticsData?.endDate ) {
                showError("Start Date & End Date are required");
                return;
            }

            const filter = defaultValue;

            const startDateValue = statisticsData.startDate;
            const endDateValue = statisticsData.endDate;

            setStatisticsData((prev: any) => ({
                ...prev,
                filter,
            }));

            fetchData( filter, startDateValue, endDateValue );
        } else {
            const filter = selectedFilter || defaultValue;

            setStatisticsData((prev: any) => ({
                ...prev,
                filter,
            }));

            fetchData( filter, statisticsData?.startDate || "", statisticsData?.endDate || "" );
        }
    };

    useEffect(() => {
        fetchData(defaultValue, "", "");
    }, []);

    const renderItem = ({ item }: any) => {
        return (
            <View
                className="mb-3 p-4 bg-white rounded-xl border-[0.5px] border-[#000]"
                style={{
                    elevation: 3,
                    shadowColor: "#000",
                }}
            >
                {/* Status */}
                <View className="flex-row justify-end">
                    <Text
                        className="font-bold text-[12px]"
                        style={{
                            color: "orange",
                        }}
                    >
                        {item?.Status || "-"}
                    </Text>
                </View>

                {/* Customer Name */}
                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[30%]">
                        <Text
                            className="text-[12px] font-bold"
                            style={{
                                color: COLORS.primary,
                            }}
                        >
                            Customer Name
                        </Text>
                    </View>

                    <View className="w-[70%]">
                        <Text className="text-[12px] text-black font-bold">
                            : {item?.Name || "-"}
                        </Text>
                    </View>
                </View>

                {/* Driver Share */}
                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[30%]">
                        <Text
                            className="text-[12px] font-bold"
                            style={{
                                color: COLORS.primary,
                            }}
                        >
                            Driver Share
                        </Text>
                    </View>

                    <View className="w-[70%]">
                        <Text className="text-[12px] text-black font-bold">
                            : ₹{item?.FinalDriverShare || 0}
                        </Text>
                    </View>
                </View>

                {/* Address */}
                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[30%]">
                        <Text
                            className="text-[12px] font-bold"
                            style={{
                                color: COLORS.primary,
                            }}
                        >
                            Address
                        </Text>
                    </View>

                    <View className="w-[70%]">
                        <Text
                            className="text-[12px] text-black font-bold"
                            numberOfLines={3}
                        >
                            : {item?.Address || "-"}
                        </Text>
                    </View>
                </View>

                {/* Closed At */}
                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[30%]">
                        <Text
                            className="text-[12px] font-bold"
                            style={{
                                color: COLORS.primary,
                            }}
                        >
                            Closed At
                        </Text>
                    </View>

                    <View className="w-[70%]">
                        <Text className="text-[12px] text-black font-bold">
                            :{" "}
                            {item?.ClosedAt
                                ? new Date(
                                    item.ClosedAt
                                ).toLocaleDateString()
                                : "-"}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: COLORS.primary,
            }}
        >
            {/* Header */}
            <View
                style={{
                    flex: 1,
                }}
            >
                <Header
                    value={value}
                    backNavigate={backNavigate}
                />
            </View>

            {/* Main Container */}
            <View
                style={{
                    flex: 9,
                    padding: 10,
                    backgroundColor: "#fff",
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                }}
            >
                {/* Filters + Dates */}
                <View>
                    {/* Filter Buttons */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingVertical: 13,
                        }}
                    >
                        {filterOption.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() =>
                                    chooseFilter(
                                        false,
                                        item.value
                                    )
                                }
                                className="mr-3 px-4 py-2 rounded-xl justify-center items-center w-28"
                                style={{
                                    backgroundColor:
                                        statisticsData.filter ===
                                            item.value
                                            ? COLORS.primary
                                            : "lightgray",
                                }}
                            >
                                <Text
                                    className={`font-bold text-[14px] ${statisticsData.filter ===
                                            item.value
                                            ? "text-white"
                                            : "text-black"
                                        }`}
                                >
                                    {item.key}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Date Search */}
                    <View className="p-2 w-full flex-row justify-around border-t-[0.5px] border-black">
                        {/* Start Date */}
                        <View className="w-[40%] h-11 bg-gray-300 p-2 justify-center items-center rounded-xl">
                            <DatePickers
                                value={startDate}
                                placeholder="Start Date"
                                maximumDate={
                                    endDate || new Date()
                                }
                                onChange={(date: Date) => {
                                    setStartDate(date);

                                    setStatisticsData(
                                        (prev: any) => ({
                                            ...prev,
                                            startDate:
                                                formatDate(
                                                    date
                                                ),
                                        })
                                    );
                                }}
                            />
                        </View>

                        {/* End Date */}
                        <View className="w-[40%] h-11 bg-gray-300 p-2 justify-center items-center rounded-xl">
                            <DatePickers
                                value={endDate}
                                placeholder="End Date"
                                minimumDate={startDate}
                                maximumDate={new Date()}
                                onChange={(date: Date) => {
                                    setEndDate(date);

                                    setStatisticsData(
                                        (prev: any) => ({
                                            ...prev,
                                            endDate:
                                                formatDate(
                                                    date
                                                ),
                                        })
                                    );
                                }}
                            />
                        </View>

                        {/* Search Button */}
                        <View className="w-[12%] h-11 bg-blue-600 p-2 justify-center items-center rounded-xl">
                            <TouchableOpacity
                                onPress={() =>
                                    chooseFilter(true)
                                }
                                className="h-full w-full justify-center items-center"
                            >
                                <Ionicons
                                    name="search"
                                    color="white"
                                    size={20}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Statistics Content */}
                <View
                    style={{
                        flex: 1,
                    }}
                >
                    {/* Summary Cards */}
                    <View className="p-2 flex-row w-full justify-around bg-white">
                        {/* Total Complete Ride */}
                        <View
                            className="p-2 w-[46%] h-20 border-[2px] rounded-lg bg-white"
                            style={{
                                elevation: 3,
                                shadowColor: "black",
                                borderColor: COLORS.primary,
                            }}
                        >
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[12px] font-bold text-black text-center">
                                    Total Complete Ride
                                </Text>
                            </View>

                            <View className="w-full h-[50%] justify-center items-center">
                                <Text
                                    className="text-[16px] font-bold"
                                    style={{
                                        color: COLORS.primary,
                                    }}
                                >
                                    {data?.completedBookings || 0}
                                </Text>
                            </View>
                        </View>

                        {/* Total Complete Amount */}
                        <View
                            className="p-2 w-[46%] h-20 border-[2px] rounded-lg bg-white"
                            style={{
                                elevation: 3,
                                shadowColor: "black",
                                borderColor: COLORS.primary,
                            }}
                        >
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[12px] font-bold text-black text-center">
                                    Total Complete Amount
                                </Text>
                            </View>

                            <View className="w-full h-[50%] justify-center items-center">
                                <Text
                                    className="text-[16px] font-bold"
                                    style={{
                                        color: COLORS.primary,
                                    }}
                                >
                                    ₹{data?.totalEarnings || 0}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* History */}
                    <View className="w-full flex-1">
                        <View className="w-full p-2">
                            <Text className="text-black text-[16px] font-bold">
                                Order Details History
                            </Text>
                        </View>

                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator
                                    size="large"
                                    color={COLORS.primary}
                                />
                            </View>
                        ) : (
                            <FlatList
                                data={
                                    data?.recentBookings || []
                                }
                                keyExtractor={(
                                    item,
                                    index
                                ) =>
                                    item?.Id?.toString() ||
                                    index.toString()
                                }
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={
                                    false
                                }
                                contentContainerStyle={{
                                    paddingBottom: 20,
                                }}
                                ListEmptyComponent={() => (
                                    <View className="justify-center items-center mt-10">
                                        <Text className="text-gray-500">
                                            No Bookings Found
                                        </Text>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Statistics;
