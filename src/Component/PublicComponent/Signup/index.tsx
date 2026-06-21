import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ToastAndroid, TouchableOpacity } from "react-native";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Dimensions,
    TextInput,
    Image,
    Modal
} from "react-native";
import { fetchSignUp, signUpVerifyingMail, signUpVerifyingOtp } from "./helper";
import Loader from "../../../Common/Loader";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import OneTimeCodeTextComponent from "../../../Common/OneTimeCodeText";
import { appLogo } from "../../../Common/images/index";
import { COLORS } from "../../../utils/ColorCode";

const SignUp = () => {
    const navigation: any = useNavigation();
    const route: any = useRoute()
    const {referral} = route.params || {};
    const [value, setValue] = useState<any>(null);
    const [showLoader, setShowLoader] = useState<boolean>(false);
    
    const [errName, setErrName] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [errPassword, setErrPassword] = useState(false);
    const [errConfirmPassword, setErrConfirmPassword] = useState(false);
    const [errMobileNo, setErrMobileNo] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [referalcode, setReferalCode] = useState("");

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [otp, setOtp] = useState<any>(null);

    const toggleModal = () => {
        setOpenModal(!openModal);
    }

    const checkCondition = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(email);
        if (!name || !email || !password || !confirmPassword || !mobileNo) {
            setErrName(!name);
            setErrEmail(!email || !isEmailValid);
            setErrPassword(!password);
            setErrConfirmPassword(!confirmPassword);
            setErrMobileNo(!mobileNo);
        } else if (!isEmailValid) {
            setErrEmail(true);
        } else if (password !== confirmPassword) {
            setErrConfirmPassword(true);
        } else {
            setShowLoader(true);
            const data = {
                email : email
            }
            
            try {
                const response = await signUpVerifyingMail(data)
                ToastAndroid.show(response?.data.message, ToastAndroid.SHORT);
                toggleModal()
            } catch (error: any) {
                console.log(error, "error");
                
                ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT)
            } finally{
                setShowLoader(false);
            }
        }
    };

    const checkOtp = async () => {
        setShowLoader(true)
        const data = {
            email : email,
            otp: otp
        }
        try{
            const response = await signUpVerifyingOtp(data);
            if(response.data.success === true){
                ToastAndroid.show(response?.data.message, ToastAndroid.SHORT);
                handleSignUp();
                toggleModal();
            }
        } catch(error:any){
            ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT);
        } finally{
            setShowLoader(false);
        }
    }

    const handleSignUp = async () => {
        setShowLoader(true);
        const data = {
            "name": name,
            "email": email,
            "mobileno": mobileNo,
            "password": password,
            "field": "Car Driver",
            'otp': otp,
            'referralCode' : referalcode !== "" ? referalcode : null
        }

        try {
            const response = await fetchSignUp(data)
            
            // if (response.status === 200) {
            setName("");
            setEmail("");
            setMobileNo("");
            setPassword("");
            setConfirmPassword("");
            navigation.navigate("Login");
            // }
        } catch (error) {
            console.error(error);
        } finally {
            setShowLoader(false);
        }
    };


    return (
        <SafeAreaView className="flex-1 justify-center items-center" style={{backgroundColor: COLORS.background}}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

            {showLoader && (
                <View
                    style={{
                        zIndex: 200,
                    }}
                    className="absolute w-full h-full"
                >
                    <Loader />
                </View>
            )}
            
            <View className="flex-1 justify-center items-center">
                <View style={{ elevation: 3 }} className="w-[97%] justify-center items-center shadow-black bg-white rounded-[20px] p-[5%]">
                    <View className="w-[100%]">
                        <Image
                            source={appLogo}
                            className="w-24 h-24 rounded-full border-[1px] border-black"
                            resizeMode="cover"
                        />
                    </View>
                    
                    <Text className="text-black mt-4 text-[20px] font-bold mb-5">Create Account</Text>

                    <View className="w-[99%] mt-1 h-[10%]" style={{ marginVertical: 1 }}>
                        <View className="flex-row w-full justify-center items-center border-[0.5px] rounded-[10px]">
                            <FontAwesome name="user" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                placeholder="Enter name"
                                placeholderTextColor="gray"
                                onChangeText={(txt) => {
                                    setName(txt);
                                    setErrName(!txt);
                                }}
                            />
                        </View>
                        {errName && <Text className="text-red-500 font-semibold">Name is required</Text>}
                    </View>

                    <View className="w-[99%] mt-1 h-[10%]" style={{ marginVertical: 1 }}>
                        <View className="flex-row w-full justify-center items-center border-[0.5px] rounded-[10px]">
                            <MaterialIcons name="email" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                placeholder="Enter email id"
                                placeholderTextColor="gray"
                                onChangeText={(txt) => {
                                    setEmail(txt);
                                    setErrEmail(!txt);
                                }}
                            />
                        </View>
                        {errEmail && <Text className="text-red-500 font-semibold">{email.length === 0 ? 'Email is required' : 'Invalid email address'}</Text>}
                    </View>

                    <View className="w-[99%] mt-1 h-[10%]" style={{ marginVertical: 1 }}>
                        <View className="flex-row w-full justify-center items-center border-[0.5px] rounded-[10px]">
                            <MaterialIcons name="phone" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                placeholder="Enter mobile number"
                                placeholderTextColor="gray"
                                keyboardType='number-pad'
                                value={mobileNo}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    setMobileNo(cleaned);
                                    // setMobileNo(text);
                                    setErrMobileNo(!text);
                                }}
                            />
                        </View>
                        {errMobileNo && <Text className="text-red-500 font-semibold">Mobile number is required</Text>}
                    </View>

                    {referral ? 
                        <View className="w-[99%] mt-1 h-[10%]" style={{ marginVertical: 1 }}>
                            <View className="flex-row w-full justify-center items-center border-[0.5px] rounded-[10px]">
                                <Ionicons name="people" color={"black"} size={20} style={{ alignSelf: 'center' }} />
                                <TextInput
                                    style={{ color: "black", paddingHorizontal: 10, height: 40, width: '90%' }}
                                    placeholder="Enter referal code"
                                    placeholderTextColor="gray"
                                    value={referalcode}
                                    onChangeText={(text) => {
                                        setReferalCode(text);
                                    }}
                                />
                            </View>
                            {errMobileNo && <Text className="text-red-500 font-semibold">Mobile number is required</Text>}
                        </View> : null
                    }

                    <View className="w-[99%] mt-1 h-[10%]" style={{ marginVertical: 1 }}>
                        <View className="flex-row w-full justify-center items-center border-[0.5px] rounded-[10px]">
                            <View className="items-center w-[10%] justify-center h-full">
                                <FontAwesome name="lock" size={20} color={"black"} />
                            </View>
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '80%' }}
                                placeholder="Enter password"
                                placeholderTextColor="gray"
                                secureTextEntry={!passwordVisible}
                                onChangeText={(txt) => {
                                    setPassword(txt);
                                    setErrPassword(!txt);
                                }}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} className="w-[10%]">
                                <FontAwesome name={!passwordVisible ? "eye" : "eye-slash"} size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {errPassword && <Text className="text-red-500 font-semibold">Password is required</Text>}
                    </View>

                    <View className="w-[99%] mt-1 h-[10%]" style={{ marginVertical: 1 }}>
                        <View className="flex-row w-full justify-center items-center border-[0.5px] rounded-[10px]">
                            <View className="items-center w-[10%] justify-center h-full">
                                <FontAwesome name="lock" size={20} color={"black"} />
                            </View>
                            <TextInput
                                style={{ color: "black", paddingHorizontal: 10, height: 40, width: '80%' }}
                                placeholder="Confirm password"
                                placeholderTextColor="gray"
                                secureTextEntry={!confirmPasswordVisible}
                                onChangeText={(txt) => {
                                    setConfirmPassword(txt);
                                    setErrConfirmPassword(!txt);
                                }}
                            />
                            <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="w-[10%]">
                                <FontAwesome name={!confirmPasswordVisible ? "eye" : "eye-slash"} size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        {errConfirmPassword && <Text className="text-red-500 font-semibold">Confirm Password is required</Text>}
                    </View>

                    <View className="mt-4 w-full justify-center items-center">
                        {
                            showLoader ? (
                                <View className="w-[150px] h-[40px] bg-[#9400FF] justify-center items-center rounded-[10px]">
                                    <ActivityIndicator color={"white"} size={"small"}/>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={checkCondition} className="w-[150px] h-[40px] justify-center items-center rounded-[10px]" style={{backgroundColor:COLORS.primary}}>
                                    <Text className="text-white font-semibold text-[18px]">Continue</Text>
                                </TouchableOpacity>
                            )
                        }

                        <View className="flex-row mt-5">
                            <Text className="text-black text-[14px] font-semibold">Already have an account?</Text>
                            <TouchableOpacity className="ml-1" onPress={() => navigation.navigate("Login")}>
                                <Text className="text-[14px] font-semibold" style={{color: COLORS.primary}}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Modal
                    visible={openModal}
                    transparent
                    animationType="fade"
                    onRequestClose={toggleModal}
                >
                    <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <View className="w-[90%] bg-white shadow-black p-6 rounded-2xl items-center" style={{ elevation: 5 }}>
                            <Text className="text-lg font-bold text-black mb-3">OTP Verify</Text>
                            <Text className="text-center text-black mb-5">Check your email id :  <Text className="text-blue-700">{email}</Text></Text>
                            <View className="mt-5">
                                <Text className="text-black text-[12px] font-bold">Enter Your OTP</Text>
                                <View>
                                    <OneTimeCodeTextComponent
                                        value={otp}
                                        onChangeText={(value: string) => setOtp(value)}
                                    />
                                </View>
                            </View>
                            <View className="mt-5">
                                <TouchableOpacity onPress={checkOtp} className="w-[150px] h-[40px] bg-[#9400FF] justify-center items-center rounded-[10px]">
                                    <Text className="text-white text-[18px] font-bold">Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>
    );
};

export default SignUp;
