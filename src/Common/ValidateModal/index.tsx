import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DatePicker from "react-native-date-picker";
import { COLORS } from "../../utils/ColorCode";
import { validateAadhaar } from "../AadhaarCardValid/aadharCardValid";
import { showError, showSuccess } from "../ToastMessage";
import { verifyDetailsServices } from "./helper";

export interface ValidateModalProps {
    visible: boolean;
    onSuccess?: () => void;
}

const ValidateModal: React.FC<ValidateModalProps> = ({
    visible,
    onSuccess,
}) => {
    const [aadhaar, setAadhaar] = useState<string>("");
    const [form, setForm] = useState<any>({
        licenseNumber: "",
        name: "",
        dob: "",
        expiryDate: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    // DatePicker modal states
    const [openDobPicker, setOpenDobPicker] = useState<boolean>(false);
    const [openExpiryPicker, setOpenExpiryPicker] = useState<boolean>(false);

    const handleFormChange = (key: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors((prev: any) => ({ ...prev, [key]: null }));
        }
    };

    const handleAadhaarChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 12);
        setAadhaar(cleaned);
        if (errors.aadhaar) {
            setErrors((prev: any) => ({ ...prev, aadhaar: null }));
        }
    };

    const validateDate = (date: string) => {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[0-2])[\/\-]\d{4}$/;
        if (!dateRegex.test(date)) return false;

        const parts = date.split(/[\/\-]/);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (year < 1920 || year > 2100) return false;
        if (month < 1 || month > 12) return false;

        const monthLength = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return day > 0 && day <= monthLength[month - 1];
    };

    const validateForm = () => {
        let valid = true;
        const tempErrors: any = {};

        // Aadhaar validation
        if (!aadhaar.trim()) {
            tempErrors.aadhaar = "Aadhaar number is required";
            valid = false;
        } else if (!validateAadhaar(aadhaar)) {
            tempErrors.aadhaar = "Invalid 12-digit Aadhaar number";
            valid = false;
        }

        // License Number validation
        if (!form.licenseNumber.trim()) {
            tempErrors.licenseNumber = "License number is required";
            valid = false;
        } else if (form.licenseNumber.trim().length < 8) {
            tempErrors.licenseNumber = "Enter a valid Driving License number";
            valid = false;
        }

        // Full Name validation
        if (!form.name.trim()) {
            tempErrors.name = "Full name is required";
            valid = false;
        } else if (!/^[a-zA-Z\s.]+$/.test(form.name.trim())) {
            tempErrors.name = "Name must contain only letters";
            valid = false;
        }

        // Date of Birth validation
        if (!form.dob.trim()) {
            tempErrors.dob = "Date of Birth is required (DD/MM/YYYY)";
            valid = false;
        } else if (!validateDate(form.dob.trim())) {
            tempErrors.dob = "Valid date required (DD/MM/YYYY)";
            valid = false;
        }

        // Expiry Date validation
        if (!form.expiryDate.trim()) {
            tempErrors.expiryDate = "Expiry date is required (DD/MM/YYYY)";
            valid = false;
        } else if (!validateDate(form.expiryDate.trim())) {
            tempErrors.expiryDate = "Valid date required (DD/MM/YYYY)";
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

    const handleVerifySubmit = async () => {
        if (!validateForm()) {
            showError("Please fill all mandatory fields correctly");
            return;
        }

        setSubmitting(true);
        const payload = {
            aadhaar: aadhaar.trim(),
            licensenumber: form.licenseNumber.trim().toUpperCase(),
            fullname: form.name.trim(),
            dob: form.dob.trim(),
            expirydate: form.expiryDate.trim(),
        };

        try {
            const res = await verifyDetailsServices(payload);
            const { data: { success = false, message = "" } } = res;

            if (success) {
                showSuccess(message || "Documents submitted for verification!");
                setIsSubmitted(true);
            } else {
                showError(message || "Verification failed");
            }
        } catch (error: any) {
            showError(error?.message || "Error submitting verification details");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcknowledge = () => {
        if (onSuccess) {
            onSuccess();
        }
    };

    const formatDateToDDMMYYYY = (date: Date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const parseDDMMYYYY = (dateStr: string) => {
        if (!dateStr) return new Date();
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            const parsed = new Date(y, m, d);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return new Date();
    };

    const isAadhaarValid = aadhaar.length === 12 && validateAadhaar(aadhaar);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => {}}
        >
            <View
                style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
                className="flex-1 justify-center items-center px-4"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="w-full items-center"
                >
                    <View
                        className="bg-white w-full rounded-2xl p-4"
                        style={styles.dialogCard}
                    >
                        {/* ============================================================== */}
                        {/* CASE A: SUBMISSION SUCCESS & 3-DAY ACTIVATION NOTICE STATE      */}
                        {/* ============================================================== */}
                        {isSubmitted ? (
                            <View className="items-center py-2">
                                {/* Success Icon Badge */}
                                <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3 border-2 border-emerald-200">
                                    <Ionicons name="shield-checkmark" size={34} color="#059669" />
                                </View>

                                <Text className="text-base font-black text-gray-900 text-center mb-1">
                                    Verification Submitted!
                                </Text>

                                <Text className="text-xs text-gray-500 text-center mb-3 px-2">
                                    Your KYC documents have been sent to administration.
                                </Text>

                                {/* HIGHLIGHTED 3-DAYS ACTIVATION NOTICE BANNER */}
                                <View className="w-full bg-amber-50 rounded-2xl p-3.5 border-2 border-amber-300 mb-4">
                                    <View className="flex-row items-center mb-1.5">
                                        <View className="w-6 h-6 rounded-full bg-amber-200/80 items-center justify-center mr-2">
                                            <Ionicons name="time" size={14} color="#B45309" />
                                        </View>
                                        <Text className="text-xs font-black text-amber-900 uppercase tracking-wide">
                                            Activation within 3 Days
                                        </Text>
                                    </View>

                                    <Text className="text-xs font-bold text-amber-800 leading-5">
                                        Once documents are submitted, verification and account activation will be completed within 1 to 3 business days.
                                    </Text>

                                    <View className="h-[1px] bg-amber-200 my-2" />

                                    <View className="flex-row items-center">
                                        <Ionicons name="alert-circle" size={14} color="#B45309" style={{ marginRight: 5 }} />
                                        <Text className="text-[11px] font-extrabold text-amber-900 flex-1">
                                            Please wait for admin approval to start receiving duties.
                                        </Text>
                                    </View>
                                </View>

                                {/* Progress Steps Indicator */}
                                <View className="w-full bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-4">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 6 }} />
                                            <Text className="text-[11px] font-bold text-gray-800">
                                                1. Documents Uploaded
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                            Done
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <Ionicons name="hourglass" size={14} color="#D97706" style={{ marginRight: 6 }} />
                                            <Text className="text-[11px] font-bold text-gray-800">
                                                2. Admin Review & Check
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                            1 - 3 Days
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Ionicons name="car" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                                            <Text className="text-[11px] font-medium text-gray-500">
                                                3. Account Activated
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-medium text-gray-400">
                                            Pending
                                        </Text>
                                    </View>
                                </View>

                                {/* Acknowledge Button */}
                                <TouchableOpacity
                                    activeOpacity={0.88}
                                    onPress={handleAcknowledge}
                                    className="w-full py-3 rounded-xl items-center justify-center flex-row shadow-sm"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                    <Text className="text-xs font-black text-white tracking-wide">
                                        I Understand, Please Wait
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* ============================================================== */
                            /* CASE B: MANDATORY FORM WITH HIGHLIGHTED NOTICE BANNER          */
                            /* ============================================================== */
                            <>
                                {/* MANDATORY HEADER */}
                                <View className="pb-2.5 border-b border-gray-100 mb-2">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <View className="w-8 h-8 rounded-xl bg-red-50 justify-center items-center mr-2 border border-red-100">
                                                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm font-black text-gray-900">
                                                    Partner KYC Verification
                                                </Text>
                                                <Text className="text-[10px] text-gray-500 font-medium">
                                                    Mandatory to access app & start duties
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Mandatory Tag Pill */}
                                        <View className="bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                            <Text className="text-[9px] font-black text-red-600 tracking-wider">
                                                MANDATORY
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* HIGHLIGHTED 3-DAY ACTIVATION NOTICE BANNER */}
                                <View className="bg-amber-50 rounded-xl p-2.5 border border-amber-300 mb-2.5">
                                    <View className="flex-row items-start">
                                        <Ionicons name="time" size={15} color="#B45309" style={{ marginTop: 1, marginRight: 6 }} />
                                        <View className="flex-1">
                                            <Text className="text-[11px] font-black text-amber-900 uppercase">
                                                Important Notice: 1-3 Days Activation
                                            </Text>
                                            <Text className="text-[10px] font-bold text-amber-800 leading-4 mt-0.5">
                                                Once validated, account activation is completed within 3 days. Please wait for verification approval.
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* SCROLLABLE FORM CONTENT */}
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    bounces={false}
                                    keyboardShouldPersistTaps="handled"
                                    style={{ maxHeight: 310 }}
                                >
                                    {/* SECTION 1: AADHAAR CARD */}
                                    <View className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 mb-2.5">
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <View className="flex-row items-center">
                                                <Ionicons name="card-outline" size={13} color="#475569" style={{ marginRight: 5 }} />
                                                <Text className="text-[10px] font-bold text-gray-700 uppercase">
                                                    Aadhaar Card Number *
                                                </Text>
                                            </View>
                                            {isAadhaarValid && (
                                                <View className="flex-row items-center bg-emerald-100 px-1.5 py-0.5 rounded">
                                                    <Ionicons name="checkmark-circle" size={11} color="#059669" style={{ marginRight: 2 }} />
                                                    <Text className="text-[9px] font-bold text-emerald-800">Verified</Text>
                                                </View>
                                            )}
                                        </View>

                                        <View
                                            className={`flex-row items-center bg-white rounded-xl px-2.5 border ${
                                                errors.aadhaar
                                                    ? "border-red-400"
                                                    : isAadhaarValid
                                                    ? "border-emerald-400"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <TextInput
                                                placeholder="12-digit Aadhaar Number"
                                                placeholderTextColor="#9CA3AF"
                                                keyboardType="numeric"
                                                maxLength={12}
                                                value={aadhaar}
                                                onChangeText={handleAadhaarChange}
                                                style={styles.inputInner}
                                            />
                                            {aadhaar.length > 0 && (
                                                <Text className="text-[10px] text-gray-400 font-semibold mr-1">
                                                    {aadhaar.length}/12
                                                </Text>
                                            )}
                                        </View>
                                        {errors.aadhaar && (
                                            <Text className="text-[10px] text-red-500 font-semibold mt-1">
                                                {errors.aadhaar}
                                            </Text>
                                        )}
                                    </View>

                                    {/* SECTION 2: DRIVING LICENSE */}
                                    <View className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 mb-2">
                                        <View className="flex-row items-center mb-1.5">
                                            <Ionicons name="id-card-outline" size={13} color="#475569" style={{ marginRight: 5 }} />
                                            <Text className="text-[10px] font-bold text-gray-700 uppercase">
                                                Driving License Details *
                                            </Text>
                                        </View>

                                        {/* License Number Field */}
                                        <View className="mb-1.5">
                                            <Text className="text-[10px] font-bold text-gray-500 mb-0.5">
                                                License Number
                                            </Text>
                                            <View
                                                className={`flex-row items-center bg-white rounded-xl px-2.5 border ${
                                                    errors.licenseNumber ? "border-red-400" : "border-gray-200"
                                                }`}
                                            >
                                                <TextInput
                                                    placeholder="e.g. DL-0420110149646"
                                                    placeholderTextColor="#9CA3AF"
                                                    autoCapitalize="characters"
                                                    value={form.licenseNumber}
                                                    onChangeText={(text) => handleFormChange("licenseNumber", text)}
                                                    style={styles.inputInner}
                                                />
                                            </View>
                                            {errors.licenseNumber && (
                                                <Text className="text-[10px] text-red-500 font-semibold mt-0.5">
                                                    {errors.licenseNumber}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Full Name Field */}
                                        <View className="mb-1.5">
                                            <Text className="text-[10px] font-bold text-gray-500 mb-0.5">
                                                Full Name (as per License)
                                            </Text>
                                            <View
                                                className={`flex-row items-center bg-white rounded-xl px-2.5 border ${
                                                    errors.name ? "border-red-400" : "border-gray-200"
                                                }`}
                                            >
                                                <TextInput
                                                    placeholder="Your Full Name"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={form.name}
                                                    onChangeText={(text) => handleFormChange("name", text)}
                                                    style={styles.inputInner}
                                                />
                                            </View>
                                            {errors.name && (
                                                <Text className="text-[10px] text-red-500 font-semibold mt-0.5">
                                                    {errors.name}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Date of Birth & Expiry Date Side by Side */}
                                        <View className="flex-row justify-between">
                                            {/* Date of Birth */}
                                            <View className="w-[48%]">
                                                <Text className="text-[10px] font-bold text-gray-500 mb-0.5">
                                                    Date of Birth
                                                </Text>
                                                <View
                                                    className={`flex-row items-center bg-white rounded-xl px-2 border ${
                                                        errors.dob ? "border-red-400" : "border-gray-200"
                                                    }`}
                                                >
                                                    <TextInput
                                                        placeholder="DD/MM/YYYY"
                                                        placeholderTextColor="#9CA3AF"
                                                        value={form.dob}
                                                        onChangeText={(text) => handleFormChange("dob", text)}
                                                        style={[styles.inputInner, { fontSize: 11 }]}
                                                    />
                                                    <TouchableOpacity
                                                        activeOpacity={0.7}
                                                        onPress={() => setOpenDobPicker(true)}
                                                        className="p-1"
                                                    >
                                                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                                    </TouchableOpacity>
                                                </View>
                                                {errors.dob && (
                                                    <Text className="text-[9px] text-red-500 font-semibold mt-0.5" numberOfLines={1}>
                                                        {errors.dob}
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Expiry Date */}
                                            <View className="w-[48%]">
                                                <Text className="text-[10px] font-bold text-gray-500 mb-0.5">
                                                    License Expiry
                                                </Text>
                                                <View
                                                    className={`flex-row items-center bg-white rounded-xl px-2 border ${
                                                        errors.expiryDate ? "border-red-400" : "border-gray-200"
                                                    }`}
                                                >
                                                    <TextInput
                                                        placeholder="DD/MM/YYYY"
                                                        placeholderTextColor="#9CA3AF"
                                                        value={form.expiryDate}
                                                        onChangeText={(text) => handleFormChange("expiryDate", text)}
                                                        style={[styles.inputInner, { fontSize: 11 }]}
                                                    />
                                                    <TouchableOpacity
                                                        activeOpacity={0.7}
                                                        onPress={() => setOpenExpiryPicker(true)}
                                                        className="p-1"
                                                    >
                                                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                                    </TouchableOpacity>
                                                </View>
                                                {errors.expiryDate && (
                                                    <Text className="text-[9px] text-red-500 font-semibold mt-0.5" numberOfLines={1}>
                                                        {errors.expiryDate}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Security note */}
                                    <View className="flex-row items-center justify-center my-0.5">
                                        <Ionicons name="lock-closed" size={10} color="#64748B" style={{ marginRight: 3 }} />
                                        <Text className="text-[10px] text-slate-500 font-medium">
                                            Encrypted & verified per transport guidelines
                                        </Text>
                                    </View>
                                </ScrollView>

                                {/* FIXED FOOTER: SINGLE FULL-WIDTH VALIDATE & SUBMIT BUTTON */}
                                <View className="pt-2.5 border-t border-gray-100 mt-1">
                                    <TouchableOpacity
                                        activeOpacity={0.88}
                                        onPress={handleVerifySubmit}
                                        disabled={submitting}
                                        className="w-full py-3 rounded-xl items-center justify-center flex-row shadow-sm"
                                        style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                                        ) : (
                                            <Ionicons
                                                name="checkmark-done"
                                                size={16}
                                                color="#FFFFFF"
                                                style={{ marginRight: 6 }}
                                            />
                                        )}
                                        <Text className="text-xs font-black text-white tracking-wide">
                                            {submitting ? "Submitting Details..." : "Validate & Submit Details"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>

            {/* Native Date Picker Modal for DOB */}
            <DatePicker
                modal
                open={openDobPicker}
                date={parseDDMMYYYY(form.dob)}
                mode="date"
                maximumDate={new Date()}
                onConfirm={(date) => {
                    setOpenDobPicker(false);
                    handleFormChange("dob", formatDateToDDMMYYYY(date));
                }}
                onCancel={() => setOpenDobPicker(false)}
            />

            {/* Native Date Picker Modal for Expiry Date */}
            <DatePicker
                modal
                open={openExpiryPicker}
                date={parseDDMMYYYY(form.expiryDate)}
                mode="date"
                minimumDate={new Date()}
                onConfirm={(date) => {
                    setOpenExpiryPicker(false);
                    handleFormChange("expiryDate", formatDateToDDMMYYYY(date));
                }}
                onCancel={() => setOpenExpiryPicker(false)}
            />
        </Modal>
    );
};

export default ValidateModal;

const styles = StyleSheet.create({
    dialogCard: {
        maxWidth: 380,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },
    inputInner: {
        flex: 1,
        paddingVertical: 5,
        paddingHorizontal: 4,
        color: "#1F2937",
        fontSize: 12,
        fontWeight: "600",
    },
    submitButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
});
