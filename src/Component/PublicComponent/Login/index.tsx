import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { FetchLogin } from "./helper";
import Loader from "../../../Common/Loader";

// const LoginImg = require('../../../../assets/Image/CarLogin.png');

const Login = () => {
    const navigation = useNavigation();

    const [showLoader, setShowLoader] = useState<boolean>(false);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [errEmail, setErrEmail] = useState<boolean>(false);
    const [errPassword, setErrPassword] = useState<boolean>(false);

    const checkCondition = () => {
        if (!email || !password) {
            setErrEmail(!email);
            setErrPassword(!password)
        } else {
            handleLogin();
        }
    }

    const handleLogin = async () => {
        setShowLoader(true);

        const formData: any = {
            "email": email,
            "password": password
        };

        try {
            const response = await FetchLogin(formData);
            console.log('====================================');
            console.log(response);
            console.log('====================================');
            if (response.status === 200) {
                const userData: any = {
                    name: response.data.name,
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber,
                    id: response.data.id
                }
                setEmail("");
                setPassword("");

                // dispatch(setUser(userData));
                navigation.navigate("Home");
            }
        } catch (error) {
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar backgroundColor={"#5a639c"} barStyle={"dark-content"} />

            {
                showLoader && (
                    <View style={{ position: 'absolute', height: '100%', width: '100%' }}>
                        <Loader />
                    </View>
                )
            }
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

                <View style={{ width:'100%', height:'50%', backgroundColor: '#fff' }}>
                    {/* <Image
                        source={LoginImg}
                        style={{ width:'100%', height:'100%' }}
                        resizeMode="contain"
                    /> */}
                </View>

                <View style={{ flex: 1, width: '100%', backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', bottom:30 }}>Login</Text>
                    <View style={{ width: '90%', backgroundColor: '#ffffff', padding: 5 }}>
                        <View style={{ padding: 5, backgroundColor: '#ffffff' }}>
                            <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>Email id :</Text>
                            <TextInput
                                style={{ color: 'black', borderWidth: 0.5, borderRadius: 10 }}
                                placeholder="Enter email id"
                                placeholderTextColor={"gray"}
                                onChangeText={(txt: any) => {
                                    setEmail(txt);
                                    setErrEmail(!txt)
                                }}
                            />
                            {errEmail && <Text style={{ color: "red", fontWeight: "400", }}>mail is required</Text>}
                        </View>

                        <View style={{ padding: 5, backgroundColor: '#ffffff' }}>
                            <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>Password :</Text>
                            <TextInput
                                style={{ color: 'black', borderWidth: 0.5, borderRadius: 10 }}
                                placeholder="Enter password"
                                placeholderTextColor={"gray"}
                                onChangeText={(txt: any) => {
                                    setPassword(txt);
                                    setErrPassword(!txt);
                                }}
                            />
                            {errPassword && <Text style={{ color: "red", fontWeight: '400' }}>password is required</Text>}
                        </View>
                    </View>

                    <View style={{ marginTop: 20, width: '90%', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            // onPress={()=>navigation.navigate("Home")}
                            onPress={checkCondition}
                            style={{ width: '50%', height: 40, backgroundColor: '#9400FF', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Login</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>Don't have a account ? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                            <Text style={{ color: '#5a639c', fontSize: 16, fontWeight: '700' }}>Creare Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default Login;