import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import OneTimeCodeTextComponent from "../../../Common/OneTimeCodeText";
import { forgetedPassword, VerifyingMail, verifyingOtp } from "./helper";
import Loader from "../../../Common/Loader";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const ForgetPassword = () => {
    const navigation: any = useNavigation();

    const [showLoader, setShowLoader] = useState<boolean>(false);

    // Form states
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<any>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    // Visibility toggles
    const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);

    // Step state
    const [mailVerify, setMailVerify] = useState<boolean>(false);
    const [otpVerify, setOtpVerify] = useState<boolean>(false);

    // Error states
    const [errEmail, setErrEmail] = useState<string>("");
    const [errPassword, setErrPassword] = useState<string>("");
    const [errConfirmPassword, setErrConfirmPassword] = useState<string>("");

    // Timer states
    const [timer, setTimer] = useState<number>(0);
    const [canResend, setCanResend] = useState<boolean>(false);

    const currentStep = otpVerify ? 3 : mailVerify ? 2 : 1;

    // Step 1: Send Verification Email
    const verifyMail = async () => {
        const emailTrimmed = email ? email.trim() : "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailTrimmed) {
            setErrEmail("Email address is required");
            return;
        }
        if (!emailRegex.test(emailTrimmed)) {
            setErrEmail("Please enter a valid email address");
            return;
        }

        setErrEmail("");
        setShowLoader(true);

        const data = {
            email: emailTrimmed.toLowerCase(),
        };

        try {
            const res = await VerifyingMail(data);
            const { success = false, message = "" } = res?.data || {};

            if (success) {
                setMailVerify(true);
                setTimer(60);
                showSuccess(message || "Verification code sent to your email");
            } else {
                showError(message || "Could not verify email");
            }
        } catch (error: any) {
            showError(error?.response?.data?.message || "Invalid or unregistered email address");
        } finally {
            setShowLoader(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const cleanedOtp = otp ? otp.toString().trim() : "";

        if (!cleanedOtp || cleanedOtp.length < 6) {
            return showError("Please enter the complete 6-digit OTP");
        }

        setShowLoader(true);
        const data = {
            email: email.trim().toLowerCase(),
            otp: cleanedOtp,
        };

        try {
            const res = await verifyingOtp(data);
            const { success = false, message = "" } = res?.data || {};

            if (success) {
                setOtpVerify(true);
                showSuccess(message || "OTP verified successfully");
            } else {
                showError(message || "Invalid OTP entered");
            }
        } catch (error: any) {
            showError(error?.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setShowLoader(false);
        }
    };

    // Step 3: Validate & Reset Password
    const checkPassword = () => {
        let isValid = true;

        if (!newPassword) {
            setErrPassword("New password is required");
            isValid = false;
        } else if (newPassword.length < 6) {
            setErrPassword("Password must be at least 6 characters");
            isValid = false;
        } else {
            setErrPassword("");
        }

        if (!confirmPassword) {
            setErrConfirmPassword("Please confirm your password");
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            setErrConfirmPassword("Passwords do not match");
            isValid = false;
        } else {
            setErrConfirmPassword("");
        }

        if (isValid) {
            resetPasswords();
        }
    };

    const resetPasswords = async () => {
        setShowLoader(true);
        const data = {
            otp: otp ? otp.toString().trim() : "",
            email: email.trim().toLowerCase(),
            password: newPassword,
        };

        try {
            const res = await forgetedPassword(data);
            const { message = "" } = res?.data || {};
            showSuccess(message || "Password reset successful! Please login.");
            navigation.navigate("Login");
        } catch (error: any) {
            showError(error?.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setShowLoader(false);
        }
    };

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
        if (!canResend) return;
        verifyMail();
    };

    const handleBackAction = () => {
        if (otpVerify) {
            setOtpVerify(false);
        } else if (mailVerify) {
            setMailVerify(false);
            setOtp("");
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {showLoader && (
                <View className="h-full w-full absolute" style={{ zIndex: 40 }}>
                    <Loader />
                </View>
            )}

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 36,
                    justifyContent: "center",
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Back & Screen Title */}
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={handleBackAction}
                        className="w-10 h-10 rounded-full bg-white justify-center items-center border border-slate-200"
                        style={{ elevation: 1 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={20} color="#1e293b" />
                    </TouchableOpacity>

                    <Text className="text-[17px] font-extrabold text-slate-800">
                        Reset Password
                    </Text>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                        className="w-10 h-10 rounded-full bg-white justify-center items-center border border-slate-200"
                        style={{ elevation: 1 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close" size={20} color="#1e293b" />
                    </TouchableOpacity>
                </View>

                {/* 3-Step Progress Indicator */}
                <View className="flex-row items-center justify-center mb-6 px-4">
                    {/* Step 1 */}
                    <View className="items-center">
                        <View
                            className={`w-8 h-8 rounded-full justify-center items-center ${
                                currentStep >= 1 ? "bg-[#E0211F]" : "bg-slate-200"
                            }`}
                        >
                            {currentStep > 1 ? (
                                <Ionicons name="checkmark" size={16} color="#ffffff" />
                            ) : (
                                <Text className="text-white font-extrabold text-[12px]">1</Text>
                            )}
                        </View>
                        <Text
                            className={`text-[11px] font-bold mt-1 ${
                                currentStep === 1 ? "text-slate-900" : "text-slate-400"
                            }`}
                        >
                            Email
                        </Text>
                    </View>

                    <View
                        className={`h-[2px] w-12 mx-2 -mt-4 ${
                            currentStep > 1 ? "bg-[#E0211F]" : "bg-slate-200"
                        }`}
                    />

                    {/* Step 2 */}
                    <View className="items-center">
                        <View
                            className={`w-8 h-8 rounded-full justify-center items-center ${
                                currentStep >= 2 ? "bg-[#E0211F]" : "bg-slate-200"
                            }`}
                        >
                            {currentStep > 2 ? (
                                <Ionicons name="checkmark" size={16} color="#ffffff" />
                            ) : (
                                <Text
                                    className={`font-extrabold text-[12px] ${
                                        currentStep >= 2 ? "text-white" : "text-slate-500"
                                    }`}
                                >
                                    2
                                </Text>
                            )}
                        </View>
                        <Text
                            className={`text-[11px] font-bold mt-1 ${
                                currentStep === 2 ? "text-slate-900" : "text-slate-400"
                            }`}
                        >
                            Verify
                        </Text>
                    </View>

                    <View
                        className={`h-[2px] w-12 mx-2 -mt-4 ${
                            currentStep > 2 ? "bg-[#E0211F]" : "bg-slate-200"
                        }`}
                    />

                    {/* Step 3 */}
                    <View className="items-center">
                        <View
                            className={`w-8 h-8 rounded-full justify-center items-center ${
                                currentStep === 3 ? "bg-[#E0211F]" : "bg-slate-200"
                            }`}
                        >
                            <Text
                                className={`font-extrabold text-[12px] ${
                                    currentStep === 3 ? "text-white" : "text-slate-500"
                                }`}
                            >
                                3
                            </Text>
                        </View>
                        <Text
                            className={`text-[11px] font-bold mt-1 ${
                                currentStep === 3 ? "text-slate-900" : "text-slate-400"
                            }`}
                        >
                            New
                        </Text>
                    </View>
                </View>

                {/* Main Action Card */}
                <View
                    className="bg-white rounded-3xl p-6 border border-slate-100 mb-6"
                    style={{ elevation: 2 }}
                >
                    {/* STEP 3: Create New Password */}
                    {otpVerify ? (
                        <>
                            <View className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 justify-center items-center mb-3">
                                <Ionicons name="lock-closed" size={22} color={COLORS.primary} />
                            </View>

                            <Text className="text-[20px] font-black text-slate-900 tracking-tight mb-1">
                                Set New Password
                            </Text>
                            <Text className="text-[13px] text-slate-500 font-medium mb-5 leading-4">
                                Enter a strong password for your account.
                            </Text>

                            {/* New Password Input */}
                            <View className="mb-4">
                                <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                    New Password
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
                                        placeholder="Enter new password (min. 6 chars)"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!newPasswordVisible}
                                        value={newPassword}
                                        onChangeText={(txt) => {
                                            setNewPassword(txt);
                                            if (errPassword) setErrPassword("");
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setNewPasswordVisible(!newPasswordVisible)}
                                        className="p-1"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={newPasswordVisible ? "eye-off-outline" : "eye-outline"}
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

                            {/* Confirm Password Input */}
                            <View className="mb-6">
                                <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </Text>
                                <View
                                    className={`flex-row items-center bg-slate-50 border rounded-xl px-3 h-12 ${
                                        errConfirmPassword ? "border-red-400 bg-red-50/20" : "border-slate-200"
                                    }`}
                                >
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={18}
                                        color={errConfirmPassword ? "#ef4444" : "#64748b"}
                                        style={{ marginRight: 10 }}
                                    />
                                    <TextInput
                                        className="flex-1 text-[14px] text-slate-900 font-medium h-full"
                                        placeholder="Confirm new password"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!confirmPasswordVisible}
                                        value={confirmPassword}
                                        onChangeText={(txt) => {
                                            setConfirmPassword(txt);
                                            if (errConfirmPassword) setErrConfirmPassword("");
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                        className="p-1"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                            size={19}
                                            color="#64748b"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {Boolean(errConfirmPassword) && (
                                    <Text className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                                        {errConfirmPassword}
                                    </Text>
                                )}
                            </View>

                            {/* Submit Reset Button */}
                            <TouchableOpacity
                                onPress={checkPassword}
                                className="w-full bg-[#E0211F] h-12 rounded-xl justify-center items-center shadow-sm"
                                style={{ elevation: 2 }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-[16px]">
                                    Update Password
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : !mailVerify ? (
                        /* STEP 1: Enter Email */
                        <>
                            <View className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 justify-center items-center mb-3">
                                <Ionicons name="mail" size={22} color={COLORS.primary} />
                            </View>

                            <Text className="text-[20px] font-black text-slate-900 tracking-tight mb-1">
                                Forgot Password?
                            </Text>
                            <Text className="text-[13px] text-slate-500 font-medium mb-5 leading-4">
                                Enter your registered email address and we'll send a 6-digit verification code.
                            </Text>

                            {/* Email Input */}
                            <View className="mb-6">
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
                                        placeholder="Enter your email id"
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

                            {/* Send OTP Button */}
                            <TouchableOpacity
                                onPress={verifyMail}
                                className="w-full bg-[#E0211F] h-12 rounded-xl justify-center items-center shadow-sm"
                                style={{ elevation: 2 }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-[16px]">
                                    Send Verification Code
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* STEP 2: Verify OTP */
                        <>
                            <View className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 justify-center items-center mb-3">
                                <Ionicons name="key" size={22} color={COLORS.primary} />
                            </View>

                            <Text className="text-[20px] font-black text-slate-900 tracking-tight mb-1">
                                Enter Verification Code
                            </Text>
                            <Text className="text-[13px] text-slate-500 font-medium mb-3 leading-4">
                                Enter the 6-digit code sent to your email.
                            </Text>

                            {/* Email Badge with Edit */}
                            <View className="flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 mb-4">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <Ionicons name="mail-outline" size={15} color="#64748b" style={{ marginRight: 6 }} />
                                    <Text className="text-[13px] font-semibold text-slate-800" numberOfLines={1}>
                                        {email}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setMailVerify(false);
                                        setOtp("");
                                    }}
                                    className="bg-slate-200/70 px-2.5 py-1 rounded-md"
                                >
                                    <Text className="text-[11px] font-bold text-slate-700">Edit</Text>
                                </TouchableOpacity>
                            </View>

                            {/* One Time Code Input */}
                            <View className="w-full my-2">
                                <OneTimeCodeTextComponent
                                    value={otp}
                                    onChangeText={(value: string) => setOtp(value)}
                                />
                            </View>

                            {/* Timer & Resend */}
                            <View className="items-center justify-center my-3">
                                {timer > 0 ? (
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={14} color="#64748b" style={{ marginRight: 4 }} />
                                        <Text className="text-[12px] font-semibold text-slate-500">
                                            Resend code in{" "}
                                            <Text className="font-bold text-[#E0211F]">
                                                00:{timer < 10 ? `0${timer}` : timer}
                                            </Text>
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleResend}
                                        disabled={!canResend}
                                        className="py-1"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-[13px] font-bold" style={{ color: COLORS.primary }}>
                                            Didn't receive code? Resend
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Verify OTP Button */}
                            <TouchableOpacity
                                onPress={handleVerifyOtp}
                                className="w-full bg-[#E0211F] h-12 rounded-xl justify-center items-center mt-2 shadow-sm"
                                style={{ elevation: 2 }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-[16px]">
                                    Verify Code
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Back to Login Footer */}
                <View className="flex-row justify-center items-center">
                    <Text className="text-slate-600 text-[14px] font-medium">
                        Remember your password?
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                        className="ml-1.5 py-1"
                        activeOpacity={0.7}
                    >
                        <Text
                            className="text-[14px] font-bold"
                            style={{ color: COLORS.primary }}
                        >
                            Log In
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ForgetPassword;