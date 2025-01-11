import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";

const InitialPage = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const checkUser = () => {
            //     if (user) {
            //         navigation.navigate("OwnerHome");
            //     } else {
            //         navigation.navigate("Onboard");
            //     }
            // }
            navigation.navigate("Splash");
        }

        checkUser();
    }, [])
};

export default InitialPage;