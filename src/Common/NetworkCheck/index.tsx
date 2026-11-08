import React, { useEffect, useState, useRef } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../utils/ColorCode";
import { showError, showSuccess } from "../ToastMessage";
import { networkManager } from "./networkManager";

const { width } = Dimensions.get("window");

interface NetworkCheckProps {
    onRetry?: () => void;
}

const NetworkCheck: React.FC<NetworkCheckProps> = ({ onRetry }) => {
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const hadOfflineRef = useRef<boolean>(false);

    useEffect(() => {
        const unsubscribe = networkManager.subscribe((offline) => {
            if (offline) {
                hadOfflineRef.current = true;
                setIsOffline(true);
            } else {
                if (hadOfflineRef.current) {
                    showSuccess("Internet connection restored");
                    hadOfflineRef.current = false;
                }
                setIsOffline(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleRetry = async () => {
        if (isChecking) return;
        setIsChecking(true);

        try {
            const isConnected = await networkManager.checkConnectivity();

            if (isConnected) {
                setIsOffline(false);
                hadOfflineRef.current = false;
                showSuccess("Internet connection restored");
                if (onRetry) {
                    onRetry();
                }
            } else {
                showError("Still offline. Please check your network settings.");
            }
        } catch {
            showError("Unable to connect. Please check your internet connection.");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <Modal
            visible={isOffline}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={() => {
                // Prevent dismiss via back button when there is no internet
                handleRetry();
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    {/* Icon Container */}
                    <View style={styles.iconCircle}>
                        <MaterialIcons
                            name="wifi-off"
                            size={44}
                            color={COLORS.primary}
                        />
                    </View>

                    {/* Status Badge */}
                    <View style={styles.badgeContainer}>
                        <View style={styles.badgeDot} />
                        <Text style={styles.badgeText}>OFFLINE</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>No Internet Connection</Text>

                    {/* Subtitle / Description */}
                    <Text style={styles.description}>
                        Please check your network settings and make sure Wi-Fi or mobile data is turned on, then try again.
                    </Text>

                    {/* Retry Button */}
                    <TouchableOpacity
                        style={[
                            styles.retryButton,
                            isChecking && styles.retryButtonDisabled,
                        ]}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                        disabled={isChecking}
                    >
                        {isChecking ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator
                                    size="small"
                                    color={COLORS.white}
                                    style={styles.spinner}
                                />
                                <Text style={styles.retryButtonText}>
                                    Checking Connection...
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <MaterialIcons
                                    name="refresh"
                                    size={20}
                                    color={COLORS.white}
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.retryButtonText}>
                                    Try Again
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default NetworkCheck;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        width: Math.min(width - 48, 380),
        backgroundColor: COLORS.white,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 26,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    badgeContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 14,
    },
    badgeDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: COLORS.primary,
        marginRight: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primary,
        letterSpacing: 0.8,
    },
    title: {
        fontSize: 21,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 10,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        color: "#64748B",
        textAlign: "center",
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    retryButton: {
        width: "100%",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    retryButtonDisabled: {
        opacity: 0.75,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonIcon: {
        marginRight: 8,
    },
    spinner: {
        marginRight: 8,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
    },
});

