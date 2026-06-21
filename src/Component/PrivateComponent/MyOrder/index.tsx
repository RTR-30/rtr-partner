import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from "react-native";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";

const MyOrder = () => {
    const value = "MyOrder";
    const backNavigate = true;
    return(
        <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View style={{ flex: 1 }}>
                <Header value={value} backNavigate={backNavigate} />
            </View>

            <View style={{ flex: 9, padding: 10, backgroundColor: '#fff', borderTopLeftRadius:30, borderTopRightRadius:30 }}>
                
            </View>
        </View>
    );
};

export default MyOrder;