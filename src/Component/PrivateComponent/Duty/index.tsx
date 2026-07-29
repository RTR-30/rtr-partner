import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    FlatList,
    ActivityIndicator,
    ToastAndroid,
    RefreshControl,
    Image
} from "react-native";

import Header from "../../../Common/Header/index";
import Loader from "../../../Common/Loader";
import { fetchAllDuty, gearTypeService, UpdateBooking } from "./helper";

import RenderList from "./renderList";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";

const NoData = require("../../../../assets/Imgs/NoDatas.png");

const DutyScreen = () => {
    const navigation: any = useNavigation();
    const isEnabled = useSelector((state: any) => state.status.isEnabled);
    const [token, setToken] = useState<any>(null);
    const [latlong, setlatLong] = useState<any>(null);
    const value = "Duty";

    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [dutyData, setDutyData] = useState<any[]>([]);
    const [totalDataList, setTotalDataList] = useState<any>(null);
    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [gearType, setGearType] = useState<any[]>([]);
    const [selectedGearType, setSelectedGearType] = useState("All");

    const fetchData = async (token: any, limit: any, page: any, region: any) => {
        if (footerLoader) {
            setShowLoader(false);
        } else {
            setShowLoader(true);
        }

        try {
            const response = await fetchAllDuty(token, limit, page, region?.lat, region?.long, selectedGearType);

            setTotalDataList(response.data.total)
            setDutyData(response.data.bookingList);
        } catch (error) {
            showError(error)
        } finally {
            setShowLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    }

    const fetchGearType = async (token: any) => {
        setShowLoader(true);
        try {
            const res = await gearTypeService(token);
            const { data: { success = false, data = [], message = "" } } = res
            if (success === true) {
                setGearType(["All", ...data]);
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setShowLoader(false)
        }
    }

    const onRefresh = () => {
        setOnRefreshing(true);
        setShowLoader(false);
        setFooterLoader(false);
        setTotalDataList(null);
        setCurrentPageLimit(10);
        setDutyData([]);
        fetchUserData().then(() => {
            fetchData(token, currentPageLimit, 1, latlong).catch(() => {
                ToastAndroid.show("Check Internet Connection", ToastAndroid.SHORT);
            }).finally(() => {
                setShowLoader(false);
                setOnRefreshing(false);
                setFooterLoader(false);
            })
        })
    }

    const loadMore = () => {
        setCurrentPageLimit(currentPageLimit + 10);
        setFooterLoader(true);
    }

    const fetchUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("UserData");
            const region: any = await AsyncStorage.getItem("latlong");

            const tokens: any = await AsyncStorage.getItem("token");
            if (storedUserData || tokens || region) {
                const regi = JSON.parse(region);
                setToken(tokens);
                setlatLong(regi)
                await fetchGearType(tokens)
                await fetchData(tokens, currentPageLimit, 1, regi);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    const renderLoader = () => {
        return (
            totalDataList !== dutyData.length && (
                <View className="items-center my-[16px] h-[20px]">
                    {
                        footerLoader && <ActivityIndicator size={"large"} color={"#5a639c"} />
                    }
                </View>
            )
        )
    }

    useEffect(() => {
        if(token !== null){
            fetchData(token, currentPageLimit, 1, latlong)
        }
    }, [selectedGearType])

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.primary }}>

            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            {
                showLoader && (
                    <View style={{ position: 'absolute', height: '100%', width: '100%' }}>
                        <Loader />
                    </View>
                )
            }

            <View style={{ flex: 9, padding: 10, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>

                {
                    !isEnabled ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'red', fontSize: 18, fontWeight: '600' }}>You're Offline mode</Text>
                            <Text style={{ color: 'black', fontSize: 13, fontWeight: '400' }}>Go to home screen to switch <Text style={{ color: 'green', fontWeight: '500' }}>Online</Text> mode</Text>

                            <TouchableOpacity onPress={() => navigation.navigate("Home")} style={{ marginTop: '10%', width: '60%', height: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'blue', borderRadius: 10 }}>
                                <Text style={{ textAlign: 'center', color: 'white', fontSize: 12, fontWeight: '500' }}>Home</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {dutyData.length > 0 ? (
                                <>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                            marginBottom: 10,
                                        }}
                                    >
                                        {gearType.map((item, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => setSelectedGearType(item)}
                                                style={{
                                                    paddingHorizontal: 18,
                                                    paddingVertical: 8,
                                                    borderRadius: 20,
                                                    marginRight: 10,
                                                    marginBottom: 10,
                                                    backgroundColor:
                                                        selectedGearType === item ? COLORS.primary : "#F2F2F2",
                                                }}
                                            >
                                                <Text
                                                    className="font-bold"
                                                    style={{ color: selectedGearType === item ? "#FFF" : "#000" }}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <FlatList
                                        data={dutyData}
                                        renderItem={({ item }: any) => <RenderList item={item} setShowLoader={setShowLoader} token={token} />}
                                        keyExtractor={(item, index) => index.toString()}
                                        refreshControl={<RefreshControl refreshing={onRefreshing} onRefresh={onRefresh} tintColor={"#6200EE"} />}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 10 }}
                                        style={{ marginTop: 3 }}
                                        ListFooterComponent={renderLoader}
                                        onEndReached={loadMore}
                                        onEndReachedThreshold={0}
                                    />
                                </>
                            ) : (
                                <View className="flex-1">
                                    {!showLoader && (
                                        <Image
                                            source={NoData}
                                            className="h-full w-full"
                                        />
                                    )}
                                </View>
                            )}
                        </>
                    )
                }
            </View>
        </View>
    );
};

export default DutyScreen;

