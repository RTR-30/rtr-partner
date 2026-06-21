import React, { useEffect, useState, useRef } from "react";
import { View, Text, Platform, PermissionsAndroid, Alert, Switch, Image, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

import MapView, { Marker, Polyline } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { toggleStatus } from "../../../redux/reduxReducer";
import { validateAadhaar } from "../../../Common/AadhaarCardValid/aadharCardValid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyDetailsServices } from "./helper";
import MapViewDirections from "react-native-maps-directions";
import { Google_map } from "../../../../environment/ApiManager";

const Home = () => {
    const navigation: any = useNavigation();

    const [loader, setLoader] = useState<boolean>(false);

    const [showPaymentModal, setShowPaymentModal] = useState<any>(true);
    const [uploadModal, setUploadModal] = useState<any>(false);

    const [aadhaar, setAadhaar] = useState('');
    const [aadharError, setAadharError] = useState('');

    const [region, setRegion] = useState<any>(null);

    const mapRef: any = useRef(null);

    const dispatch = useDispatch();
    const isEnabled = useSelector((state: any) => state.status.isEnabled);
console.log(region);

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
            Alert.alert('License Info', JSON.stringify(form, null, 2));
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

    const toggleSwitch = () => {
        dispatch(toggleStatus());
    };

    const toggleDocument = (status: any) => {
        if (status === true) {
            setUploadModal(true);
        } else {
            setUploadModal(false);
        }
    }

    const togglePayment = () => {
        setShowPaymentModal(true);
    }

    const handleCheckAadhaar = () => {
        if (validateAadhaar(aadhaar)) {
            Alert.alert("✅ Aadhaar is valid");
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

    const fetchdetails = async (tokens: any) => {
        setLoader(true);
        const data = {
            "aadhaar": aadhaar,
            "licensenumber": form.licenseNumber,
            "fullname": form.name,
            "dob": form.dob,
            "expirydate": form.expiryDate
        }
        try {
            const verifi = await verifyDetailsServices(tokens, data)

            setUploadModal(true);
        } catch (error) {
            console.log(error);
        } finally {
            setLoader(false)
        }
    }


    const fetchUserData = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("UserData");
            const tokens: any = await AsyncStorage.getItem("token");
            if (storedUserData || tokens) {
                // setToken(tokens);
                fetchdetails(tokens);
                // await fetchData(tokens, currentPageLimit, 1);
                toggleDocument(true)
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
        requestLocationPermission();
    }, []);

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
        <View style={{ flex: 1 }}>

            <MapView
                ref={mapRef}
                customMapStyle={customMapStyle}
                style={{ width: "100%", height: "100%" }}
                initialRegion={region}
                showsUserLocation={true}
                followsUserLocation={true}
            >
            </MapView>


            <View
                style={{
                    position: "absolute",
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginTop: "10%",
                    height: "10%",
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
                        onValueChange={toggleSwitch}
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

            <Modal
                visible={!uploadModal}
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
                                <TouchableOpacity onPress={handleCheckAadhaar} className="w-[150px] h-[40px] bg-[#9400FF] justify-center items-center rounded-[10px]">
                                    <Text className="text-white text-[18px] font-bold">Validate</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={!showPaymentModal}
                transparent
                animationType="fade"
                onRequestClose={togglePayment}
            >
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View className="bg-[#f2f2f2] h-[80%] w-[90%] rounded-3xl p-3">
                        <View className="mt-3 w-full">
                            <Text className="text-center text-black text-[16px] font-bold">Payment Process</Text>
                        </View>

                        <View className="mt-3">
                            <Text className="text-blue-600 text-[14px] text-center font-bold">Your payment is successfully completed then only you can get the ride</Text>
                        </View>

                        <View className="mt-10">
                            <Text className="text-black text-[14px] text-center font-bold">There are two types of payment is available</Text>
                        </View>

                        <View className="mt-3">
                            <Text className="text-black text-[12px] font-bold">{"⦿  ₹1000 option: no wallet balance included"}</Text>
                            <Text className="text-black text-[12px] font-bold">{"⦿  ₹1500 option: wallet ₹500 included (meaning the user gets ₹500 wallet balance if they pay ₹1500)"}</Text>
                        </View>

                        <View className="mt-10">
                            <Text className="text-black text-[14px] text-center font-bold">Choose Your Payment Option</Text>
                        </View>

                        <View className="mt-5 flex-row w-full justify-around">
                            <TouchableOpacity className="w-[46%] h-[100px] bg-[#9400FF] justify-center items-center rounded-[10px]">
                                <Text className="text-white text-[18px] text-center font-bold">Pay</Text>
                                <Text className="text-white text-[18px] text-center font-bold">₹1000</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="w-[46%] h-[100px] bg-[#9400FF] justify-center items-center rounded-[10px]">
                                <Text className="text-white text-[18px] text-center font-bold">Pay</Text>
                                <Text className="text-white text-[18px] text-center font-bold">₹1500</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
