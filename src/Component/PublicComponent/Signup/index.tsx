import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StatusBar,
    TextInput,
    Image,
    Modal,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { fetchSignUp, signUpVerifyingMail, signUpVerifyingOtp } from "./helper";
import Loader from "../../../Common/Loader";
import OneTimeCodeTextComponent from "../../../Common/OneTimeCodeText";
import { appLogo } from "../../../Common/images/index";
import { COLORS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const SignUp = () => {
    const navigation: any = useNavigation();
    const route: any = useRoute();
    const referralParam = route?.params?.referral ?? route?.params?.referal;

    const [showLoader, setShowLoader] = useState<boolean>(false);

    // Form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [referalcode, setReferalCode] = useState("");

    // Form errors
    const [errName, setErrName] = useState(false);
    const [errEmail, setErrEmail] = useState("");
    const [errMobileNo, setErrMobileNo] = useState("");
    const [errPassword, setErrPassword] = useState("");
    const [errConfirmPassword, setErrConfirmPassword] = useState("");

    // Visibility toggles
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [referalShow, setReferalShow] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [otp, setOtp] = useState<any>("");

    const toggleModal = () => {
        setOpenModal((prev) => !prev);
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        if (!name.trim()) {
            setErrName(true);
            isValid = false;
        } else {
            setErrName(false);
        }

        if (!email.trim()) {
            setErrEmail("Email address is required");
            isValid = false;
        } else if (!emailRegex.test(email.trim())) {
            setErrEmail("Enter a valid email address");
            isValid = false;
        } else {
            setErrEmail("");
        }

        const cleanedMobile = mobileNo.trim();
        if (!cleanedMobile) {
            setErrMobileNo("Mobile number is required");
            isValid = false;
        } else if (cleanedMobile.length !== 10) {
            setErrMobileNo("Enter a valid 10-digit mobile number");
            isValid = false;
        } else {
            setErrMobileNo("");
        }

        if (!password) {
            setErrPassword("Password is required");
            isValid = false;
        } else if (password.length < 6) {
            setErrPassword("Password must be at least 6 characters");
            isValid = false;
        } else {
            setErrPassword("");
        }

        if (!confirmPassword) {
            setErrConfirmPassword("Please confirm your password");
            isValid = false;
        } else if (password !== confirmPassword) {
            setErrConfirmPassword("Passwords do not match");
            isValid = false;
        } else {
            setErrConfirmPassword("");
        }

        return isValid;
    };

    const checkCondition = async () => {
        if (!validateForm()) return;

        setShowLoader(true);
        const data = {
            email: email.trim().toLowerCase(),
        };

        try {
            const response = await signUpVerifyingMail(data);
            const { data: { message = "", success = false } } = response;
            if (success === true) {
                showSuccess(message || "OTP sent to your email");
                setOpenModal(true);
            } else {
                showError(message || "Failed to verify email");
            }
        } catch (error: any) {
            showError(error?.response?.data?.message || error?.message || "Verification failed");
        } finally {
            setShowLoader(false);
        }
    };

    const checkOtp = async () => {
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
            const response = await signUpVerifyingOtp(data);
            const { data: { message = "", success = false } } = response;
            if (success === true) {
                await handleSignUp(cleanedOtp);
            } else {
                showError(message || "Invalid OTP entered");
            }
        } catch (error: any) {
            showError(error?.response?.data?.message || error?.message || "OTP verification failed");
        } finally {
            setShowLoader(false);
        }
    };

    const handleSignUp = async (verifiedOtp: string) => {
        setShowLoader(true);
        const data = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobileno: mobileNo.trim(),
            password: password,
            field: "Car Driver",
            otp: verifiedOtp,
            referralCode: referalcode.trim() === "" ? null : referalcode.trim(),
        };

        try {
            const response = await fetchSignUp(data);
            const { data: { message = "", status = 0, success = false } } = response;
            if (status === 200 || success === true) {
                showSuccess(message || "Partner account created successfully!");
                setName("");
                setEmail("");
                setMobileNo("");
                setPassword("");
                setConfirmPassword("");
                setOtp("");
                setOpenModal(false);
                navigation.navigate("Login");
            } else {
                showError(message || "Registration failed");
            }
        } catch (error: any) {
            showError(error?.response?.data?.message || error?.message || "Registration failed. Please try again.");
        } finally {
            setShowLoader(false);
        }
    };

    const applyReferral = () => {
        if (referalcode.trim() !== "") {
            setReferalShow(false);
            showSuccess("Referral code applied!");
        } else {
            showError("Please enter your referral code");
        }
    };

    useEffect(() => {
        if (referralParam === true) {
            setReferalShow(true);
        } else {
            setReferalShow(false);
        }
    }, [referralParam]);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {showLoader && (
                <View className="absolute w-full h-full" style={{ zIndex: 200 }}>
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
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Back & Branding */}
                <View className="flex-row items-center justify-between mb-2">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white justify-center items-center border border-slate-200"
                        style={{ elevation: 1 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={20} color="#1e293b" />
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        <Image
                            source={appLogo}
                            className="w-8 h-8 rounded-full mr-2"
                            resizeMode="contain"
                        />
                        <Text className="text-[16px] font-black tracking-tight text-slate-800">
                            R<Text style={{ color: COLORS.primary }}>T</Text>R PARTNER
                        </Text>
                    </View>

                    <View className="w-10" />
                </View>

                {/* Title & Subtitle */}
                <View className="mt-4 mb-6">
                    <Text className="text-[26px] font-black text-slate-900 tracking-tight">
                        Create Account
                    </Text>
                    <Text className="text-[13px] text-slate-500 font-medium mt-1">
                        Join our verified driver partner network today
                    </Text>
                </View>

                {/* Form Card */}
                <View
                    className="bg-white rounded-3xl p-5 border border-slate-100 mb-6"
                    style={{ elevation: 2 }}
                >
                    {/* Full Name Field */}
                    <View className="mb-4">
                        <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name
                        </Text>
                        <View
                            className={`flex-row items-center bg-slate-50 border rounded-xl px-3 h-12 ${
                                errName ? "border-red-400 bg-red-50/20" : "border-slate-200"
                            }`}
                        >
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color={errName ? "#ef4444" : "#64748b"}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                className="flex-1 text-[14px] text-slate-900 font-medium h-full"
                                placeholder="Enter your full name"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={(txt) => {
                                    setName(txt);
                                    if (errName) setErrName(false);
                                }}
                            />
                        </View>
                        {errName && (
                            <Text className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                                Full name is required
                            </Text>
                        )}
                    </View>

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

                    {/* Mobile Number Field */}
                    <View className="mb-4">
                        <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Mobile Number
                        </Text>
                        <View
                            className={`flex-row items-center bg-slate-50 border rounded-xl px-3 h-12 ${
                                errMobileNo ? "border-red-400 bg-red-50/20" : "border-slate-200"
                            }`}
                        >
                            <Ionicons
                                name="call-outline"
                                size={18}
                                color={errMobileNo ? "#ef4444" : "#64748b"}
                                style={{ marginRight: 8 }}
                            />
                            <Text className="text-[14px] font-bold text-slate-600 mr-2 border-r border-slate-200 pr-2">
                                +91
                            </Text>
                            <TextInput
                                className="flex-1 text-[14px] text-slate-900 font-medium h-full"
                                placeholder="10-digit mobile number"
                                placeholderTextColor="#94a3b8"
                                keyboardType="number-pad"
                                maxLength={10}
                                value={mobileNo}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, "");
                                    setMobileNo(cleaned);
                                    if (errMobileNo) setErrMobileNo("");
                                }}
                            />
                        </View>
                        {Boolean(errMobileNo) && (
                            <Text className="text-[11px] text-red-500 font-semibold mt-1 ml-1">
                                {errMobileNo}
                            </Text>
                        )}
                    </View>

                    {/* Password Field */}
                    <View className="mb-4">
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
                                placeholder="Create password (min. 6 characters)"
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

                    {/* Confirm Password Field */}
                    <View className="mb-4">
                        <Text className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                            Confirm Password
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
                                placeholder="Re-enter password"
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

                    {/* Referral Code Badge / Input Button */}
                    <View className="mb-4">
                        {referalcode ? (
                            <View className="flex-row items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <Ionicons name="gift" size={18} color="#059669" style={{ marginRight: 8 }} />
                                    <View>
                                        <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                            Referral Applied
                                        </Text>
                                        <Text className="text-[13px] font-black text-emerald-800 tracking-wider">
                                            {referalcode}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setReferalShow(true)}
                                    className="bg-emerald-100 px-2.5 py-1 rounded-lg"
                                >
                                    <Text className="text-[11px] font-bold text-emerald-800">Change</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => setReferalShow(true)}
                                className="flex-row items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-xl py-2.5 px-3"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="gift-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                                <Text className="text-[12px] font-bold" style={{ color: COLORS.primary }}>
                                    Have a referral code? Tap to enter
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={checkCondition}
                        className="w-full bg-[#E0211F] h-12 rounded-xl justify-center items-center mt-3 shadow-sm"
                        style={{ elevation: 2 }}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-[16px]">
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View className="flex-row justify-center items-center">
                    <Text className="text-slate-600 text-[14px] font-medium">
                        Already have an account?
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                        className="ml-1.5 py-1"
                        activeOpacity={0.7}
                    >
                        <Text className="text-[14px] font-bold" style={{ color: COLORS.primary }}>
                            Log In
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Referral Code Modal */}
            <Modal
                visible={referalShow}
                transparent
                animationType="fade"
                onRequestClose={() => setReferalShow(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-5">
                    <View
                        className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center border border-slate-100"
                        style={{ elevation: 6 }}
                    >
                        <View className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 justify-center items-center mb-3">
                            <Ionicons name="gift" size={28} color="#d97706" />
                        </View>

                        <Text className="text-[18px] font-black text-slate-900 text-center">
                            Enter Referral Code
                        </Text>
                        <Text className="text-[12px] text-slate-500 text-center mt-1 mb-4 leading-4">
                            Claim special sign-up benefits and rewards from your friend's invite.
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-center font-bold text-[15px] text-slate-900 tracking-widest uppercase mb-4"
                            placeholder="REFERRAL CODE"
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="characters"
                            value={referalcode}
                            onChangeText={(txt) => setReferalCode(txt.toUpperCase())}
                        />

                        <View className="w-full flex-row">
                            <TouchableOpacity
                                onPress={() => setReferalShow(false)}
                                className="flex-1 h-11 bg-slate-100 rounded-xl justify-center items-center mr-2"
                                activeOpacity={0.7}
                            >
                                <Text className="text-slate-600 font-bold text-[13px]">Skip</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={applyReferral}
                                className="flex-1 h-11 bg-[#E0211F] rounded-xl justify-center items-center"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold text-[13px]">Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* OTP Verification Modal */}
            <Modal
                visible={openModal}
                transparent
                animationType="fade"
                onRequestClose={toggleModal}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-5">
                    <View
                        className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center border border-slate-100"
                        style={{ elevation: 6 }}
                    >
                        <View className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 justify-center items-center mb-3">
                            <Ionicons name="mail" size={26} color={COLORS.primary} />
                        </View>

                        <Text className="text-[19px] font-black text-slate-900 text-center">
                            Verify Your Email
                        </Text>
                        <Text className="text-[12px] text-slate-500 text-center mt-1 mb-4 leading-4">
                            We've sent a 6-digit confirmation code to:{"\n"}
                            <Text className="font-bold text-slate-800">{email}</Text>
                        </Text>

                        <View className="w-full my-2">
                            <OneTimeCodeTextComponent
                                value={otp}
                                onChangeText={(value: string) => setOtp(value)}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={checkOtp}
                            className="w-full bg-[#E0211F] h-12 rounded-xl justify-center items-center mt-5 shadow-sm"
                            style={{ elevation: 2 }}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-bold text-[15px]">
                                Verify & Create Account
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleModal}
                            className="mt-3.5 py-1"
                            activeOpacity={0.7}
                        >
                            <Text className="text-slate-500 font-semibold text-[12px]">
                                Change Email / Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SignUp;
