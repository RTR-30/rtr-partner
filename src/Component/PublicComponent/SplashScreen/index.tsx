import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from "react-native";
import Video, { VideoRef } from "react-native-video";

const SplashImg = require("../../../../assets/Imgs/Splash.mp4");

const SplashScreen = () => {
    const videoRef = useRef<VideoRef>(null);
    const navigation = useNavigation(); // Access navigation object

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigation.navigate("Login"); // Navigate to the Login screen
        }, 5000); // 5-second delay

        return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }, [navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'#fff' }}>
            <Text>Splash Screen Loading...</Text>
        </View>
    );
};

export default SplashScreen;