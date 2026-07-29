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
import { showError } from "../../../Common/ToastMessage";

const NoData = require("../../../../assets/Imgs/NoDatas.png");

const MyDuty = () => {
    const value = "My Duty";
    const [loading, setLoading] = useState<boolean>(false);
    const [token, setToken] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);

    const [payDetails, setPayDetails] = useState<any>({
        payment_link: '',
        qr_code: '',
        link_id: '',
        active: false
    })

    const fetchAcceptList = async (tokens?: any) => {
        setLoading(true);
        try {
            const res = await AcceptList(tokens);
            const { data: { bookings = [], message = '', success = false } } = res
            
            if (success === true) {
                setData(bookings)
            }
        } catch (error) {
            showError("Error Accept List");
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
            showError(error);
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
                        renderItem={({ item }: any) => 
                            <RenderHelper 
                                item={item} 
                                token={token} 
                                setLoading={setLoading} 
                                fetchAcceptList={fetchAcceptList}
                                payDetails={payDetails}
                                setPayDetails={setPayDetails}
                            />
                        }
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

