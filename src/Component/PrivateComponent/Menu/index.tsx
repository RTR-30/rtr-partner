import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from "react-native";
import Header from "../../../Common/Header";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Edit from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from "@react-navigation/native";
import AvatarPickerModal, { defaultImg } from "./Avatar";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo"
import { COLORS } from "../../../utils/ColorCode";

const MenuScreen = () => {
    const value = "Menu";
    const navigation: any = useNavigation();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("UserData");
            await AsyncStorage.clear();
            navigation.navigate("Login");
        } catch (error: any) {

        }
    }

    return (
         <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View className="flex-1" style={{ backgroundColor: COLORS.primary }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, width: '90%', height: 40, borderRadius: 10, backgroundColor: '#fff', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 18, fontWeight: 600 }}>Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Statistics")} style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, width: '90%', height: 40, borderRadius: 10, backgroundColor: '#fff', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 18, fontWeight: 600 }}>Statistics</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("MyReferal")} style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, width: '90%', height: 40, borderRadius: 10, backgroundColor: '#fff', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 18, fontWeight: 600 }}>Referal Friend</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("HelpAndFeedback")} style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, width: '90%', height: 40, borderRadius: 10, backgroundColor: '#fff', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 18, fontWeight: 600 }}>Help And Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("ContactUs")} style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, width: '90%', height: 40, borderRadius: 10, backgroundColor: '#fff', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 18, fontWeight: 600 }}>Contact Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout} style={{ justifyContent: 'center', alignItems: 'center', borderWidth: 1, width: '90%', height: 40, borderRadius: 10, backgroundColor: COLORS.primary, marginTop: 10 }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default MenuScreen;

