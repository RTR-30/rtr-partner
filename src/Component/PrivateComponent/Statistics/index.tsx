import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

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
                showError(response?.message || "Something went wrong");
            }
        } catch (error: any) {
            showError(
                error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    const chooseFilter = (isDateSearch: boolean, selectedFilter?: string) => {
        if (isDateSearch) {
            if (!statisticsData?.startDate || !statisticsData?.endDate) {
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

            fetchData(filter, startDateValue, endDateValue);
        } else {
            const filter = selectedFilter || defaultValue;

            setStartDate(null);
            setEndDate(null);
            setStatisticsData({
                filter,
                startDate: "",
                endDate: "",
            });

            fetchData(filter, "", "");
        }
    };

    const clearFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setStatisticsData({
            filter: defaultValue,
            startDate: "",
            endDate: "",
        });
        fetchData(defaultValue, "", "");
    };

    const isFilterApplied = Boolean(
        statisticsData.filter !== defaultValue || startDate || endDate
    );

    const getActiveFilterLabel = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} to ${formatDate(endDate)}`;
        }
        const current = filterOption.find(
            (opt) => opt.value === statisticsData.filter
        );
        return current ? current.key : "All Time";
    };

    useEffect(() => {
        fetchData(defaultValue, "", "");
    }, []);

    const renderItem = ({ item }: any) => {
        const closedDate = item?.ClosedAt
            ? new Date(item.ClosedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
              })
            : "-";
        const closedTime = item?.ClosedAt
            ? new Date(item.ClosedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "";

        return (
            <View
                className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
                style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                }}
            >
                {/* Header: Customer Info & Status Badge */}
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3 border border-slate-200">
                            <Ionicons name="person" size={18} color="#475569" />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-[14px] font-extrabold text-slate-900"
                                numberOfLines={1}
                            >
                                {item?.Name || "Customer"}
                            </Text>
                            <View className="flex-row items-center mt-0.5">
                                <Ionicons
                                    name="time-outline"
                                    size={12}
                                    color="#94a3b8"
                                />
                                <Text className="text-[11px] text-slate-400 font-semibold ml-1">
                                    {closedDate}
                                    {closedTime ? ` • ${closedTime}` : ""}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Status Pill */}
                    <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <Text className="text-[11px] font-extrabold text-emerald-700">
                            {item?.Status || "Completed"}
                        </Text>
                    </View>
                </View>

                {/* Route / Address */}
                {item?.Address ? (
                    <View className="bg-slate-50 rounded-xl p-2.5 mb-3 flex-row items-start border border-slate-100">
                        <Ionicons
                            name="location-sharp"
                            size={16}
                            color={COLORS.primary}
                            style={{ marginTop: 2, marginRight: 6 }}
                        />
                        <Text
                            className="text-[12px] font-medium text-slate-600 flex-1 leading-4"
                            numberOfLines={2}
                        >
                            {item.Address}
                        </Text>
                    </View>
                ) : null}

                {/* Bottom Row: Driver Earning */}
                <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
                    <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                        Driver Share
                    </Text>
                    <View className="flex-row items-center bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                        <Text className="text-[15px] font-black text-emerald-700">
                            ₹{item?.FinalDriverShare ?? 0}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View className="bg-white rounded-2xl p-8 items-center justify-center border border-slate-100 mt-2">
                <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
                    <Ionicons name="receipt-outline" size={32} color="#94a3b8" />
                </View>
                <Text className="text-[16px] font-extrabold text-slate-800 text-center mb-1">
                    No Trips Found
                </Text>
                <Text className="text-[12px] text-slate-400 text-center max-w-[240px] mb-4">
                    There are no completed rides recorded for the selected time
                    period.
                </Text>
                {isFilterApplied ? (
                    <TouchableOpacity
                        onPress={clearFilter}
                        className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex-row items-center"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="refresh-outline"
                            size={14}
                            color={COLORS.primary}
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            className="text-[12px] font-bold"
                            style={{ color: COLORS.primary }}
                        >
                            Reset Filter
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    };

    const renderHeader = () => {
        const totalEarnings = Number(data?.totalEarnings || 0);
        const completedBookings = Number(data?.completedBookings || 0);
        const avgPerTrip =
            completedBookings > 0
                ? Math.round(totalEarnings / completedBookings)
                : 0;

        return (
            <View className="pt-4 pb-2">
                {/* Time Period Filter Pills */}
                <View className="mb-4">
                    <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
                        Time Period
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row"
                    >
                        {filterOption.map((item, index) => {
                            const isSelected =
                                statisticsData.filter === item.value &&
                                !startDate;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() =>
                                        chooseFilter(false, item.value)
                                    }
                                    className={`mr-2.5 px-4 py-2 rounded-full border ${
                                        isSelected
                                            ? "border-transparent"
                                            : "bg-white border-slate-200"
                                    }`}
                                    style={{
                                        backgroundColor: isSelected
                                            ? COLORS.primary
                                            : "#ffffff",
                                        elevation: isSelected ? 2 : 0,
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`font-bold text-[13px] ${
                                            isSelected
                                                ? "text-white"
                                                : "text-slate-600"
                                        }`}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Custom Date Range Card */}
                <View
                    className="bg-white rounded-2xl p-4 border border-slate-100 mb-4"
                    style={{ elevation: 2 }}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="w-7 h-7 rounded-full bg-red-50 justify-center items-center mr-2 border border-red-100">
                                <Ionicons
                                    name="calendar-outline"
                                    size={15}
                                    color={COLORS.primary}
                                />
                            </View>
                            <Text className="text-[13px] font-bold text-slate-800">
                                Custom Date Range
                            </Text>
                        </View>
                        {isFilterApplied && (
                            <TouchableOpacity
                                onPress={clearFilter}
                                className="flex-row items-center bg-red-50 px-2.5 py-1 rounded-full border border-red-100"
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="refresh-outline"
                                    size={13}
                                    color="#dc2626"
                                    style={{ marginRight: 3 }}
                                />
                                <Text className="text-[11px] font-bold text-red-600">
                                    Reset
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row items-center gap-2">
                        {/* Start Date */}
                        <View className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 justify-center items-center">
                            <DatePickers
                                value={startDate}
                                placeholder="Start Date"
                                maximumDate={endDate || new Date()}
                                onChange={(date: Date) => {
                                    setStartDate(date);
                                    setStatisticsData((prev: any) => ({
                                        ...prev,
                                        startDate: formatDate(date),
                                    }));
                                }}
                            />
                        </View>

                        <Text className="text-slate-400 font-bold text-[13px]">
                            to
                        </Text>

                        {/* End Date */}
                        <View className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-2 justify-center items-center">
                            <DatePickers
                                value={endDate}
                                placeholder="End Date"
                                minimumDate={startDate || undefined}
                                maximumDate={new Date()}
                                onChange={(date: Date) => {
                                    setEndDate(date);
                                    setStatisticsData((prev: any) => ({
                                        ...prev,
                                        endDate: formatDate(date),
                                    }));
                                }}
                            />
                        </View>

                        {/* Search Button */}
                        <TouchableOpacity
                            onPress={() => chooseFilter(true)}
                            className="w-11 h-11 rounded-xl justify-center items-center shadow-sm"
                            style={{
                                backgroundColor: COLORS.primary,
                                elevation: 2,
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="search" color="white" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Summary Metrics Cards */}
                <View className="mb-5">
                    {/* Total Earnings Card */}
                    <View
                        className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
                        style={{ elevation: 2 }}
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center border border-emerald-100 mr-2.5">
                                    <Ionicons
                                        name="wallet"
                                        size={20}
                                        color="#059669"
                                    />
                                </View>
                                <View>
                                    <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                        Total Earnings
                                    </Text>
                                    <Text className="text-[11px] font-semibold text-slate-500">
                                        Partner Net Payout
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <Text className="text-[11px] font-extrabold text-emerald-700">
                                    {getActiveFilterLabel()}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-baseline justify-between mt-1">
                            <Text className="text-[30px] font-black text-slate-900 tracking-tight">
                                ₹{totalEarnings.toLocaleString("en-IN")}
                            </Text>

                            {completedBookings > 0 ? (
                                <Text className="text-[12px] font-bold text-slate-500">
                                    Avg. ₹{avgPerTrip} / trip
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    {/* Completed Rides Card */}
                    <View
                        className="bg-white rounded-2xl p-4 border border-slate-100"
                        style={{ elevation: 2 }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-2xl bg-red-50 items-center justify-center border border-red-100 mr-2.5">
                                    <Ionicons
                                        name="car-sport"
                                        size={20}
                                        color={COLORS.primary}
                                    />
                                </View>
                                <View>
                                    <Text className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                        Completed Rides
                                    </Text>
                                    <Text className="text-[11px] font-semibold text-slate-500">
                                        Successful trips delivered
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-red-50 px-3.5 py-1.5 rounded-xl border border-red-100">
                                <Text
                                    className="text-[20px] font-black"
                                    style={{ color: COLORS.primary }}
                                >
                                    {completedBookings}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Trip History Section Header */}
                <View className="flex-row items-center justify-between mb-3 px-1">
                    <View className="flex-row items-center">
                        <Text className="text-[15px] font-extrabold text-slate-900">
                            Recent Trips History
                        </Text>
                        {data?.recentBookings?.length ? (
                            <View className="bg-slate-200/80 px-2 py-0.5 rounded-full ml-2">
                                <Text className="text-[11px] font-bold text-slate-700">
                                    {data.recentBookings.length}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    <Text className="text-[11px] font-semibold text-slate-400">
                        {getActiveFilterLabel()}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: COLORS.primary }}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.primary}
            />

            {/* Header Bar */}
            <View className="h-14 justify-center">
                <Header value={value} backNavigate={backNavigate} />
            </View>

            {/* Main Content Surface */}
            <View className="flex-1 rounded-t-[32px] bg-slate-50 overflow-hidden px-4">
                {loading && !data?.recentBookings ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={data?.recentBookings || []}
                        keyExtractor={(item, index) =>
                            item?.Id?.toString() || index.toString()
                        }
                        renderItem={renderItem}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={renderEmpty}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 40,
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={() => {
                                    fetchData(
                                        statisticsData.filter,
                                        statisticsData.startDate,
                                        statisticsData.endDate
                                    );
                                }}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default Statistics;
