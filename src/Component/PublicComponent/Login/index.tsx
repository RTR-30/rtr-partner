import React, { useState } from "react";
import {
    View,
    Text,
    StatusBar,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FetchLogin } from "./helper";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import { showError } from "../../../Common/ToastMessage";

const Logo = require("../../../../assets/Imgs/Logo.png");

const Login = () => {
    const navigation: any = useNavigation();

    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const [errEmail, setErrEmail] = useState<string>("");
    const [errPassword, setErrPassword] = useState<string>("");

    const checkCondition = () => {
        const emailTrimmed = email ? email.trim() : "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        if (!emailTrimmed) {
            setErrEmail("Email address is required");
            isValid = false;
        } else if (!emailRegex.test(emailTrimmed)) {
            setErrEmail("Enter a valid email address");
            isValid = false;
        } else {
            setErrEmail("");
        }

        if (!password) {
            setErrPassword("Password is required");
            isValid = false;
        } else {
            setErrPassword("");
        }

        if (isValid) {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        setShowLoader(true);

        const data: any = {
            email: email.trim(),
            password: password,
        };

        try {
            const response = await FetchLogin(data);

            if (response?.status === 200) {
                await AsyncStorage.setItem("UserData", JSON.stringify(response.data.user));
                await AsyncStorage.setItem("token", response.data.token);
                navigation.navigate("Home");
                setEmail("");
                setPassword("");
            } else {
                showError(response?.data?.message || "Invalid email or password");
            }
        } catch (error: any) {
            if (error?.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError(error?.message || "Login failed. Please try again.");
            }
        } finally {
            setShowLoader(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {showLoader && (
                <View className="h-full w-full absolute" style={{ zIndex: 10 }}>
                    <Loader />
                </View>
            )}

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 20,
                    paddingTop: 24,
                    paddingBottom: 36,
                    justifyContent: "center",
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Brand Logo & Name Header */}
                <View className="items-center mb-8">
                    <View
                        className="w-20 h-20 rounded-3xl bg-white justify-center items-center p-3 border border-slate-100 mb-4"
                        style={{ elevation: 3 }}
                    >
                        <Image
                            source={Logo}
                            className="w-full h-full rounded-2xl"
                            resizeMode="contain"
                        />
                    </View>
                    <Text className="text-[24px] font-black tracking-tight text-slate-800">
                        R<Text style={{ color: COLORS.primary }}>T</Text>R PARTNER
                    </Text>
                    <Text className="text-[13px] text-slate-500 font-medium mt-1">
                        Professional Driver On-Demand Service
                    </Text>
                </View>

                {/* Form Card */}
                <View
                    className="bg-white rounded-3xl p-6 border border-slate-100 mb-6"
                    style={{ elevation: 2 }}
                >
                    <Text className="text-[22px] font-black text-slate-900 tracking-tight mb-1">
                        Welcome Back
                    </Text>
                    <Text className="text-[13px] text-slate-500 font-medium mb-6">
                        Sign in to manage duties, trips and earnings
                    </Text>

                    {/* Email Field */}
                    <View className="mb-4">
                        <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Email Address
                        </Text>
                        <View
                            className={`flex-row items-center bg-slate-50 border rounded-xl px-3 h-12 ${
                                errEmail ? "border-red-400 bg-red-50/20" : "border-slate-200"
                            }`}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={18}
                                color={errEmail ? "#ef4444" : "#64748b"}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                className="flex-1 text-[14px] text-slate-900 font-medium h-full"
                                placeholder="Enter your email"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={(txt) => {
                                    setEmail(txt);
                                    if (errEmail) setErrEmail("");
                                }}
                            />
                        </View>
                        {Boolean(errEmail) && (
                            <Text className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                                {errEmail}
                            </Text>
                        )}
                    </View>

                    {/* Password Field */}
                    <View className="mb-2">
                        <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Password
                        </Text>
                        <View
                            className={`flex-row items-center bg-slate-50 border rounded-xl px-3 h-12 ${
                                errPassword ? "border-red-400 bg-red-50/20" : "border-slate-200"
                            }`}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color={errPassword ? "#ef4444" : "#64748b"}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                className="flex-1 text-[14px] text-slate-900 font-medium h-full"
                                placeholder="Enter your password"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={(txt) => {
                                    setPassword(txt);
                                    if (errPassword) setErrPassword("");
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => setPasswordVisible(!passwordVisible)}
                                className="p-1"
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                                    size={19}
                                    color="#64748b"
                                />
                            </TouchableOpacity>
                        </View>
                        {Boolean(errPassword) && (
                            <Text className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                                {errPassword}
                            </Text>
                        )}
                    </View>

                    {/* Forgot Password Link */}
                    <View className="items-end mb-4 pt-1">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("ForgetPassword")}
                            className="py-1"
                            activeOpacity={0.7}
                        >
                            <Text
                                className="text-[13px] font-bold"
                                style={{ color: COLORS.primary }}
                            >
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login CTA Button */}
                    <TouchableOpacity
                        onPress={checkCondition}
                        className="w-full bg-[#E0211F] h-12 rounded-xl justify-center items-center shadow-sm"
                        style={{ elevation: 2 }}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-[16px]">
                            Sign In
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Create Account Link */}
                <View className="flex-row justify-center items-center mb-3">
                    <Text className="text-slate-600 text-[14px] font-medium">
                        Don't have an account?
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("SignUp", { referral: false })}
                        className="ml-1.5 py-1"
                        activeOpacity={0.7}
                    >
                        <Text
                            className="text-[14px] font-bold"
                            style={{ color: COLORS.primary }}
                        >
                            Create Account
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default Login;