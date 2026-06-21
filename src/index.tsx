import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { COLORS } from "./utils/ColorCode";

const InitialPage = () => {
    const navigation: any = useNavigation();

    const fetchUserData = async () => {
        try {
            const storedUserData: any = await AsyncStorage.getItem("UserData");

            if (storedUserData) {
                navigation.navigate("Home")
            } else {
                navigation.navigate("Splash");
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <StatusBar backgroundColor={COLORS.primary} barStyle={"light-content"} />
    )
}

export default InitialPage;

// const InitialPage = () => {
//     const navigation = useNavigation();

    

//     useEffect(() => {
//         const checkUser = () => {
//             //     if (user) {
//             //         navigation.navigate("OwnerHome");
//             //     } else {
//             //         navigation.navigate("Onboard");
//             //     }
//             // }
//             navigation.navigate("Splash");
//         }

//         checkUser();
//     }, [])
// };

// export default InitialPage;