import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CancelRideService, CashCollectService, EndRideService, onlinePaymentService, StartRideService, verifyPaymentService } from "./helper";
import { useNavigation } from "@react-navigation/native";
import Geolocation from "@react-native-community/geolocation";
import OneTimeCodeTextComponent from "../../../Common/OneTimeCodeText";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";
import Feedback from "../../../Common/Feedback";

const RenderHelper = ({ item, token, setLoading, fetchAcceptList, payDetails, setPayDetails }: any) => {

    const [region, setRegion] = useState<any>(null);
    const [startRide, setStartRide] = useState<boolean>(false);
    const navigation: any = useNavigation();
    const mapRef: any = useRef(null);
    const [otp, setOtp] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [msg, setMsg] = useState<any>('Click Verify Button')
    const [paymentCheck, setPaymentCheck] = useState<boolean>(false);

    const [selectedBookingId, setSelectedBookingId] = useState<any>();
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    const openFeedbackModal = () => {
        setShowFeedback(true);
    }

    const closeFeedbackModal = () => {
        fetchAcceptList(token)
        setShowFeedback(false);
    }
    
    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert(
                        "Permission Denied",
                        "Location permission is required to show your position."
                    );
                    return;
                }
            }


            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    setRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    Alert.alert(
                        "Location Error",
                        "Unable to fetch location. Please ensure location services are enabled."
                    );
                }
            );

            const watchId = Geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newRegion = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    setRegion(newRegion);
                    const latlong = {
                        lat: latitude,
                        long: longitude
                    }
                    if (mapRef.current) {
                        mapRef.current.animateToRegion(newRegion, 1000);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: 10,
                }
            );

            return () => Geolocation.clearWatch(watchId);
        } catch (err) {
            console.error("Permission Error:", err);
        }
    };

    const CancelRide = async (Id: any) => {

        const datas = {
            "bookingId": Id
        }

        try {
            const res: any = await CancelRideService(token, datas);
            if (res?.data?.success === true) {
                navigation.navigate("Duty");
            }
        } catch (error) {
            showError(error);
        }
    }

    const formatDateTime = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            ...(includeTime && {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        });
    };

    const openMap = () => {
        const { latitude, longitude } = region;
        const { lat, long } = item.LocationCode;

        if (!latitude || !longitude) {
            Alert.alert("Error", "Current location not available");
            return;
        }

        const url =
            Platform.OS === "ios"
                ? `http://maps.apple.com/?saddr=${latitude},${longitude}&daddr=${lat},${long}`
                : `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lat},${long}&travelmode=driving`;

        Linking.openURL(url);
    };

    const navigateHome = () => {
        openMap();
    }

    const handleStartRide = async (data: any) => {
        if (Number(otp) !== data.OTP) {
            showSuccess("OTP mismatch try again");
            return
        }
        setLoading(true);
        const payload = {
            "bookingId": data.Id,
            "OTP": otp
        }
        try {
            const res = await StartRideService(token, payload);

            if (res?.data?.success === true) {
                setStartRide(false);
                fetchAcceptList(token)
            }

        } catch (error) {
            showError(error);
        } finally {
            setLoading(false)
        }
    }

    const paymentApi = async (item: any) => {
        setLoading(true)
        setSelectedBookingId(item?.Id)
        const payload = {
            bookingId: item?.Id
        }
        try {
            const res = await onlinePaymentService(token, payload)
            const { data: { success = false, message = '', payment_link = '', qr_code = '', link_id = '' } } = res

            if (success === true) {
                setPaymentCheck(true)
                setPayDetails({
                    payment_link: payment_link,
                    qr_code: qr_code,
                    link_id: link_id,
                    active: true
                })
                showSuccess(message)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const verifyPayment = async (linkId: any, token: any) => {
        setLoading(true);
        const payload = {
            linkId: linkId
        }
        try {
            const res = await verifyPaymentService(token, payload);
            const { data: { success = false, message = '', status = '' } } = res;
            if (success === true) {
                if (status === "PENDING") {
                    setMsg(message)
                } else if (status === "SUCCESS") {
                    showSuccess(message)
                    modalClose();
                    // fetchAcceptList(token)
                } else {
                    setMsg(message)
                }
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCashCollect = async (bookingData: any) => {
        setLoading(true);
        setSelectedBookingId(bookingData?.Id)
        const payload = {
            bookingId: bookingData.Id
        }

        try {
            const res = await CashCollectService(token, payload)
            const { data: { success = false, message = '' }, status = 0 } = res
            if (status === 200) {
                showSuccess(message);
                modalClose()
            } else {
                showError(message)
            }

        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const modalOpen = () => {
        setModalVisible(true)
    }

    const modalClose = () => {
        openFeedbackModal()
        setModalVisible(false)
    }

    const handleEndRide = async (data: any) => {
        setLoading(true);
        const payload = {
            "bookingId": data.Id
        }
        try {
            const res = await EndRideService(token, payload)
            fetchAcceptList(token)
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false)
        }
    }

    const formatEndDate = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const StartRideOtp = async () => {
        setStartRide(!startRide);
    }

    useEffect(() => {
        requestLocationPermission();
    }, [])
    return (
        <View className="w-full mb-3 rounded-2xl border-black shadow-black border-[0.1px] bg-white" style={{ elevation: 3 }}>
            <View className="flex-row w-full justify-center rounded-t-2xl items-center">
                <View className="w-[50%] p-2 bg-orange-400 rounded-tl-2xl border-[0.3px]">
                    <Text className="text-white font-bold text-[18px] text-center">{item.Status}</Text>
                </View>

                <View className="w-[50%] p-2 bg-yellow-300 rounded-tr-2xl border-[0.3px]">
                    <Text className={`text-black font-bold text-[18px] text-center`}>Total   ₹ {item.EstimateAmount}</Text>
                </View>
            </View>

            <View className="flex-row w-full mt-2 p-1">
                <View className="w-[50%] justify-center items-center">
                    <Text className="text-black font-bold text-[14px]">Start Date</Text>
                    <Text className="text-blue-600 font-bold text-[14px]">{formatDateTime(item.StartDate)}</Text>
                </View>

                {
                    item.EndDate && (
                        <View className="w-[50%] justify-center items-center">
                            <Text className="text-black font-bold text-[14px]">End Date</Text>
                            <Text className="text-blue-600 font-bold text-[14px]">{formatEndDate(item.EndDate)}</Text>
                        </View>
                    )
                }
            </View>

            <View className="w-full flex-row p-3">
                <View className="w-full flex-row">
                    <View className="w-[80%]">
                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Name</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.Name}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Address</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.Address}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Hours</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.Hours}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Gear Type</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className="text-blue-600 font-bold text-[14px]"> :   {item.GearType}</Text>
                            </View>
                        </View>

                        <View className="w-[100%] flex-row">
                            <View className="w-[25%]">
                                <Text className="text-black font-bold text-[14px]">Payment Status</Text>
                            </View>
                            <View className="w-[75%]">
                                <Text className={`${item.PaymentStatus === "UnPaid" ? "text-red-600" : "text-green-600"} font-bold text-[14px]`}> :   {item.PaymentStatus}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="w-[20%]">
                        <View className="mt-1">
                            <TouchableOpacity className="bg-[#5a639c] rounded-[10px] w-[50%] h-[40px] justify-center items-center">
                                <Ionicons name="call" size={20} color={"white"} />
                            </TouchableOpacity>
                        </View>

                        <View className="mt-5">
                            <TouchableOpacity onPress={navigateHome} className="bg-[#5a639c] rounded-[10px] w-[50%] h-[40px] justify-center items-center">
                                <Text className="text-white text-center font-bold text-[16px]">Map</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {
                item.Status === "InProgress" ? (
                    <View className="p-2 w-full justify-around flex-row items-center">
                        <TouchableOpacity onPress={() => handleEndRide(item)} className="w-[40%] justify-center items-center bg-red-500 p-1 rounded-xl">
                            <Text className="text-center text-white font-bold text-[18px]">End Ride</Text>
                        </TouchableOpacity>
                    </View>
                ) : item.Status === "PaymentPending" ?
                    <View className="p-2 w-full justify-around flex-row items-center">
                        <TouchableOpacity onPress={modalOpen} className="w-[40%] justify-center items-center bg-green-500 p-1 rounded-xl">
                            <Text className="text-center text-white font-bold text-[18px]">Pay</Text>
                        </TouchableOpacity>
                    </View> : (
                        <View className="p-2 w-full justify-around flex-row items-center">
                            <TouchableOpacity onPress={() => StartRideOtp()} className={`w-[40%] justify-center items-center bg-green-500 p-1 rounded-xl`}>
                                <Text className="text-center text-white font-bold text-[18px]">Start Ride</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => CancelRide(item.Id)} className="w-[40%] justify-center items-center bg-red-500 p-1 rounded-xl">
                                <Text className="text-center text-white font-bold text-[18px]">Cancel Ride</Text>
                            </TouchableOpacity>
                        </View>
                    )
            }

            {startRide && (
                <Modal
                    visible={startRide}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setStartRide(false)}
                >
                    <View className="absolute w-full h-full justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <View className="w-96 h-60 justify-center items-center bg-slate-200 rounded-3xl">
                            <View className=" justify-center items-center">
                                <Text className="text-[20px] text-black">Enter Otp</Text>
                            </View>
                            <OneTimeCodeTextComponent
                                cellCount={4}
                                value={otp}
                                onChangeText={(value: string) => setOtp(value)}
                            />

                            <View className="flex-row justify-around w-full mt-10">
                                <TouchableOpacity onPress={() => handleStartRide(item)} className="w-44 h-10 bg-green-400 justify-center items-center rounded-lg">
                                    <Text className="text-center text-white">Enter</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStartRide(false)} className="w-44 h-10 bg-red-400 justify-center items-center rounded-lg">
                                    <Text className="text-center text-white">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {modalVisible ?
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="absolute w-full h-full justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <View className="w-96 items-center bg-slate-200 rounded-3xl p-3">
                            <View className="w-full flex-row p-2">
                                <View className="w-[90%] justify-center items-center">
                                    <Text className="text-[20px] font-bold text-black">Payment Type</Text>
                                </View>

                                <View className="w-[10%] justify-center items-center">
                                    <TouchableOpacity className="" onPress={() => setModalVisible(false)}>
                                        <Text className="text-[15px] text-red-600 font-bold">X</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="w-full p-2">
                                <View className="my-2 flex-row justify-center items-center">
                                    <Text className="text-black text-[14px] font-bold w-[50%]">Final DriverShare  </Text>
                                    <Text className="text-black text-[14px] font-bold w-[50%]">:   ₹ {item?.FinalDriverShare}</Text>
                                </View>

                                <View className="my-2 flex-row justify-center items-center">
                                    <Text className="text-black text-[14px] font-bold w-[50%]">Tax Amount  </Text>
                                    <Text className="text-black text-[14px] font-bold w-[50%]">:   ₹ {item?.TaxAmount}</Text>
                                </View>

                                <View className="my-2 flex-row justify-center items-center">
                                    <Text className="text-black text-[14px] font-bold w-[50%]">Platform Fee  </Text>
                                    <Text className="text-black text-[14px] font-bold w-[50%]">:   ₹ {item?.PlatformFeeAmount}</Text>
                                </View>

                                <View className="my-2 flex-row justify-center items-center">
                                    <Text className="text-red-600 text-[14px] font-bold w-[50%]">Total Amount  </Text>
                                    <Text className="text-red-600 text-[14px] font-bold w-[50%]">:   ₹ {item?.FinalAmount}</Text>
                                </View>
                            </View>

                            {payDetails?.active === true ?
                                <View className="w-full p-2 justify-center items-center">
                                    <Text className="text-[18px] font-bold text-blue-900">Scan Qr</Text>
                                    <View className="mt-2 w-[50%] h-40">
                                        <Image
                                            source={{
                                                uri: `${payDetails?.qr_code}`,
                                            }}
                                            resizeMode="cover"
                                            className="h-full w-full"
                                        />
                                    </View>

                                    <View className="w-full justify-center items-center mt-10">
                                        <Text className="text-red-600 text-[14px] font-bold">{msg}</Text>
                                    </View>

                                    <View className="mt-4 w-[70%] p-2">
                                        <TouchableOpacity onPress={() => verifyPayment(payDetails?.link_id, token)} className="p-2 rounded-lg justify-center items-center" style={{ backgroundColor: COLORS.primary }}>
                                            <Text className="text-center text-[14px] text-white font-bold">Verify Payment</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View> :
                                <View className="justify-between w-full items-center flex-row p-2 mt-8">
                                    <View className="w-[45%] h-10 justify-center items-center rounded-xl">
                                        <TouchableOpacity onPress={() => paymentApi(item)} className="bg-green-600 w-full h-full justify-center items-center rounded-xl">
                                            <Text className="text-center text-white font-bold text-[13px]">Online Payment</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="w-[45%] h-10 justify-center items-center rounded-xl">
                                        <TouchableOpacity onPress={() => handleCashCollect(item)} className="bg-blue-500 w-full h-full justify-center items-center rounded-xl">
                                            <Text className="text-center text-white font-bold text-[13px]">Cash on Hand</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }


                        </View>
                    </View>
                </Modal> : null
            }

            {showFeedback ?
                <Feedback 
                    visible={showFeedback} 
                    onClose={() => closeFeedbackModal()} 
                    bookingdata={selectedBookingId}
                    tokens={token}
                /> : null
            }
        </View>
    )
};

export default RenderHelper;