import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    FlatList
} from "react-native";

import Header from "../../../Common/Header/index";
import Loader from "../../../Common/Loader";
import { fetchAllDuty } from "./helper";

import RenderList from "./renderList";

const DutyScreen = () => {
    const navigation = useNavigation();
    const value = "Duty";

    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [dutyData, setDutyData] = useState<any[]>([]);

    const fetchData = async () => {
        setShowScanner(true);
        try {
            const response = await fetchAllDuty();
            setDutyData(response.data);
        } catch (error) {
            console.log(error)
        } finally {
            setShowScanner(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, width: '100%' }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9 }}>
                <View style={{ flex: 1, margin: 10 }}>
                    <FlatList
                        data={dutyData}
                        renderItem={({ item }: any) => <RenderList item={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                        style={{ marginTop: 3 }}
                    />
                </View>
            </View>
        </View>
    );
};

export default DutyScreen;

