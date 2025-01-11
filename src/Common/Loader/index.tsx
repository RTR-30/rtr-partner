import React from "react";
import {
    View,
    Text,
    ActivityIndicator,
} from "react-native";

const Loader = () => {

    return (
        <View style={{flex: 1,justifyContent: "center",alignItems: "center",backgroundColor: "rgba(0,0,0,0.5)"}}>
            <ActivityIndicator size="large" color="#6200EE" style={{backgroundColor: "rgba(0,0,0,0.5)"}} />
        </View>
    );
};

export default Loader;
