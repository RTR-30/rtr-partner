import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    Platform,
    Alert,
    PermissionsAndroid,
    Modal,
    Image,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
    CancelRideService,
    CashCollectService,
    EndRideService,
    onlinePaymentService,
    StartRideService,
    verifyPaymentService,
} from "./helper";
import { useNavigation } from "@react-navigation/native";
import OneTimeCodeTextComponent from "../../../Common/OneTimeCodeText";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";
import Feedback from "../../../Common/Feedback";
import GetLocation from "react-native-get-location";

interface RenderHelperProps {
    item: any;
    setLoading: (loading: boolean) => void;
    fetchAcceptList: () => void;
    payDetails?: any;
    setPayDetails?: (details: any) => void;
}

const RenderHelper: React.FC<RenderHelperProps> = ({
    item,
    setLoading,
    fetchAcceptList,
    payDetails,
    setPayDetails,
}) => {
    const navigation: any = useNavigation();
    const [region, setRegion] = useState<any>(null);
    const [startRideModal, setStartRideModal] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>("");
    const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
    const [verifyMsg, setVerifyMsg] = useState<string>("Scan QR & tap Verify after payment");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [selectedBookingId, setSelectedBookingId] = useState<any>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    const [localPayDetails, setLocalPayDetails] = useState<any>({
        payment_link: "",
        qr_code: "",
        link_id: "",
        active: false,
    });

    const activePayDetails = payDetails?.active ? payDetails : localPayDetails;

    const openFeedbackModal = () => {
        setShowFeedback(true);
    };

    const closeFeedbackModal = () => {
        fetchAcceptList();
        setShowFeedback(false);
    };

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "This app needs your location to navigate to the customer.",
                        buttonPositive: "Allow",
                        buttonNegative: "Cancel",
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    return;
                }
            }

            const location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 20000,
            });

            setRegion({
                latitude: location.latitude,
                longitude: location.longitude,
            });
        } catch {
            // Silently handle initial permission or GPS fetch
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const formatDateTime = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "Flexible Timing";
        try {
            const parsedDate = new Date(dateTime);
            if (isNaN(parsedDate.getTime())) return String(dateTime);
            return parsedDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                ...(includeTime && {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            });
        } catch {
            return String(dateTime);
        }
    };

    const formatEndDate = (dateTime: any) => {
        if (!dateTime) return "";
        try {
            const parsedDate = new Date(dateTime);
            if (isNaN(parsedDate.getTime())) return String(dateTime);
            return parsedDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return String(dateTime);
        }
    };

    // Open Turn-by-Turn Navigation with Robust Location Extraction
    const openMap = () => {
        let destinationLat: any = null;
        let destinationLong: any = null;

        if (item?.LocationCode) {
            if (typeof item.LocationCode === "object") {
                destinationLat = item.LocationCode.lat || item.LocationCode.latitude;
                destinationLong = item.LocationCode.long || item.LocationCode.longitude;
            } else if (typeof item.LocationCode === "string") {
                try {
                    const parsed = JSON.parse(item.LocationCode);
                    destinationLat = parsed.lat || parsed.latitude;
                    destinationLong = parsed.long || parsed.longitude;
                } catch {
                    const parts = item.LocationCode.split(",");
                    if (parts.length === 2) {
                        destinationLat = parts[0].trim();
                        destinationLong = parts[1].trim();
                    }
                }
            }
        }

        const currentLat = region?.latitude;
        const currentLong = region?.longitude;

        if (destinationLat && destinationLong) {
            const url =
                Platform.OS === "ios"
                    ? currentLat && currentLong
                        ? `http://maps.apple.com/?saddr=${currentLat},${currentLong}&daddr=${destinationLat},${destinationLong}`
                        : `http://maps.apple.com/?daddr=${destinationLat},${destinationLong}`
                    : currentLat && currentLong
                    ? `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLong}&destination=${destinationLat},${destinationLong}&travelmode=driving`
                    : `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLong}&travelmode=driving`;

            Linking.openURL(url).catch(() => {
                showError("Unable to open navigation app");
            });
        } else if (item?.Address) {
            const query = encodeURIComponent(item.Address);
            const url =
                Platform.OS === "ios"
                    ? `http://maps.apple.com/?daddr=${query}`
                    : `https://www.google.com/maps/search/?api=1&query=${query}`;

            Linking.openURL(url).catch(() => {
                showError("Unable to open maps with address");
            });
        } else {
            Alert.alert(
                "Location Unavailable",
                "Coordinates and address are not available for this booking."
            );
        }
    };

    // Direct Phone Call Handler
    const callCustomer = () => {
        const phone =
            item?.MobileNumber ||
            item?.MobileNo ||
            item?.Phone ||
            item?.mobileno ||
            item?.phno ||
            item?.PhoneNumber ||
            item?.phone;

        if (phone) {
            Linking.openURL(`tel:${phone}`).catch(() => {
                showError("Unable to place call");
            });
        } else {
            Alert.alert(
                "Phone Number Unavailable",
                "Customer contact number is not provided for this booking."
            );
        }
    };

    // Cancel Duty with Prompt
    const handleCancelDuty = () => {
        Alert.alert(
            "Cancel Duty",
            "Are you sure you want to cancel this booking? This will return the duty to available pool.",
            [
                { text: "No, Keep Duty", style: "cancel" },
                {
                    text: "Yes, Cancel Duty",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const res: any = await CancelRideService({ bookingId: item.Id });
                            if (res?.data?.success === true) {
                                showSuccess("Duty cancelled successfully");
                                navigation.navigate("Duty");
                            } else {
                                showError(res?.data?.message || "Failed to cancel duty");
                            }
                        } catch (error: any) {
                            showError(error?.message || "Error cancelling duty");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // Start Ride with OTP Verification
    const handleStartRide = async () => {
        if (!otp || String(otp).trim().length === 0) {
            showError("Please enter the 4-digit customer OTP");
            return;
        }

        if (item.OTP && Number(otp) !== Number(item.OTP)) {
            showError("Incorrect OTP. Please ask customer for correct code.");
            return;
        }

        setLoading(true);
        const payload = {
            bookingId: item.Id,
            OTP: otp,
        };

        try {
            const res = await StartRideService(payload);
            if (res?.data?.success === true) {
                showSuccess(res?.data?.message || "Ride started successfully!");
                setStartRideModal(false);
                setOtp("");
                fetchAcceptList();
            } else {
                showError(res?.data?.message || "Failed to start ride");
            }
        } catch (error: any) {
            showError(error?.message || error || "Error starting ride");
        } finally {
            setLoading(false);
        }
    };

    // End Ride Confirmation
    const handleEndRideConfirm = () => {
        Alert.alert(
            "Complete Trip",
            "Are you sure you want to complete this ride and proceed to payment settlement?",
            [
                { text: "Not Yet", style: "cancel" },
                {
                    text: "Yes, Complete Ride",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await EndRideService({ bookingId: item.Id });
                            showSuccess("Trip completed! Please collect payment.");
                            fetchAcceptList();
                        } catch (error: any) {
                            showError(error?.message || "Error completing ride");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // Generate Online QR / Payment Link
    const paymentApi = async () => {
        setLoading(true);
        setSelectedBookingId(item?.Id);
        const payload = {
            bookingId: item?.Id,
        };

        try {
            const res = await onlinePaymentService(payload);
            const {
                data: {
                    success = false,
                    message = "",
                    payment_link = "",
                    qr_code = "",
                    link_id = "",
                },
            } = res;

            if (success === true) {
                const details = {
                    payment_link,
                    qr_code,
                    link_id,
                    active: true,
                };
                if (setPayDetails) {
                    setPayDetails(details);
                }
                setLocalPayDetails(details);
                showSuccess(message || "Payment QR generated!");
                setVerifyMsg("Ask customer to scan QR code & pay");
            } else {
                showError(message || "Failed to initiate online payment");
            }
        } catch (error: any) {
            showError(error?.message || "Error generating online payment");
        } finally {
            setLoading(false);
        }
    };

    // Verify Online Payment Status
    const verifyPayment = async (linkId: any) => {
        if (!linkId) {
            showError("Payment link not available to verify");
            return;
        }

        setIsVerifying(true);
        try {
            const res = await verifyPaymentService({ linkId });
            const { data: { success = false, message = "", status = "" } } = res;

            if (success === true) {
                if (status === "SUCCESS") {
                    showSuccess(message || "Payment received successfully!");
                    modalClose();
                } else if (status === "PENDING") {
                    setVerifyMsg("Payment is still pending. Customer hasn't finished payment yet.");
                    showError("Payment pending confirmation");
                } else {
                    setVerifyMsg(message || `Payment Status: ${status}`);
                }
            } else {
                showError(message || "Verification failed");
            }
        } catch (error: any) {
            showError(error?.message || "Error verifying payment");
        } finally {
            setIsVerifying(false);
        }
    };

    // Cash on Hand Collection with Prompt
    const handleCashCollectConfirm = () => {
        const amount = item?.FinalAmount ?? item?.EstimateAmount ?? 0;
        Alert.alert(
            "Cash Collection",
            `Confirm that you have collected ₹${amount} in cash from customer?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm Cash Received",
                    onPress: async () => {
                        setLoading(true);
                        setSelectedBookingId(item?.Id);
                        try {
                            const res = await CashCollectService({ bookingId: item.Id });
                            const { data: { success = false, message = "" }, status = 0 } = res;

                            if (status === 200 || success === true) {
                                showSuccess(message || "Cash collected successfully!");
                                modalClose();
                            } else {
                                showError(message || "Failed to record cash collection");
                            }
                        } catch (error: any) {
                            showError(error?.message || "Error recording cash collection");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const modalOpen = () => {
        setSelectedBookingId(item?.Id);
        setPaymentModalVisible(true);
    };

    const modalClose = () => {
        setPaymentModalVisible(false);
        openFeedbackModal();
    };

    const isPaid = item?.PaymentStatus?.toLowerCase() === "paid";
    const statusLower = item?.Status?.toLowerCase() || "";
    const isInProgress = statusLower === "inprogress";
    const isPaymentPending = statusLower === "paymentpending";

    // Theme configuration based on duty status
    const getStatusConfig = () => {
        if (isInProgress) {
            return {
                title: "Live Trip",
                badgeBg: "bg-emerald-50",
                badgeBorder: "border-emerald-200",
                badgeText: "text-emerald-700",
                dotColor: "#059669",
            };
        }
        if (isPaymentPending) {
            return {
                title: "Payment Due",
                badgeBg: "bg-amber-50",
                badgeBorder: "border-amber-200",
                badgeText: "text-amber-700",
                dotColor: "#D97706",
            };
        }
        return {
            title: item?.Status || "Duty Assigned",
            badgeBg: "bg-blue-50",
            badgeBorder: "border-blue-200",
            badgeText: "text-blue-700",
            dotColor: "#2563EB",
        };
    };

    const statusConfig = getStatusConfig();

    return (
        <View
            className="bg-white rounded-2xl p-3 mb-2.5 border border-gray-200"
            style={styles.cardShadow}
        >
            {/* Top Bar: Status Badge, Booking ID & Fare */}
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                    <View
                        className={`flex-row items-center px-2 py-0.5 rounded-md border mr-2 ${statusConfig.badgeBg} ${statusConfig.badgeBorder}`}
                    >
                        <View
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: statusConfig.dotColor }}
                        />
                        <Text className={`text-[11px] font-bold ${statusConfig.badgeText}`}>
                            {statusConfig.title}
                        </Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-gray-400">
                        #BK-{item.Id}
                    </Text>
                </View>

                {/* Amount */}
                <View className="flex-row items-baseline">
                    <Text
                        className="text-xs font-bold mr-0.5"
                        style={{ color: COLORS.primary }}
                    >
                        ₹
                    </Text>
                    <Text
                        className="text-lg font-black"
                        style={{ color: COLORS.primary }}
                    >
                        {item.FinalAmount ?? item.EstimateAmount ?? 0}
                    </Text>
                </View>
            </View>

            {/* Customer Row with Call & Map Action Buttons */}
            <View className="flex-row items-center justify-between py-1.5 mb-1.5 border-t border-b border-gray-100">
                <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2">
                        <Ionicons name="person" size={14} color={COLORS.primary} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-gray-900" numberOfLines={1}>
                            {item.Name || "Customer"}
                        </Text>
                        <Text
                            className={`text-[10px] font-semibold ${
                                isPaid ? "text-emerald-700" : "text-amber-700"
                            }`}
                        >
                            {isPaid ? "Prepaid" : "Cash on Duty"}
                        </Text>
                    </View>
                </View>

                {/* Action Shortcuts: Call & Navigate */}
                <View className="flex-row items-center">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={callCustomer}
                        className="w-8 h-8 rounded-lg bg-emerald-500 justify-center items-center mr-1.5"
                    >
                        <Ionicons name="call" size={15} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={openMap}
                        className="w-8 h-8 rounded-lg bg-blue-600 justify-center items-center"
                    >
                        <Ionicons name="navigate" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Details Box: Pickup Address & Schedules */}
            <View className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 mb-2.5">
                {/* Pickup Address */}
                <View className="flex-row items-start mb-1.5">
                    <Ionicons
                        name="location"
                        size={13}
                        color={COLORS.primary}
                        style={{ marginTop: 1, marginRight: 5 }}
                    />
                    <Text className="text-[11px] font-semibold text-gray-800 flex-1 leading-4" numberOfLines={2}>
                        {item.Address || "Customer pickup location specified in booking"}
                    </Text>
                </View>

                {/* Schedule & Specs Chips */}
                <View className="flex-row items-center justify-between pt-1 border-t border-gray-200">
                    <View className="flex-row items-center flex-1 mr-2">
                        <Ionicons name="calendar-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                        <Text className="text-[10px] font-semibold text-gray-600" numberOfLines={1}>
                            {formatDateTime(item?.StartDate)}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        {item.Hours ? (
                            <View className="bg-gray-200/80 px-1.5 py-0.5 rounded mr-1.5">
                                <Text className="text-[10px] font-bold text-gray-700">
                                    {item.Hours}h
                                </Text>
                            </View>
                        ) : null}

                        {item.GearType ? (
                            <View className="bg-gray-200/80 px-1.5 py-0.5 rounded">
                                <Text className="text-[10px] font-bold text-gray-700">
                                    {item.GearType}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Return Schedule if any */}
                {item.EndDate ? (
                    <View className="flex-row items-center pt-1 mt-1 border-t border-gray-100">
                        <Ionicons name="repeat-outline" size={11} color="#6B7280" style={{ marginRight: 4 }} />
                        <Text className="text-[10px] text-gray-500">
                            Return: {formatEndDate(item.EndDate)}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Primary Action Button Footer */}
            {isInProgress ? (
                /* IN PROGRESS: Complete Ride button */
                <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleEndRideConfirm}
                    className="rounded-xl py-2.5 px-3 flex-row justify-center items-center bg-red-600"
                >
                    <Ionicons name="stop-circle" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-extrabold text-white">
                        End Ride & Settle Fare
                    </Text>
                </TouchableOpacity>
            ) : isPaymentPending ? (
                /* PAYMENT PENDING: Collect Payment button */
                <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={modalOpen}
                    className="rounded-xl py-2.5 px-3 flex-row justify-between items-center bg-emerald-600"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="wallet-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text className="text-xs font-extrabold text-white">
                            Collect Fare Payment
                        </Text>
                    </View>
                    <View className="flex-row items-center bg-white/20 px-2 py-0.5 rounded">
                        <Text className="text-[11px] font-black text-white">
                            ₹{item.FinalAmount ?? item.EstimateAmount ?? 0}
                        </Text>
                        <Ionicons name="arrow-forward" size={12} color="#FFFFFF" style={{ marginLeft: 3 }} />
                    </View>
                </TouchableOpacity>
            ) : (
                /* ASSIGNED: Start Ride & Cancel */
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => setStartRideModal(true)}
                        className="flex-1 rounded-xl py-2.5 px-3 flex-row justify-center items-center mr-2 bg-emerald-600"
                    >
                        <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                        <Text className="text-xs font-extrabold text-white">
                            Start Ride
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={handleCancelDuty}
                        className="rounded-xl py-2.5 px-3 flex-row justify-center items-center bg-red-50 border border-red-200"
                    >
                        <Ionicons name="close-circle-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                        <Text className="text-[11px] font-bold text-red-600">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* OTP Verification Modal */}
            {startRideModal && (
                <Modal
                    visible={startRideModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setStartRideModal(false)}
                >
                    <View
                        className="flex-1 justify-center items-center px-4"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <View
                            className="w-full bg-white rounded-2xl p-5 items-center"
                            style={{ maxWidth: 340, elevation: 5 }}
                        >
                            <View className="w-12 h-12 rounded-full bg-emerald-100 justify-center items-center mb-2.5">
                                <Ionicons name="shield-checkmark" size={24} color="#059669" />
                            </View>

                            <Text className="text-base font-black text-gray-900 mb-1">
                                Customer Start Code
                            </Text>
                            <Text className="text-xs text-gray-500 text-center mb-3">
                                Ask the customer for their 4-digit code to start this ride.
                            </Text>

                            <OneTimeCodeTextComponent
                                cellCount={4}
                                value={otp}
                                onChangeText={(value: string) => setOtp(value)}
                            />

                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={handleStartRide}
                                className="w-full py-3 rounded-xl bg-emerald-600 items-center justify-center mt-5"
                            >
                                <Text className="text-xs font-extrabold text-white">
                                    Verify & Start Trip
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setStartRideModal(false)}
                                className="w-full py-2 items-center justify-center mt-1"
                            >
                                <Text className="text-xs font-bold text-gray-500">
                                    Dismiss / Go Back
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Payment Settlement Modal */}
            {paymentModalVisible && (
                <Modal
                    visible={paymentModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setPaymentModalVisible(false)}
                >
                    <View
                        className="flex-1 justify-center items-center px-4"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <View
                            className="w-full bg-white rounded-2xl p-4"
                            style={{ maxWidth: 360, elevation: 5 }}
                        >
                            {/* Modal Header */}
                            <View className="flex-row justify-between items-center pb-2.5 border-b border-gray-100">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-lg bg-indigo-50 justify-center items-center mr-2">
                                        <Ionicons name="receipt-outline" size={16} color="#4F46E5" />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-black text-gray-900">
                                            Trip Settlement
                                        </Text>
                                        <Text className="text-[10px] text-gray-400">
                                            Booking #{item?.Id}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setPaymentModalVisible(false)}
                                    className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center"
                                >
                                    <Ionicons name="close" size={16} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            {/* Itemized Fare Receipt Box */}
                            <View className="bg-gray-50 rounded-xl p-3 my-2.5 border border-gray-100">
                                <View className="flex-row justify-between items-center py-0.5">
                                    <Text className="text-xs text-gray-500">Driver Share</Text>
                                    <Text className="text-xs font-bold text-gray-800">
                                        ₹ {item?.FinalDriverShare ?? 0}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-0.5">
                                    <Text className="text-xs text-gray-500">Platform Fee</Text>
                                    <Text className="text-xs font-bold text-gray-800">
                                        ₹ {item?.PlatformFeeAmount ?? 0}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between items-center py-0.5">
                                    <Text className="text-xs text-gray-500">GST & Taxes</Text>
                                    <Text className="text-xs font-bold text-gray-800">
                                        ₹ {item?.TaxAmount ?? 0}
                                    </Text>
                                </View>

                                <View className="h-[1px] bg-gray-200 my-1.5" />

                                <View className="flex-row justify-between items-center pt-0.5">
                                    <Text className="text-xs font-extrabold text-gray-900">
                                        Total Amount
                                    </Text>
                                    <Text
                                        className="text-base font-black"
                                        style={{ color: COLORS.primary }}
                                    >
                                        ₹ {item?.FinalAmount ?? item?.EstimateAmount ?? 0}
                                    </Text>
                                </View>
                            </View>

                            {/* Settlement Choices or QR Display */}
                            {activePayDetails?.active === true ? (
                                <View className="items-center">
                                    <View className="bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2 border border-emerald-200">
                                        <Text className="text-[10px] font-bold text-emerald-700">
                                            Scan with GPay, PhonePe, Paytm
                                        </Text>
                                    </View>

                                    {/* QR Code Container */}
                                    <View className="w-40 h-40 bg-white rounded-xl p-1.5 border border-gray-200 justify-center items-center mb-2">
                                        {activePayDetails?.qr_code ? (
                                            <Image
                                                source={{ uri: activePayDetails.qr_code }}
                                                className="w-full h-full"
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View className="items-center">
                                                <ActivityIndicator size="small" color={COLORS.primary} />
                                                <Text className="text-[10px] text-gray-400 mt-1">Loading QR...</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text className="text-[11px] font-semibold text-center text-gray-600 mb-2.5">
                                        {verifyMsg}
                                    </Text>

                                    <TouchableOpacity
                                        activeOpacity={0.88}
                                        onPress={() => verifyPayment(activePayDetails?.link_id)}
                                        className="w-full py-2.5 rounded-xl items-center justify-center flex-row"
                                        style={{ backgroundColor: COLORS.primary }}
                                        disabled={isVerifying}
                                    >
                                        {isVerifying ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                                        ) : (
                                            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
                                        )}
                                        <Text className="text-xs font-extrabold text-white">
                                            {isVerifying ? "Verifying..." : "Verify Payment"}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={handleCashCollectConfirm}
                                        className="py-1.5 mt-1"
                                    >
                                        <Text className="text-[11px] font-bold text-blue-600">
                                            Switch to Cash on Hand
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-[10px] font-bold text-gray-400 tracking-wider mb-2 text-center uppercase">
                                        Select Payment Method
                                    </Text>

                                    <View className="flex-row justify-between">
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={paymentApi}
                                            className="w-[48%] bg-emerald-50 border border-emerald-200 rounded-xl p-3 items-center justify-center"
                                        >
                                            <Ionicons name="qr-code" size={18} color="#059669" style={{ marginBottom: 4 }} />
                                            <Text className="text-xs font-extrabold text-emerald-900 text-center">
                                                Online QR
                                            </Text>
                                            <Text className="text-[10px] text-emerald-700 text-center">
                                                UPI QR code
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={handleCashCollectConfirm}
                                            className="w-[48%] bg-blue-50 border border-blue-200 rounded-xl p-3 items-center justify-center"
                                        >
                                            <Ionicons name="cash" size={18} color="#2563EB" style={{ marginBottom: 4 }} />
                                            <Text className="text-xs font-extrabold text-blue-900 text-center">
                                                Cash on Hand
                                            </Text>
                                            <Text className="text-[10px] text-blue-700 text-center">
                                                Physical cash
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>
            )}

            {/* Feedback Modal */}
            {showFeedback && (
                <Feedback
                    visible={showFeedback}
                    onClose={closeFeedbackModal}
                    bookingdata={selectedBookingId}
                />
            )}
        </View>
    );
};

export default RenderHelper;

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
});