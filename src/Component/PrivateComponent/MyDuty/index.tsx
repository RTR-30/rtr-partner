import React, { useState } from "react";
import {
    View,
    FlatList,
    ToastAndroid,
    Image
} from "react-native";
import Header from "../../../Common/Header";
import RenderHelper from "./RenderHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { AcceptList } from "./helper";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";

const NoData = require("../../../../assets/Imgs/NoDatas.png");

const MyDuty = () => {
    const value = "My Duty";
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    
    const fetchAcceptList = async (tokens?: any) => {
        setLoading(true);
        try {
            const res = await AcceptList(tokens);
            setData(res?.data?.bookings)
        } catch (error) {
            ToastAndroid.show("Error Accept List", ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    }

    const fetchUserData = async () => {
        try {
            const tokens: any = await AsyncStorage.getItem("token");
            if (tokens) {
                fetchAcceptList(tokens);
                await setToken(tokens);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

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

            {loading && (
                <View className="h-full w-full absolute" style={{ zIndex: 10 }}>
                    <Loader />
                </View>
            )}

            <View style={{ flex: 9, padding: 10, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
                {data?.length > 0 ? (
                    <FlatList
                        data={data}
                        renderItem={({ item }: any) => <RenderHelper item={item} token={token} setLoading={setLoading} fetchAcceptList={fetchAcceptList}/>}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                        style={{ marginTop: 3 }}
                    />
                ) : (
                    <View className="flex-1">
                        {!loading && 
                            <Image
                                source={NoData}
                                className="h-full w-full"
                            />
                        }
                    </View>
                )}
            </View>
        </View>
    );
};

export default MyDuty;

