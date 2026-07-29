import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ToastAndroid,
    ActivityIndicator
} from "react-native";
import OneTimeCodeTextComponent from "../../../Common/OneTimeCodeText";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { forgetedPassword, VerifyingMail, verifyingOtp } from "./helper";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const forgetPassword = () => {
    const navigation: any = useNavigation();
    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [email, setEmail] = useState<any>(null);
    const [otp, setOtp] = useState<any>(null);
    const [newPassword, setNewPassword] = useState<any>(null);
    const [confirmPassword, setConfirmPassword] = useState<any>(null);

    const [mailVerify, setMailVerify] = useState<boolean>(false);
    const [otpVerify, setOtpVerify] = useState<boolean>(false);

    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const verifyMail = async () => {
        setShowLoader(true);
        const data = {
            email: email
        }
        try {
            const res = await VerifyingMail(data);
            
            setMailVerify(res?.data.success)
            setTimer(60);
            showSuccess(res?.data.message)
        } catch (error) {
            showError(error)
        } finally {
            setShowLoader(false);
        }
    };

    const handleVerifyOtp = async () => {
        setShowLoader(true);
        const data = {
            email: email,
            otp: otp
        }

        try {
            const res = await verifyingOtp(data);
            setOtpVerify(res?.data.success)
            ToastAndroid.show(res?.data.message, ToastAndroid.SHORT);
        } catch (error: any) {
            ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT);
        } finally {
            setShowLoader(false);
        }
    }

    const checkPassword = () => {
        if (newPassword === confirmPassword) {
            resetPasseords()
        } else {
            ToastAndroid.show("mismatch your confirm password", ToastAndroid.SHORT);
        }
    }

    const resetPasseords = async () => {
        setShowLoader(true);
        const data = {
            otp: otp,
            email: email,
            password: newPassword
        }

        try {
            const res = await forgetedPassword(data);
            ToastAndroid.show(res?.data.message, ToastAndroid.SHORT);
            navigation.navigate("Login");
        } catch (error) {
            ToastAndroid.show("error", ToastAndroid.SHORT);
        } finally {
            setShowLoader(false);
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timer > 0) {
            setCanResend(false);
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = () => {
        verifyMail();
    };

    return (
        <View className="flex-1 justify-center items-center" style={{backgroundColor: COLORS.background}}>
            {
                showLoader && (
                    <View className="h-full w-full absolute" style={{ zIndex: 40 }}>
                        <Loader />
                    </View>
                )
            };

            <View className="w-[90%] bg-white p-2 rounded-[10px] shadow-black" style={{ elevation: 3 }}>
                <View className="w-full mt-3 flex-row">
                    <Text className="text-black w-[90%] text-[18px] font-bold text-center">Forget Password</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="justify-center items-center">
                        <Ionicons name="close" size={22} color={"black"} />
                    </TouchableOpacity>
                </View>


                {
                    otpVerify ? (
                        <>
                            <View className="mt-3 w-full">
                                <Text className="text-black text-[12px] font-bold">New Password</Text>
                                <View className="flex-row w-[95%] mt-2 self-center items-center border-[0.5px] rounded-[10px]">
                                    <TextInput
                                        style={{ color: 'black', width: '100%' }}
                                        placeholder="New Password"
                                        placeholderTextColor={"gray"}
                                        onChangeText={(txt: any) => {
                                            setNewPassword(txt);
                                        }}
                                    />
                                </View>
                            </View>

                            <View className="mt-3 w-full">
                                <Text className="text-black text-[12px] font-bold">Confirm Password</Text>
                                <View className="flex-row w-[95%] mt-2 self-center items-center border-[0.5px] rounded-[10px]">
                                    <TextInput
                                        style={{ color: 'black', width: '100%' }}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={"gray"}
                                        onChangeText={(txt: any) => {
                                            setConfirmPassword(txt);
                                        }}
                                    />
                                </View>
                            </View>

                            <View className="w-[100%] mt-5 justify-center items-center">
                                {
                                    showLoader ? (
                                        <View style={{backgroundColor: COLORS.primary}} className="w-[150px] h-[40px] justify-center items-center rounded-[10px]">
                                            <ActivityIndicator color={"white"} size={"small"} />
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={checkPassword}
                                            style={{backgroundColor: COLORS.primary}}
                                            className="w-[50%] h-[40px] justify-center items-center rounded-[10px]"
                                        >
                                            <Text className="text-white text-[18px] font-bold">Submit</Text>
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                        </>
                    ) : (
                        <>
                            {
                                !mailVerify ? (
                                    <>
                                        <View className="mt-5 w-full">
                                            <Text className="text-black text-[12px] font-bold">Enter Your Email</Text>
                                            <View className={`flex-row w-[95%] mt-2 self-center ${mailVerify ? "border-green-500 border-[2px]" : "border-black border-[0.5px]"} items-center rounded-[10px]`}>
                                                <TextInput
                                                    style={{ color: 'black', width: '100%' }}
                                                    placeholder="Enter email id"
                                                    placeholderTextColor={"gray"}
                                                    onChangeText={(txt: any) => {
                                                        setEmail(txt);
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        <View className="w-[100%] mt-5 justify-center items-center">
                                            {
                                                showLoader ? (
                                                    <View style={{backgroundColor: COLORS.primary}} className="w-[150px] h-[40px] justify-center items-center rounded-[10px]">
                                                        <ActivityIndicator color={"white"} size={"small"} />
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={verifyMail}
                                                        style={{backgroundColor: COLORS.primary}}
                                                        className="w-[50%] h-[40px] justify-center items-center rounded-[10px]"
                                                    >
                                                        <Text className="text-white text-[18px] font-bold">Send</Text>
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <View className="mt-5">
                                            <Text className="text-black text-[12px] font-bold">Verify Mail</Text>
                                            <View className="flex-row w-full">
                                                <Text className="w-[90%]">{email}</Text>
                                                <TouchableOpacity onPress={() => setMailVerify(false)}>
                                                    <Text style={{ color: 'red' }} className="font-semibold text-[14px]">Edit</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View className="mt-5">
                                            <Text className="text-black text-[12px] font-bold">Enter Your OTP</Text>
                                            <View>
                                                <OneTimeCodeTextComponent
                                                    value={otp}
                                                    onChangeText={(value: string) => setOtp(value)}
                                                />
                                            </View>
                                        </View>

                                        <View className="mt-5 w-full">
                                            <View className="w-[18%] self-end">
                                                {
                                                    timer !== 0 ? (
                                                        <Text className="text-[14px] font-semibold text-end" style={{ color: 'red' }}>00 : {timer}</Text>
                                                    ) : (
                                                        <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                                                            <Text className="text-[14px] font-semibold" style={{ color: 'red' }}>Re-Send</Text>
                                                        </TouchableOpacity>
                                                    )
                                                }
                                            </View>
                                        </View>

                                        <View className="w-[100%] mt-5 justify-center items-center">
                                            {
                                                showLoader ? (
                                                    <View style={{backgroundColor: COLORS.primary}} className="w-[150px] h-[40px] justify-center items-center rounded-[10px]">
                                                        <ActivityIndicator color={"white"} size={"small"} />
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={handleVerifyOtp}
                                                        style={{backgroundColor: COLORS.primary}}
                                                        className="w-[50%] h-[40px] justify-center items-center rounded-[10px]"
                                                    >
                                                        <Text className="text-white text-[18px] font-bold">Submit</Text>
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                    </>
                                )
                            }
                        </>
                    )
                }



            </View>
        </View>
    );
};

export default forgetPassword;