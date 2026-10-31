import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../../utils/ColorCode";

const BgPattern = require("../../../../assets/Imgs/bgImg.png");
const LogoImg = require("../../../../assets/Imgs/Logo.png");

const { width } = Dimensions.get("window");
const SPLASH_DURATION_MS = 3500;

const SplashScreen = () => {
    const navigation: any = useNavigation();

    // Guard to ensure navigation happens only once
    const hasNavigated = useRef<boolean>(false);

    // Animated values for entrance, pulse, and progress bar
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.88)).current;
    const slideUpAnim = useRef(new Animated.Value(24)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Navigate to next screen safely based on authentication status
    const handleProceed = async () => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;

        try {
            const storedUserData = await AsyncStorage.getItem("UserData");
            const storedToken = await AsyncStorage.getItem("token");

            if (storedUserData && storedToken) {
                if (navigation.replace) {
                    navigation.replace("Home");
                } else {
                    navigation.navigate("Home");
                }
            } else {
                if (navigation.replace) {
                    navigation.replace("Login");
                } else {
                    navigation.navigate("Login");
                }
            }
        } catch (error) {
            console.log("Error determining next route:", error);
            if (navigation.replace) {
                navigation.replace("Login");
            } else {
                navigation.navigate("Login");
            }
        }
    };

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                tension: 45,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 650,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous subtle pulsing glow ring around the logo
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.18,
                    duration: 1300,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1300,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseLoop.start();

        // Smooth progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: SPLASH_DURATION_MS,
            useNativeDriver: false,
        }).start();

        // Auto navigation timeout
        const timer = setTimeout(() => {
            handleProceed();
        }, SPLASH_DURATION_MS);

        return () => {
            clearTimeout(timer);
            pulseLoop.stop();
        };
    }, []);

    // Interpolate progress width
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />

            {/* Background Texture with Subtle Overlay */}
            <Image
                source={BgPattern}
                style={styles.bgImage}
                resizeMode="cover"
            />
            <View style={styles.bgOverlay} />

            {/* Ambient Lighting Orbs */}
            <View style={styles.ambientGlowPrimary} pointerEvents="none" />
            <View style={styles.ambientGlowSecondary} pointerEvents="none" />

            {/* Foreground Content */}
            <SafeAreaView style={styles.safeArea}>
                {/* Header Row: Live Status Pill & Skip Button */}
                <Animated.View style={[styles.headerRow, { opacity: fadeAnim }]}>
                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusPillText}>PARTNER APP</Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleProceed}
                        style={styles.skipButton}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Text style={styles.skipButtonText}>Skip</Text>
                        <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Center Hero: Logo, Title & Value Badges */}
                <View style={styles.centerHero}>
                    {/* Animated Pulsing Outer Glow Ring */}
                    <Animated.View
                        style={[
                            styles.pulseRing,
                            {
                                transform: [{ scale: pulseAnim }],
                                opacity: pulseAnim.interpolate({
                                    inputRange: [1, 1.18],
                                    outputRange: [0.3, 0.06],
                                }),
                            },
                        ]}
                    />

                    {/* Elevated Logo Card */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <Image
                            source={LogoImg}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* Brand Titles */}
                    <Animated.View
                        style={[
                            styles.brandInfoBlock,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideUpAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.brandTitle}>
                            R<Text style={{ color: COLORS.primary }}>T</Text>R PARTNER
                        </Text>
                        <Text style={styles.brandSubtitle}>
                            Professional Driver On-Demand Service
                        </Text>

                        {/* Value Proposition Badges */}
                        <View style={styles.badgesRow}>
                            <View style={styles.featureBadge}>
                                <Ionicons name="flash-outline" size={12} color="#F59E0B" style={styles.badgeIcon} />
                                <Text style={styles.featureBadgeText}>Instant Duties</Text>
                            </View>

                            <View style={styles.featureBadge}>
                                <Ionicons name="wallet-outline" size={12} color="#10B981" style={styles.badgeIcon} />
                                <Text style={styles.featureBadgeText}>Fast Payouts</Text>
                            </View>

                            <View style={styles.featureBadge}>
                                <Ionicons name="shield-checkmark-outline" size={12} color="#3B82F6" style={styles.badgeIcon} />
                                <Text style={styles.featureBadgeText}>Verified Partner</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* Bottom Section: Progress Bar, Action Button & Footer */}
                <Animated.View
                    style={[
                        styles.bottomSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideUpAnim }],
                        },
                    ]}
                >
                    {/* Animated Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <Animated.View
                                style={[
                                    styles.progressBar,
                                    { width: progressWidth },
                                ]}
                            />
                        </View>
                        <View style={styles.progressMetaRow}>
                            <Text style={styles.progressLabel}>
                                Initializing secure driver workspace...
                            </Text>
                            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                        </View>
                    </View>

                    {/* Primary "Get Started" Action Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleProceed}
                        style={styles.actionButton}
                    >
                        <Text style={styles.actionButtonText}>Get Started</Text>
                        <View style={styles.actionButtonIconCircle}>
                            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    {/* App Version & Trust Marker */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>
                            v1.0.0 • Drive4U Partner Network
                        </Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#070B14",
    },
    bgImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        opacity: 0.16,
    },
    bgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(7, 11, 20, 0.88)",
    },
    ambientGlowPrimary: {
        position: "absolute",
        top: "22%",
        alignSelf: "center",
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: (width * 0.9) / 2,
        backgroundColor: "rgba(224, 33, 31, 0.15)",
    },
    ambientGlowSecondary: {
        position: "absolute",
        bottom: 80,
        alignSelf: "center",
        width: width * 0.75,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(30, 41, 59, 0.4)",
    },
    safeArea: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) + 10 : 12,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 22,
        zIndex: 10,
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#10B981",
        marginRight: 7,
    },
    statusPillText: {
        color: "#E2E8F0",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
    },
    skipButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    skipButtonText: {
        color: "#F1F5F9",
        fontSize: 12,
        fontWeight: "600",
        marginRight: 3,
    },
    centerHero: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        position: "relative",
    },
    pulseRing: {
        position: "absolute",
        top: -14,
        width: 136,
        height: 136,
        borderRadius: 68,
        backgroundColor: COLORS.primary,
        zIndex: 1,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.3)",
        zIndex: 2,
        marginBottom: 20,
    },
    logoImage: {
        width: "100%",
        height: "100%",
        borderRadius: 18,
    },
    brandInfoBlock: {
        alignItems: "center",
        zIndex: 2,
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 1.2,
        textAlign: "center",
    },
    brandSubtitle: {
        fontSize: 13,
        fontWeight: "500",
        color: "#94A3B8",
        marginTop: 6,
        textAlign: "center",
        letterSpacing: 0.3,
    },
    badgesRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 22,
    },
    featureBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    badgeIcon: {
        marginRight: 5,
    },
    featureBadgeText: {
        color: "#CBD5E1",
        fontSize: 11,
        fontWeight: "600",
    },
    bottomSection: {
        paddingHorizontal: 24,
        width: "100%",
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressTrack: {
        height: 4,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    progressMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    progressLabel: {
        color: "#64748B",
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.3,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderRadius: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 16,
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.5,
        marginRight: 8,
    },
    actionButtonIconCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    footerRow: {
        alignItems: "center",
        justifyContent: "center",
    },
    footerText: {
        color: "#64748B",
        fontSize: 11,
        fontWeight: "500",
        letterSpacing: 0.4,
    },
});

export default SplashScreen;