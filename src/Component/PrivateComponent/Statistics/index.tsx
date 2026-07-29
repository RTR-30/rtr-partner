import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    ScrollView,
    FlatList
} from "react-native";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showError } from "../../../Common/ToastMessage";
import { StatisticService } from "./helper";
import DatePickers from "../../../Common/DatePicker";

const Statistics = () => {
    const value = "Statistics";
    const backNavigate = true;

    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<any>(null);
    const [data, setData] = useState<any>({});

    const [startDate, setStartDate] = useState<any>();
    const [endDate, setEndDate] = useState<any>();

    const filterOption = [
        { key: 'All', value: 'all_time' },
        { key: 'Today', value: 'today' },
        { key: 'This Week', value: 'this_week' },
        { key: 'This Month', value: 'this_month' }
    ]

    const defaultValue = 'all_time'
    const [statisticsData, setStatisticsData] = useState<any>({
        filter: defaultValue,
        startDate: '',
        endDate: ''
    })

    const chooseFilter = async (selectFilter: any, values?: any, tokens?: any) => {
        if (selectFilter) {
            
            if (!statisticsData?.startDate || !statisticsData?.endDate) {
                return showError('Start Date & End Date are required');
            }
            
            const value = await {
                startDate: statisticsData?.startDate,
                endDate: statisticsData?.endDate
            }
            setStatisticsData({
                ...statisticsData,
                filter: defaultValue,
            })
            fetchData(token, value, selectFilter)
            
        } else {
            
            setStatisticsData({
                ...statisticsData,
                filter: values,
            })
            
            fetchData(tokens, values, selectFilter)
        }
    }
    
    const fetchData = async (tokens?: any, value?:any, selectFilter?:any) => {
        
        setLoading(true)
        const payload = {
            filter: !selectFilter ? value : statisticsData?.filter,
            startDate: selectFilter ? value.startDate : statisticsData?.startDate,
            endDate: selectFilter ? value.endDate : statisticsData?.endDate,
        }

        console.log(payload);
        
        try {
            const res = await StatisticService(tokens, payload)
            const { data: { success = false, data = {} } } = res
            console.log(data);
            
            if (success === true) {
                setData(data)
            } else {
                showError("Something went wrong")
            }

        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const fetchUserData = async () => {
        try {
            const tokens: any = await AsyncStorage.getItem("token");
            if (tokens) {
                await setToken(tokens);
                chooseFilter(false, statisticsData?.filter, tokens)
            }
        } catch (error) {
            showError(error);
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <View
                className="mb-3 p-4 bg-white rounded-xl border-[0.5px] border-[#000]"
                style={{
                    elevation: 3,
                    shadowColor: "#000"
                }}
            >
                <View className="flex-row justify-end">
                    <Text className="font-bold text-[12px]" style={{color:"orange"}}>{item.Status}</Text>
                </View>
                
                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[50%]">
                        <Text className="text-[12px] font-bold" style={{color: COLORS.primary}}>Customer Name</Text>
                    </View>

                    <View className="w-[50%]">
                        <Text className="text-[12px] text-black font-bold">: {item.Name}</Text>
                    </View>
                </View>

                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[50%]">
                        <Text className="text-[12px] font-bold" style={{color: COLORS.primary}}>Driver Share</Text>
                    </View>

                    <View className="w-[50%]">
                        <Text className="text-[12px] text-black font-bold">: ₹{item.FinalDriverShare}</Text>
                    </View>
                </View>

                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[50%]">
                        <Text className="text-[12px] font-bold" style={{color: COLORS.primary}}>Address</Text>
                    </View>

                    <View className="w-[50%]">
                        <Text className="text-[12px] text-black font-bold">: {item.Address}</Text>
                    </View>
                </View>

                <View className="w-full flex-row justify-center my-1">
                    <View className="w-[50%]">
                        <Text className="text-[12px] font-bold" style={{color: COLORS.primary}}>ClosedAt</Text>
                    </View>

                    <View className="w-[50%]">
                        <Text className="text-[12px] text-black font-bold">: {new Date(item.ClosedAt).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
        );
    };

    useEffect(() => {
        fetchUserData()
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View style={{ flex: 1 }}>
                <Header value={value} backNavigate={backNavigate} />
            </View>

            <View style={{ flex: 9, padding: 10, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
                <View className="flex-1">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 13 }}
                    >
                        {filterOption.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() =>

                                    chooseFilter(false, item.value, token)
                                }
                                className={`mr-3 px-4 py-2 rounded-xl justify-center items-center w-28`}
                                style={{ backgroundColor: statisticsData.filter === item.value ? COLORS.primary : 'lightgray' }}
                            >
                                <Text
                                    className={`font-bold text-[14px] ${statisticsData.filter === item.value
                                        ? "text-white"
                                        : "text-black"
                                        }`}
                                >
                                    {item.key}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="p-2 w-full flex-row justify-around border-t-[0.5px] border-black">
                        <View className="w-[40%] h-11 bg-gray-300 p-2 justify-center items-center rounded-xl">
                            <DatePickers
                                value={startDate}
                                placeholder="Start Date"
                                maximumDate={endDate || new Date()}
                                onChange={(date) => {
                                    setStartDate(date);
                                    setStatisticsData((prev: any) => ({
                                        ...prev,
                                        startDate: formatDate(date),
                                    }));
                                }}
                            />
                        </View>

                        <View className="w-[40%] h-11 bg-gray-300 p-2 justify-center items-center rounded-xl">
                            <DatePickers
                                value={endDate}
                                placeholder="End Date"
                                minimumDate={startDate}
                                maximumDate={new Date()}
                                onChange={(date) => {
                                    setEndDate(date);
                                    setStatisticsData((prev: any) => ({
                                        ...prev,
                                        endDate: formatDate(date),
                                    }));
                                }}
                            />
                        </View>

                        <View className="w-[12%] h-11 bg-blue-600 p-2 justify-center items-center rounded-xl">
                            <TouchableOpacity onPress={() => chooseFilter(true)} className="h-full w-full justify-center items-center">
                                <Ionicons name="search" color={'white'} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 5 }}>
                    <View className="p-2 flex-row mt-10 w-full justify-around bg-white">
                        <View className="p-2 w-[46%] h-24 border-[2px] rounded-lg bg-white" style={{ elevation: 3, shadowColor: 'black', borderColor: COLORS.primary }}>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[14px] font-bold text-black text-center">Total Complete Ride</Text>
                            </View>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[20px] font-bold" style={{ color: COLORS.primary }}>{data?.completedBookings}</Text>
                            </View>
                        </View>

                        <View className="p-2 w-[46%] h-24 border-[2px] rounded-lg bg-white" style={{ elevation: 3, shadowColor: 'black', borderColor: COLORS.primary }}>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[14px] font-bold text-black text-center">Total Complete Amount</Text>
                            </View>
                            <View className="w-full h-[50%] justify-center items-center">
                                <Text className="text-[20px] font-bold" style={{ color: COLORS.primary }}>{data?.totalEarnings}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="w-full mt-5">
                        <View className="w-full p-2">
                            <Text className="text-black text-[16px] font-bold">Order Details History</Text>
                        </View>
                        
                        <View className="w-full p-2">
                            <FlatList
                                data={data?.recentBookings || []}
                                keyExtractor={(item) => item.Id.toString()}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={() => (
                                    <View className="justify-center items-center mt-10">
                                        <Text className="text-gray-500">No Bookings Found</Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Statistics;