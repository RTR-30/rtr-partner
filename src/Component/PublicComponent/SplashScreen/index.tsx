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
            <Video
                // Can be a URL or a local file.
                source={SplashImg}
                paused={false} // Ensure autoplay is enabled
                resizeMode="cover" // Optional: Adjust how the video fits the screen
                repeat={true}
                ref={videoRef}
                style={{ position: 'absolute',top: 0,left: 0,bottom: 0,right: 0 }}
            />
        </View>
    );
};

export default SplashScreen;