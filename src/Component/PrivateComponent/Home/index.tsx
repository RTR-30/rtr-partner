import React, { useEffect, useState, useRef } from "react";
import { View, Text, Platform, PermissionsAndroid, Alert, Switch, Image, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { toggleStatus } from "../../../redux/reduxReducer";
import { validateAadhaar } from "../../../Common/AadhaarCardValid/aadharCardValid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetMyPackageService, getUserDetailsService, PaymentProcessService, verifyDetailsServices } from "./helper";
import MapViewDirections from "react-native-maps-directions";
import { Google_map } from "../../../../environment/ApiManager";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";
import PaymentRender from "./PaymentRender";
import PackagePurchase from "../../../Common/PackagePurchase";

const Home = () => {
    const navigation: any = useNavigation();

    const [loader, setLoader] = useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = useState<any>(false);
    const [uploadModal, setUploadModal] = useState<any>(false);

    const [aadhaar, setAadhaar] = useState('');
    const [aadharError, setAadharError] = useState('');

    const [region, setRegion] = useState<any>(null);

    const mapRef: any = useRef(null);

    const dispatch = useDispatch();
    const isEnabled = useSelector((state: any) => state.status.isEnabled);

    //driving license
    const [form, setForm] = useState<any>({
        licenseNumber: '',
        name: '',
        dob: '',
        issueDate: '',
        expiryDate: '',
        authority: '',
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (key: any, value: any) => {
        setForm((prev: any) => ({ ...prev, [key]: value }));
        setErrors((prev: any) => ({ ...prev, [key]: null })); // Clear error on input
    };

    const validateDate = (date: any) => {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[0-2])[\/\-]\d{4}$/;
        return dateRegex.test(date);
    };

    const validateForm = () => {
        let valid: any = true;
        let tempErrors: any = {};

        if (!form.licenseNumber.trim()) {
            tempErrors.licenseNumber = 'License number is required';
            valid = false;
        }

        if (!form.name.trim()) {
            tempErrors.name = 'Name is required';
            valid = false;
        } else if (!/^[a-zA-Z ]+$/.test(form.name)) {
            tempErrors.name = 'Name must contain only letters';
            valid = false;
        }

        if (!form.dob || !validateDate(form.dob)) {
            tempErrors.dob = 'Valid date of birth is required (DD/MM/YYYY)';
            valid = false;
        }

        if (!form.expiryDate || !validateDate(form.expiryDate)) {
            tempErrors.expiryDate = 'Valid expiry date is required (DD/MM/YYYY)';
            valid = false;
        }

        setErrors(tempErrors);
        return valid;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            fetchdetails()
        }
    };

    const renderInput = (label: any, key: any, placeholder: any) => {
        return (
            <>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={[styles.input, errors[key] && styles.errorInput]}
                    placeholder={placeholder}
                    onChangeText={text => handleChange(key, text)}
                    value={form[key]}
                />
                {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </>
        );
    }


    const toggleSwitch = async () => {
        setLoader(true)
        if (isEnabled) {
            return dispatch(toggleStatus());
        }
        try {
            const res = await GetMyPackageService();
            const { data: { success = false, data = {}, message = "" } } = res

            if (success === true) {
                const myDatas = data === null ? {} : data
                if (Object.keys(myDatas).length > 0) {
                    dispatch(toggleStatus());
                } else {
                    showError("No package found");
                    togglePayment()
                }
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    };

    const toggleDocument = (status: any) => {

        setUploadModal(status);
    }

    const togglePayment = () => {
        setShowPaymentModal(true);
    }

    const handleCheckAadhaar = () => {
        if (validateAadhaar(aadhaar)) {
            showSuccess("✅ Aadhaar is valid");
            handleSubmit()
            setAadharError('');
        } else {
            setAadharError("Invalid Aadhaar number");
        }
    };

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
                    AsyncStorage.setItem('latlong', JSON.stringify(latlong))
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

    const fetchdetails = async () => {
        setLoader(true);
        const data = {
            aadhaar: aadhaar,
            licensenumber: form.licenseNumber,
            fullname: form.name,
            dob: form.dob,
            expirydate: form.expiryDate
        }
        try {
            const res = await verifyDetailsServices(data)
            const { data: { success = false, message = "" } } = res;
            if (success) {
                showSuccess(message)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoader(false)
        }
    }

    const fetchUserDetails = async () => {
        setLoader(true)
        try {
            const res = await getUserDetailsService();
            const { data: { success = false, user = {} } } = res

            if (success === true) {
                const verifyDoc = user?.verify;
                
                if (verifyDoc === "false") {
                    toggleDocument(true);
                } else {
                    toggleDocument(false)
                }
            } else {
                showError("user details error")
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    // useEffect(() => {
    //     fetchUserData();
    //     fetchUserDetails();
    //     requestLocationPermission();
    // }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchUserDetails();
            requestLocationPermission();
        }, [])
    );

    if (!region) {
        return null;
    }

    const customMapStyle = [
        {
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
        },
        {
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#f5f5f5' }],
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#eeeeee' }],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-around",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <View
                        style={{
                            width: "30%",
                            backgroundColor: "white",
                            borderRadius: 10,
                            height: "50%",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                        }}
                    >
                        <Text
                            style={{
                                color: isEnabled ? "green" : "red",
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                        >
                            {isEnabled ? "Online" : "Offline"}
                        </Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#ABBA7C" }}
                            thumbColor={isEnabled ? "#3D5300" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => toggleSwitch()}
                            value={isEnabled}
                        />
                    </View>

                    <View
                        style={{
                            width: "60%",
                            backgroundColor: "white",
                            borderRadius: 10,
                            height: "50%",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: "black",
                                fontSize: 16,
                                fontWeight: "600",
                                textAlign: "center",
                            }}
                        >
                            RTR Partner
                        </Text>
                    </View>
                </View>
            </View>

            <View className="" style={{ flex: 9 }}>
                <MapView
                    ref={mapRef}
                    // customMapStyle={customMapStyle}
                    style={{ width: "100%", height: "100%" }}
                    initialRegion={region}
                    showsUserLocation={true}
                    followsUserLocation={true}
                >
                </MapView>
            </View>



            <Modal
                visible={uploadModal}
                transparent
                animationType="fade"
                onRequestClose={() => toggleDocument(false)}
            >
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View className="bg-[#f2f2f2] h-[80%] w-[90%] rounded-3xl p-3">
                        <ScrollView contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false}>
                            <Text className="text-center text-[16px] text-black font-bold mt-[4%]">Verification Details</Text>
                            <View className="w-full mt-[10%]">
                                <Text className="text-[16px] text-black font-bold">Enter Aadhaar Number *</Text>
                                <TextInput
                                    placeholder="Aadhaar Number"
                                    keyboardType="numeric"
                                    maxLength={12}
                                    value={aadhaar}
                                    onChangeText={setAadhaar}
                                    style={styles.input}
                                />
                                {aadharError !== '' && <Text className="text-red-600 mt-2 font-bold test-[16px]">{aadharError}</Text>}
                            </View>

                            <View className="w-full mt-[5%]">
                                <Text className="text-[16px] text-black font-bold">Enter Driving License Details *</Text>
                                {renderInput('License Number', 'licenseNumber', 'e.g. DL-0420110149646')}
                                {renderInput('Full Name', 'name', 'Your Full Name')}
                                {renderInput('Date of Birth', 'dob', 'DD/MM/YYYY')}
                                {renderInput('Expiry Date', 'expiryDate', 'DD/MM/YYYY')}
                            </View>

                            <View className="mt-10 w-full justify-center items-center">
                                <TouchableOpacity onPress={handleCheckAadhaar} style={{ backgroundColor: COLORS.primary }} className="w-[150px] h-[40px] justify-center items-center rounded-[10px]">
                                    <Text className="text-white text-[18px] font-bold">Validate</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {showPaymentModal ? (
                <PackagePurchase
                    visible={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                />
            ) : null}
        </View >
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f2f2f2',
        flexGrow: 1,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
    },
    label: {
        marginTop: 10,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        marginTop: 5,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 3,
    },
    buttonContainer: {
        marginTop: 30,
    },
});
