import React from "react";
import {
    View,
    Text,
    ActivityIndicator,
} from "react-native";

const Loader = () => {

    return (
        <View style={{flex: 1,justifyContent: "center",alignItems: "center",backgroundColor: "rgba(0,0,0,0.5)"}}>
            <View style={{justifyContent:'center', alignItems:'center', backgroundColor:'white', borderRadius:50}}>
                <ActivityIndicator size="large" color="#6200EE" />
            </View>
        </View>
    );
};

export default Loader;
