import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Platform,
    Modal,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { COLORS } from "../../utils/ColorCode";
import { showError } from "../ToastMessage";

interface ForceUpdateProps {
    latestVersion?: string;
}

const ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.driveforu";

const IOS_STORE_URL =
    "https://apps.apple.com/app/YOUR_APP_ID";

const compareVersions = (
    current: string,
    latest: string
) => {
    const currentParts = current.split(".").map(Number);
    const latestParts = latest.split(".").map(Number);

    const length = Math.max(
        currentParts.length,
        latestParts.length
    );

    for (let i = 0; i < length; i++) {
        const currentValue = currentParts[i] || 0;
        const latestValue = latestParts[i] || 0;

        if (currentValue < latestValue) {
            return -1;
        }

        if (currentValue > latestValue) {
            return 1;
        }
    }

    return 0;
};

const ForceUpdate = ({
    latestVersion,
}: ForceUpdateProps) => {
    const [forceUpdate, setForceUpdate] = useState(false);

    const currentVersion = DeviceInfo.getVersion();

    useEffect(() => {
        if (!latestVersion) {
            setForceUpdate(false);
            return;
        }

        const isOldVersion = compareVersions( currentVersion, latestVersion ) < 0;
        setForceUpdate(isOldVersion);
    }, [latestVersion, currentVersion]);

    const openStore = async () => {
        const storeUrl =
            Platform.OS === "android"
                ? ANDROID_STORE_URL
                : IOS_STORE_URL;

        try {
            await Linking.openURL(storeUrl);
        } catch (error) {
            showError(error);
        }
    };

    return (
        <Modal
            visible={forceUpdate}
            transparent={false}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={() => {
                // Do nothing.
                // Prevent Android back button from closing force update.
            }}
        >
            <View style={styles.container}>
                <View style={styles.card}>

                    <Text style={styles.icon}>
                        🚀
                    </Text>

                    <Text style={styles.title}>
                        Update Required
                    </Text>

                    <Text style={styles.message}>
                        A new version of the app is available.
                        {"\n\n"}
                        Please update the app to continue
                        using it.
                    </Text>

                    <Text style={styles.version}>
                        Current Version: {currentVersion}
                    </Text>

                    <Text style={styles.version}>
                        Latest Version: {latestVersion}
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={openStore}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            Update Now
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default ForceUpdate;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    card: {
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },

    icon: {
        fontSize: 55,
        marginBottom: 20,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111",
        marginBottom: 15,
        textAlign: "center",
    },

    message: {
        fontSize: 16,
        lineHeight: 24,
        color: "#666",
        textAlign: "center",
        marginBottom: 25,
    },

    version: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },

    button: {
        width: "100%",
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },

    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
});