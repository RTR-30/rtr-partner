import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    Platform,
    PermissionsAndroid,
    Alert,
    Switch,
    StatusBar,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { toggleStatus } from "../../../redux/reduxReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetMyPackageService, getUserDetailsService } from "./helper";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";
import ForceUpdate from "../../../Common/ForceUpdate";
import GetLocation from "react-native-get-location";
import ValidateModal from "../../../Common/ValidateModal";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const Home = () => {
    const navigation: any = useNavigation();
    const dispatch = useDispatch();
    const isEnabled = useSelector((state: any) => state.status?.isEnabled);

    const [loader, setLoader] = useState<boolean>(false);
    const [locationLoading, setLocationLoading] = useState<boolean>(false);
    const [uploadModal, setUploadModal] = useState<boolean>(false);
    const [region, setRegion] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [hasActivePackage, setHasActivePackage] = useState<boolean>(false);
    const [packageData, setPackageData] = useState<any>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const mapRef: any = useRef(null);
    const [updatedAppVersion, setUpdatedAppVersion] = useState<any>(null);
    const platformVersion = Platform.OS === "android" ? updatedAppVersion?.android : updatedAppVersion?.ios;

    // Greeting according to time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    // Driver Initials helper
    const getDriverInitials = (name?: string) => {
        if (!name || typeof name !== "string") return "DP";
        const trimmed = name.trim();
        if (!trimmed || trimmed.toLowerCase() === "driver partner") return "DP";
        const parts = trimmed.split(" ").filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return trimmed.substring(0, 2).toUpperCase();
    };

    // Load locally cached user info first for instant display
    const loadCachedUser = async () => {
        try {
            const cached = await AsyncStorage.getItem("UserData");
            if (cached) {
                const parsed = JSON.parse(cached);
                setUserData((prev: any) => prev || parsed);
            }
        } catch (e) {
            console.log("Error loading cached user in Home:", e);
        }
    };

    // Fetch live user details & verification status
    const fetchUserDetails = async () => {
        try {
            const res = await getUserDetailsService();
            const { data: { success = false, user = {}, app_versions = {} } } = res;

            if (success === true) {
                setUserData(user);
                setUpdatedAppVersion(app_versions);

                // Update storage if needed
                await AsyncStorage.setItem("UserData", JSON.stringify(user));

                const verifyDoc = user?.verify;
                if (verifyDoc === "false") {
                    setUploadModal(true);
                } else {
                    setUploadModal(false);
                }
            }
        } catch (error) {
            console.log("Error fetching user details:", error);
        }
    };

    // Check active driver package status
    const checkPackageStatus = async () => {
        try {
            const res = await GetMyPackageService();
            const { data: { success = false, data = {} } } = res;
            if (success && data && typeof data === "object" && Object.keys(data).length > 0) {
                setPackageData(data);
                setHasActivePackage(true);
            } else {
                setPackageData(null);
                setHasActivePackage(false);
            }
        } catch (e) {
            console.log("Error checking package status:", e);
        }
    };

    // Toggle Online/Offline Switch
    const toggleSwitch = async () => {
        if (isEnabled) {
            // Turning OFF: directly toggle
            dispatch(toggleStatus());
            showSuccess("You are now Offline");
            return;
        }

        // Turning ON: check active package
        setLoader(true);
        try {
            const res = await GetMyPackageService();
            const { data: { success = false, data = {}, message = "" } } = res;

            if (success === true) {
                const myDatas = data === null ? {} : data;
                if (Object.keys(myDatas).length > 0) {
                    setPackageData(myDatas);
                    setHasActivePackage(true);
                    dispatch(toggleStatus());
                    showSuccess("You are now Online! Searching for duties.");
                } else {
                    setHasActivePackage(false);
                    showError("Active package required to go online");
                    togglePayment();
                }
            } else {
                showError(message || "Unable to verify package status");
            }
        } catch (error) {
            showError("Network error while checking package");
        } finally {
            setLoader(false);
        }
    };

    const toggleDocument = (status: boolean) => {
        setUploadModal(status);
    };

    const togglePayment = () => {
        navigation.navigate("PackagePurchase");
    };

    // Request & Fetch Current Driver Location
    const requestLocationPermission = async () => {
        try {
            setLocationLoading(true);
            setLocationError(null);

            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setLocationError("Location permission denied");
                    Alert.alert(
                        "Permission Required",
                        "Location permission is needed to locate you and assign nearby duty bookings."
                    );
                    setLocationLoading(false);
                    return;
                }
            }

            let location;
            try {
                location = await GetLocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 15000,
                });
            } catch (err) {
                location = await GetLocation.getCurrentPosition({
                    enableHighAccuracy: false,
                    timeout: 15000,
                });
            }

            const { latitude, longitude } = location;

            const newRegion = {
                latitude,
                longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
            };

            setRegion(newRegion);
            setLocationError(null);

            await AsyncStorage.setItem(
                "latlong",
                JSON.stringify({
                    lat: latitude,
                    long: longitude,
                })
            );

            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }
        } catch (error: any) {
            console.log("Location Error:", error);
            setLocationError(
                error?.message || "Unable to acquire GPS location. Please check location settings."
            );
        } finally {
            setLocationLoading(false);
        }
    };

    // Smoothly re-center camera to current driver position
    const recenterMap = () => {
        if (region && mapRef.current) {
            mapRef.current.animateToRegion(region, 800);
        } else {
            requestLocationPermission();
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadCachedUser();
            fetchUserDetails();
            checkPackageStatus();
            requestLocationPermission();
        }, [])
    );

    // Premium custom Google Maps style (clean roads, soft landscape, high contrast markers)
    const customMapStyle = [
        {
            elementType: "geometry",
            stylers: [{ color: "#f8fafc" }],
        },
        {
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
        },
        {
            elementType: "labels.text.fill",
            stylers: [{ color: "#475569" }],
        },
        {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#ffffff" }],
        },
        {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#f1f5f9" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#e2e8f0" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#e2e8f0" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#fee2e2" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#fecaca" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e0f2fe" }],
        },
    ];

    const driverName = userData?.name || userData?.Name || "Partner";
    const firstName = driverName.split(" ")[0];
    const walletBalance = Number(userData?.wallet_balance ?? 0);
    const isVerified = userData?.verify !== "false";

    return (
        <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Top Professional App Header */}
            <View style={styles.headerContainer}>
                {/* Driver Profile Greeting & Quick Actions */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("Profile")}
                        style={styles.profileSection}
                    >
                        <View style={styles.avatarCircle}>
                            {userData?.img ? (
                                <Image
                                    source={{ uri: userData.img }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {getDriverInitials(driverName)}
                                </Text>
                            )}
                            {isVerified && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                                </View>
                            )}
                        </View>

                        <View style={styles.greetingContainer}>
                            <Text style={styles.greetingSub}>{getGreeting()},</Text>
                            <Text style={styles.driverNameText} numberOfLines={1}>
                                {firstName} 👋
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Right Action Icons: Refresh Location & Notifications */}
                    <View style={styles.topActionsRow}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={requestLocationPermission}
                            style={styles.actionIconBtn}
                        >
                            {locationLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="refresh" size={19} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("Menu")}
                            style={[styles.actionIconBtn, { marginLeft: 8 }]}
                        >
                            <Ionicons name="ellipsis-vertical" size={19} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero Online / Offline Switch Card */}
                <View style={styles.statusHeroCard}>
                    <View style={styles.statusInfoLeft}>
                        <View style={styles.statusIndicatorRow}>
                            <View
                                style={[
                                    styles.pulsingDot,
                                    { backgroundColor: isEnabled ? "#10B981" : "#94A3B8" },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.statusMainTitle,
                                    { color: isEnabled ? "#059669" : "#475569" },
                                ]}
                            >
                                {isEnabled ? "YOU ARE ONLINE" : "YOU ARE OFFLINE"}
                            </Text>
                        </View>

                        <Text style={styles.statusSubText} numberOfLines={1}>
                            {isEnabled
                                ? "Ready to accept incoming duties"
                                : "Go online to start receiving ride requests"}
                        </Text>
                    </View>

                    <View style={styles.statusSwitchWrapper}>
                        {loader ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <Switch
                                trackColor={{ false: "#E2E8F0", true: "#A7F3D0" }}
                                thumbColor={isEnabled ? "#10B981" : "#94A3B8"}
                                ios_backgroundColor="#E2E8F0"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* Map Area with Overlays */}
            <View style={styles.mapContainer}>
                {region ? (
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={StyleSheet.absoluteFill}
                        initialRegion={region}
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                        followsUserLocation={false}
                        customMapStyle={customMapStyle}
                    >
                        {/* Custom Vehicle Marker */}
                        <Marker
                            coordinate={{
                                latitude: region.latitude,
                                longitude: region.longitude,
                            }}
                            title={driverName}
                            description={isEnabled ? "Online Partner" : "Offline"}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={styles.customMarkerContainer}>
                                <View
                                    style={[
                                        styles.markerPulseHalo,
                                        {
                                            backgroundColor: isEnabled
                                                ? "rgba(16, 185, 129, 0.22)"
                                                : "rgba(224, 33, 31, 0.18)",
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.markerPinCore,
                                        {
                                            backgroundColor: isEnabled
                                                ? "#10B981"
                                                : COLORS.primary,
                                        },
                                    ]}
                                >
                                    <Ionicons name="car" size={17} color="#FFFFFF" />
                                </View>
                            </View>
                        </Marker>
                    </MapView>
                ) : (
                    <View style={styles.locationFallbackCard}>
                        {locationLoading ? (
                            <>
                                <View style={styles.loadingPulseCircle}>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                </View>
                                <Text style={styles.locatingTitle}>Locating Driver Partner...</Text>
                                <Text style={styles.locatingSub}>
                                    Acquiring GPS position for live navigation & duties
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="location-outline" size={42} color="#94A3B8" />
                                <Text style={styles.locatingTitle}>Location Services Needed</Text>
                                <Text style={styles.locatingSub}>
                                    {locationError ||
                                        "Please turn on device location to view map & accept bookings."}
                                </Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={requestLocationPermission}
                                    style={styles.retryLocationBtn}
                                >
                                    <Ionicons
                                        name="navigate"
                                        size={16}
                                        color="#FFFFFF"
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={styles.retryLocationText}>Retry GPS</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                {/* Floating Top Radar Status Chip */}
                {region && (
                    <View style={styles.floatingRadarPill}>
                        <View
                            style={[
                                styles.radarIndicatorDot,
                                { backgroundColor: isEnabled ? "#10B981" : "#94A3B8" },
                            ]}
                        />
                        <Text style={styles.floatingRadarText}>
                            {isEnabled
                                ? "Live Duty Radar Active • Searching Area"
                                : "Radar Paused • Switch Online to Receive Rides"}
                        </Text>
                    </View>
                )}

                {/* Floating Map Action Buttons (Right side) */}
                {region && (
                    <View style={styles.floatingMapControls}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={recenterMap}
                            style={styles.floatingFabBtn}
                        >
                            <Ionicons name="locate" size={21} color={COLORS.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate("Duty")}
                            style={[styles.floatingFabBtn, { marginTop: 10 }]}
                        >
                            <Ionicons name="briefcase-outline" size={20} color="#1E293B" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bottom Driver Cockpit Card */}
                <View style={styles.bottomCockpitContainer}>
                    {/* Small Handle Drag Bar */}
                    <View style={styles.dragHandle} />

                    {/* Unverified Driver Warning Banner */}
                    {!isVerified && (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => toggleDocument(true)}
                            style={styles.kycWarningBanner}
                        >
                            <Ionicons name="shield-alert-outline" size={20} color="#D97706" />
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Text style={styles.kycWarningTitle}>
                                    Document Verification Incomplete
                                </Text>
                                <Text style={styles.kycWarningSub}>
                                    Tap to verify Aadhaar & Driving License now
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#D97706" />
                        </TouchableOpacity>
                    )}

                    {/* Quick Metric Cards Row */}
                    <View style={styles.metricsRow}>
                        {/* 1. Wallet Balance */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate("Wallet")}
                            style={styles.metricCard}
                        >
                            <View style={[styles.metricIconWrap, { backgroundColor: "#ECFDF5" }]}>
                                <Ionicons name="wallet-outline" size={18} color="#059669" />
                            </View>
                            <Text style={styles.metricLabel}>Wallet</Text>
                            <Text style={styles.metricValue} numberOfLines={1}>
                                ₹{walletBalance.toLocaleString("en-IN")}
                            </Text>
                        </TouchableOpacity>

                        {/* 2. Package Status */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={togglePayment}
                            style={styles.metricCard}
                        >
                            <View
                                style={[
                                    styles.metricIconWrap,
                                    {
                                        backgroundColor: hasActivePackage
                                            ? "#FEF3C7"
                                            : "#FEE2E2",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={
                                        hasActivePackage
                                            ? "shield-checkmark"
                                            : "card-outline"
                                    }
                                    size={18}
                                    color={hasActivePackage ? "#D97706" : COLORS.primary}
                                />
                            </View>
                            <Text style={styles.metricLabel}>Package</Text>
                            <Text
                                style={[
                                    styles.metricValue,
                                    {
                                        color: hasActivePackage ? "#059669" : COLORS.primary,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {hasActivePackage ? "Active" : "Buy Plan"}
                            </Text>
                        </TouchableOpacity>

                        {/* 3. Available Duties */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate("Duty")}
                            style={styles.metricCard}
                        >
                            <View style={[styles.metricIconWrap, { backgroundColor: "#EFF6FF" }]}>
                                <Ionicons name="briefcase-outline" size={18} color="#2563EB" />
                            </View>
                            <Text style={styles.metricLabel}>Duties</Text>
                            <Text
                                style={[styles.metricValue, { color: "#2563EB" }]}
                                numberOfLines={1}
                            >
                                View Feed
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Primary Action Button */}
                    {isEnabled ? (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate("Duty")}
                            style={styles.primaryDutyBtn}
                        >
                            <Ionicons
                                name="radio-button-on"
                                size={18}
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.primaryDutyBtnText}>
                                VIEW AVAILABLE DUTIES
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color="#FFFFFF"
                                style={{ marginLeft: 6 }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={toggleSwitch}
                            style={styles.goOnlineBtn}
                        >
                            <Ionicons
                                name="power"
                                size={18}
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.goOnlineBtnText}>GO ONLINE TO EARN</Text>
                        </TouchableOpacity>
                    )}

                    {/* Secondary Shortcut Strip */}
                    <View style={styles.quickLinksRow}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("MyDuty")}
                            style={styles.quickLinkItem}
                        >
                            <Ionicons name="clipboard-outline" size={15} color="#475569" />
                            <Text style={styles.quickLinkText}>My Trips</Text>
                        </TouchableOpacity>

                        <View style={styles.quickLinkDivider} />

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("Statistics")}
                            style={styles.quickLinkItem}
                        >
                            <Ionicons name="bar-chart-outline" size={15} color="#475569" />
                            <Text style={styles.quickLinkText}>Earnings</Text>
                        </TouchableOpacity>

                        <View style={styles.quickLinkDivider} />

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("ContactUs")}
                            style={styles.quickLinkItem}
                        >
                            <Ionicons name="help-circle-outline" size={15} color="#475569" />
                            <Text style={styles.quickLinkText}>Support</Text>
                        </TouchableOpacity>

                        <View style={styles.quickLinkDivider} />

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("HelpAndFeedback")}
                            style={styles.quickLinkItem}
                        >
                            <Ionicons name="document-text-outline" size={15} color="#475569" />
                            <Text style={styles.quickLinkText}>Terms</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Global Loader Overlay */}
            {loader && (
                <View style={styles.globalLoaderOverlay}>
                    <View style={styles.globalLoaderCard}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.globalLoaderText}>Checking package status...</Text>
                    </View>
                </View>
            )}

            {/* App Force Update Guard */}
            <ForceUpdate latestVersion={platformVersion?.latest_version} />

            {/* Mandatory Driver Document Verification Modal */}
            <ValidateModal
                visible={uploadModal}
                onSuccess={() => {
                    setUploadModal(false);
                    fetchUserDetails();
                }}
            />
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    headerContainer: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? 12 : 6,
        paddingBottom: 14,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        zIndex: 20,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.8)",
        position: "relative",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.primary,
    },
    verifiedBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
    },
    greetingContainer: {
        marginLeft: 10,
        justifyContent: "center",
    },
    greetingSub: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.85)",
        fontWeight: "500",
    },
    driverNameText: {
        fontSize: 17,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.2,
    },
    topActionsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionIconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    statusHeroCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 4,
    },
    statusInfoLeft: {
        flex: 1,
        paddingRight: 10,
    },
    statusIndicatorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusMainTitle: {
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.6,
    },
    statusSubText: {
        fontSize: 11,
        color: "#64748B",
        fontWeight: "500",
    },
    statusSwitchWrapper: {
        justifyContent: "center",
        alignItems: "center",
        minWidth: 50,
    },
    mapContainer: {
        flex: 1,
        backgroundColor: "#F1F5F9",
        position: "relative",
    },
    customMarkerContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
    },
    markerPulseHalo: {
        position: "absolute",
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    markerPinCore: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2.5,
        borderColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    floatingRadarPill: {
        position: "absolute",
        top: 14,
        alignSelf: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 10,
    },
    radarIndicatorDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 8,
    },
    floatingRadarText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E293B",
    },
    floatingMapControls: {
        position: "absolute",
        right: 16,
        top: 70,
        zIndex: 10,
    },
    floatingFabBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    locationFallbackCard: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: "#F8FAFC",
    },
    loadingPulseCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    locatingTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 6,
        textAlign: "center",
    },
    locatingSub: {
        fontSize: 13,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 18,
        maxWidth: 280,
    },
    retryLocationBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 18,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    retryLocationText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    bottomCockpitContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 15,
    },
    dragHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#E2E8F0",
        alignSelf: "center",
        marginBottom: 10,
    },
    kycWarningBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    kycWarningTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#B45309",
    },
    kycWarningSub: {
        fontSize: 11,
        color: "#92400E",
    },
    metricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    metricCard: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: "center",
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    metricIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: "800",
        color: "#0F172A",
    },
    primaryDutyBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        height: 46,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    primaryDutyBtnText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
        letterSpacing: 0.5,
    },
    goOnlineBtn: {
        backgroundColor: "#10B981",
        borderRadius: 14,
        height: 46,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    goOnlineBtnText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 14,
        letterSpacing: 0.5,
    },
    quickLinksRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    quickLinkItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 2,
    },
    quickLinkText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
        marginLeft: 5,
    },
    quickLinkDivider: {
        width: 1,
        height: 14,
        backgroundColor: "#E2E8F0",
    },
    globalLoaderOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    globalLoaderCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    globalLoaderText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1E293B",
        marginTop: 12,
    },
});
