import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../utils/ColorCode";

interface PaymentRenderProps {
    item: any;
    selectedPaymentId: any;
    setSelectedPaymentId: (id: any) => void;
    setSelectPaymentData: (item: any) => void;
}

const PaymentRender = ({
    item,
    selectedPaymentId,
    setSelectedPaymentId,
    setSelectPaymentData,
}: PaymentRenderProps) => {
    const isSelected = selectedPaymentId === item?.id;

    const handleSelect = () => {
        setSelectedPaymentId(item?.id);
        setSelectPaymentData(item);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSelect}
            style={[
                styles.card,
                isSelected ? styles.cardSelected : styles.cardUnselected,
            ]}
        >
            {/* Top Selection Indicator & Badge */}
            <View style={styles.topRow}>
                <View
                    style={[
                        styles.radioCircle,
                        isSelected ? styles.radioSelected : styles.radioUnselected,
                    ]}
                >
                    {isSelected ? (
                        <Ionicons name="checkmark" size={13} color="#FFF" />
                    ) : null}
                </View>

                {isSelected && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>SELECTED</Text>
                    </View>
                )}
            </View>

            {/* Plan Name */}
            <Text
                style={[
                    styles.planName,
                    isSelected ? styles.planNameSelected : styles.planNameUnselected,
                ]}
                numberOfLines={1}
            >
                {item?.name || "Duty Plan"}
            </Text>

            {/* Price */}
            <View style={styles.priceRow}>
                <Text
                    style={[
                        styles.currencySymbol,
                        { color: isSelected ? COLORS.primary : "#111827" },
                    ]}
                >
                    ₹
                </Text>
                <Text
                    style={[
                        styles.priceAmount,
                        { color: isSelected ? COLORS.primary : "#111827" },
                    ]}
                >
                    {item?.amount || 0}
                </Text>
            </View>

            {/* Validity Chip */}
            <View
                style={[
                    styles.validityChip,
                    {
                        backgroundColor: isSelected
                            ? "rgba(224, 33, 31, 0.08)"
                            : "#F3F4F6",
                    },
                ]}
            >
                <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={isSelected ? COLORS.primary : "#6B7280"}
                />
                <Text
                    style={[
                        styles.validityText,
                        { color: isSelected ? COLORS.primary : "#4B5563" },
                    ]}
                >
                    {item?.validity_days ? `${item.validity_days} Days` : "Active"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: "48%",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        justifyContent: "space-between",
        minHeight: 128,
    },
    cardSelected: {
        backgroundColor: "#FFFFFF",
        borderColor: COLORS.primary,
        borderWidth: 2,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 5,
    },
    cardUnselected: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        borderWidth: 1.5,
        elevation: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    radioSelected: {
        backgroundColor: COLORS.primary,
    },
    radioUnselected: {
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFF",
    },
    activeBadge: {
        backgroundColor: "rgba(224, 33, 31, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    planName: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },
    planNameSelected: {
        color: "#111827",
        fontWeight: "700",
    },
    planNameUnselected: {
        color: "#4B5563",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 8,
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: "700",
        marginRight: 2,
    },
    priceAmount: {
        fontSize: 22,
        fontWeight: "800",
    },
    validityChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    validityText: {
        fontSize: 11,
        fontWeight: "600",
        marginLeft: 4,
    },
});

export default PaymentRender;