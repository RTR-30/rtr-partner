import React from "react";
import {
    View,
    Text,
    ActivityIndicator,
} from "react-native";
import { COLORS } from "../../utils/ColorCode";

const Loader = () => {

    return (
        <View style={{flex: 1,justifyContent: "center",alignItems: "center",backgroundColor: "rgba(0,0,0,0.5)"}}>
            <View style={{justifyContent:'center', alignItems:'center', backgroundColor:'white', borderRadius:50}}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        </View>
    );
};

export default Loader;
