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
    ScrollView,
    ToastAndroid
} from "react-native";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import { FetchLogin } from "./helper";
import Loader from "../../../Common/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { COLORS } from "../../../utils/ColorCode";

const LoginImg = require('../../../../assets/Imgs/CarLogin.png');
const Logo = require("../../../../assets/Imgs/Logo.png")

const Login = () => {
    const navigation: any = useNavigation();
    const dispatch = useDispatch();

    const [showLoader, setShowLoader] = useState<boolean>(false);

    const [email, setEmail] = useState<any>(null);
    const [password, setPassword] = useState<any>(null);

    const [passwordVisible, setPasswordVisible] = useState(false);

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

        const data: any = {
            "email": email,
            "password": password
        }
        
        try {
            const response = await FetchLogin(data);
            
            if (response.status === 200) {
                await AsyncStorage.setItem("UserData", JSON.stringify(response.data.user));
                await AsyncStorage.setItem("token", response.data.token);
                navigation.navigate("Home");
                setEmail(null);
                setPassword(null);
            };
            
        } catch (error:any) {
            ToastAndroid.show("Login failed. Please try again.", ToastAndroid.SHORT);
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor={COLORS.primary} barStyle={"light-content"} />

            {
                showLoader && (
                    <View className="h-full w-full absolute" style={{zIndex:10}}>
                        <Loader />
                    </View>
                )
            };

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
                <View className="flex-1 justify-center items-center">
                    <Image
                        source={Logo}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                <View className="flex-2 justify-center items-center" style={{backgroundColor: COLORS.background}}>
                    <Text className="text-black-700 text-[20px] text-center font-bold">Login</Text>
                    <View className="w-full justify-center items-center mt-10">
                        <View className="flex-row w-[90%] justify-center items-center border-[0.5px] rounded-[10px]">
                            <FontAwesome name="user" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: 'black', width: '90%' }}
                                placeholder="Enter email id"
                                placeholderTextColor={"gray"}
                                onChangeText={(txt: any) => {
                                    setEmail(txt);
                                    setErrEmail(!txt)
                                }}
                            />
                        </View>
                        {errEmail && <Text className="text-red-600 font-semibold w-full ml-10">mail is required</Text>}
                    </View>

                    <View className="w-full justify-center items-center mt-5">
                        <View className="flex-row w-[90%] justify-center items-center border-[0.5px] rounded-[10px]">
                            <FontAwesome name="lock" size={20} color={"black"} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: 'black', width: '80%' }}
                                placeholder="Enter password"
                                placeholderTextColor={"gray"}
                                secureTextEntry={!passwordVisible}
                                onChangeText={(txt: any) => {
                                    setPassword(txt);
                                    setErrPassword(!txt);
                                }}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={{ width: '10%' }}>
                                <FontAwesome name={!passwordVisible ? "eye" : "eye-slash"} size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {errPassword && <Text className="text-red-600 font-semibold w-full ml-10">password is required</Text>}

                    </View>
                    <View className="w-full">
                        <TouchableOpacity className="self-end mr-5" onPress={()=>navigation.navigate("ForgetPassword")}>
                            <Text className="text-[16px] font-bold" style={{color: COLORS.primary}}>Forget Password</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-10 w-[90%] justify-center items-center">
                        <TouchableOpacity
                            onPress={checkCondition} style={{backgroundColor: COLORS.primary}}
                            className="w-[50%] h-[40px] justify-center items-center rounded-[10px]"
                        >
                            <Text className="text-white text-[18px] font-bold">Login</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-5 mt-10 flex-row">
                        <Text className="text-black-500 text-[16px] font-bold">Don't have a account ? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("SignUp", { referral: false})}>
                            <Text className="text-[16px] font-bold" style={{color: COLORS.primary}}>Create Account</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row mb-3">
                        <Text className="text-black-500 text-[16px] font-bold">Do have any referal ? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("SignUp", { referral: true})}>
                            <Text className="text-[16px] font-bold" style={{color: COLORS.primary}}>Referal</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default Login;