import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Image,
    ScrollView,
    SafeAreaView,
    TextInput,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from "react-native";
import PaymentRender from "./PaymentRender";
import { showError, showSuccess } from "../ToastMessage";
import { PaymentProcessService, PurchacePackageService } from "./helper";
import { COLORS } from "../../utils/ColorCode";
import { CFErrorResponse, CFPaymentGatewayService } from "react-native-cashfree-pg-sdk";
import { openCashfreePayment } from "../../utils/secureFile";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getUserDetailsService } from "../../Component/PrivateComponent/Home/helper";
import Loader from "../Loader";

const Logo = require(`../../../assets/Imgs/Logo.png`);

const PackagePurchase = () => {
    const navigation: any = useNavigation();
    const [loader, setLoader] = useState<boolean>(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<any>("");
    const [selectPaymentData, setSelectPaymentData] = useState<any>(null);
    const [openPayment, setOpenPayment] = useState<boolean>(false);

    const [checkWallet, setCheckWallet] = useState<boolean>(false);
    const [totalWallet, setTotalWallet] = useState<any>(0);
    const [walletAmount, setWalletAmount] = useState<any>("");

    let descriptionList: string[] = [];

    if (Array.isArray(selectPaymentData?.description)) {
        descriptionList = selectPaymentData.description;
    } else if (typeof selectPaymentData?.description === "string") {
        try {
            const parsed = JSON.parse(selectPaymentData.description);
            if (Array.isArray(parsed)) {
                descriptionList = parsed;
            } else {
                descriptionList = [selectPaymentData.description];
            }
        } catch (error) {
            descriptionList = [selectPaymentData.description];
        }
    }

    // Filter out empty descriptions
    descriptionList = descriptionList.filter(
        (item) => item && typeof item === "string" && item.trim().length > 0
    );

    const fetchUserDetails = async () => {
        try {
            const res = await getUserDetailsService();
            const { data: { success = false, user = {} } } = res;

            if (success === true) {
                setTotalWallet(user?.wallet_balance ?? 0);
            }
        } catch (error) {
            console.log("Error fetching user details:", error);
        }
    };

    const PaymentProcess = async () => {
        setLoader(true);
        try {
            const res = await PaymentProcessService();
            const { data: { data = [], success = false } } = res;
            if (success === true) {
                setPackages(data);
                if (data.length > 0 && !selectedPaymentId) {
                    setSelectedPaymentId(data[0].id);
                    setSelectPaymentData(data[0]);
                }
            } else {
                showError("Unable to load packages");
            }
        } catch (error) {
            showError("Failed to fetch packages");
        } finally {
            setLoader(false);
        }
    };

    const closePackage = () => {
        navigation.goBack();
    };

    const handleClosePayment = () => {
        setOpenPayment(false);
    };

    const openWallet = () => {
        const walletBal = Number(totalWallet || 0);
        const pkgPrice = Number(selectPaymentData?.amount || 0);

        if (walletBal <= 0) {
            showError("Wallet balance is empty");
            return;
        }

        // Auto-fill with the maximum usable balance (up to package price)
        const autoFill = Math.min(walletBal, pkgPrice);
        setWalletAmount(String(autoFill));
        setCheckWallet(true);
    };

    const closeWallet = () => {
        setWalletAmount("");
        setCheckWallet(false);
    };

    const applyMaxWallet = () => {
        const walletBal = Number(totalWallet || 0);
        const pkgPrice = Number(selectPaymentData?.amount || 0);
        const maxUse = Math.min(walletBal, pkgPrice);
        setWalletAmount(String(maxUse));
    };

    const purchacePackage = async (id: any, useWallet: boolean) => {
        setLoader(true);
        const packagePrice = Number(selectPaymentData?.amount || 0);
        const enteredWalletAmount = Number(walletAmount || 0);

        const payload = {
            packageId: id,
            walletAmountToUse: useWallet ? enteredWalletAmount : 0,
        };

        try {
            const res = await PurchacePackageService(payload);
            const {
                data: {
                    success = false,
                    message = "",
                    link_id = "",
                    payment_link = "",
                    qr_code = "",
                    order_id = "",
                    session_id = "",
                },
            } = res;

            if (success === true) {
                if (useWallet && packagePrice === enteredWalletAmount) {
                    showSuccess("Package activated successfully!");
                    handleClosePayment();
                    closePackage();
                } else {
                    await openCashfreePayment(order_id, session_id);
                }
            } else {
                showError(message || "Purchase failed");
            }
        } catch (error) {
            showError("Failed to initiate package purchase");
        } finally {
            setLoader(false);
        }
    };

    const purchaseCondition = () => {
        const packagePrice = Number(selectPaymentData?.amount || 0);
        const walletBalance = Number(totalWallet || 0);
        const enteredWalletAmount = Number(walletAmount || 0);

        if (!selectPaymentData?.id) {
            showError("Please select a package");
            return;
        }

        if (!walletAmount || enteredWalletAmount <= 0) {
            showError("Please enter wallet amount");
            return;
        }

        if (enteredWalletAmount > walletBalance) {
            showError("Wallet amount cannot exceed your wallet balance");
            return;
        }

        if (enteredWalletAmount > packagePrice) {
            showError("Wallet amount cannot exceed package price");
            return;
        }

        // Valid wallet payment
        purchacePackage(selectPaymentData.id, true);
    };

    useEffect(() => {
        const initializeCashfree = async () => {
            try {
                CFPaymentGatewayService.setCallback({
                    onVerify: async () => {
                        showSuccess("Payment verified successfully!");
                        handleClosePayment();
                        closePackage();
                    },

                    onError: (error: CFErrorResponse, orderID: string) => {
                        setLoader(false);
                        showError("Payment failed or cancelled");
                    },
                });
            } catch (error) {
                showError(error);
            }
        };

        initializeCashfree();

        return () => {
            CFPaymentGatewayService.removeCallback();
        };
    }, []);

    useEffect(() => {
        fetchUserDetails();
        PaymentProcess();
    }, []);

    const packagePrice = Number(selectPaymentData?.amount || 0);
    const enteredWallet = checkWallet ? Number(walletAmount || 0) : 0;
    const netPayable = Math.max(0, packagePrice - enteredWallet);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Top Navigation Bar */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    onPress={closePackage}
                    style={styles.backBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Duty Packages</Text>
                    <Text style={styles.headerSubtitle}>Official Driver Subscription</Text>
                </View>

                <View style={styles.headerRightBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                    <Text style={styles.headerBadgeText}>Verified</Text>
                </View>
            </View>

            {/* Main Content Area */}
            <View style={styles.bodyWrapper}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Hero Subscription Card */}
                    <View style={styles.heroCard}>
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroTextContainer}>
                                <View style={styles.proTag}>
                                    <Ionicons name="flash" size={12} color="#FFF" />
                                    <Text style={styles.proTagText}>RTR PARTNER PRO</Text>
                                </View>
                                <Text style={styles.heroTitle}>Unlock Duty Requests</Text>
                                <Text style={styles.heroDesc}>
                                    Subscribe to receive customer bookings and earn unlimited daily trips.
                                </Text>
                            </View>

                            <Image
                                source={Logo}
                                style={styles.heroLogo}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Partner Wallet Pill */}
                        <View style={styles.walletBar}>
                            <View style={styles.walletBarLeft}>
                                <View style={styles.walletIconCircle}>
                                    <Ionicons name="wallet" size={16} color={COLORS.primary} />
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.walletBarLabel}>Wallet Balance</Text>
                                    <Text style={styles.walletBarValue}>₹{totalWallet || 0}</Text>
                                </View>
                            </View>

                            {Number(totalWallet || 0) > 0 ? (
                                <View style={styles.walletBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color="#059669" />
                                    <Text style={styles.walletBadgeText}>Redeemable</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Plans Section Header */}
                    <View style={styles.sectionHeaderRow}>
                        <View>
                            <Text style={styles.sectionTitle}>Select Your Plan</Text>
                            <Text style={styles.sectionSubtitle}>
                                Choose the validity period that fits your schedule
                            </Text>
                        </View>
                        {packages.length > 0 && (
                            <View style={styles.planCountBadge}>
                                <Text style={styles.planCountText}>
                                    {packages.length} {packages.length === 1 ? "Plan" : "Plans"}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Plans Grid */}
                    {packages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.emptyText}>Loading available packages...</Text>
                        </View>
                    ) : (
                        <View style={styles.plansGrid}>
                            {packages.map((item, index) => (
                                <PaymentRender
                                    key={String(item?.id ?? index)}
                                    item={item}
                                    selectedPaymentId={selectedPaymentId}
                                    setSelectedPaymentId={setSelectedPaymentId}
                                    setSelectPaymentData={setSelectPaymentData}
                                />
                            ))}
                        </View>
                    )}

                    {/* Benefits Section */}
                    <View style={styles.benefitsContainer}>
                        <View style={styles.benefitsHeader}>
                            <View style={styles.benefitsHeaderLeft}>
                                <View style={styles.sparkleCircle}>
                                    <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                                </View>
                                <Text style={styles.benefitsTitle}>Plan Benefits & Inclusions</Text>
                            </View>
                            {selectPaymentData?.name ? (
                                <View style={styles.activePlanChip}>
                                    <Text style={styles.activePlanChipText} numberOfLines={1}>
                                        {selectPaymentData.name}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Feature List */}
                        <View style={styles.benefitsCard}>
                            {descriptionList.length > 0 ? (
                                descriptionList.map((description, index) => (
                                    <View key={index} style={styles.featureRow}>
                                        <View style={styles.checkCircle}>
                                            <Ionicons name="checkmark" size={12} color="#059669" />
                                        </View>
                                        <Text style={styles.featureText}>{description.trim()}</Text>
                                    </View>
                                ))
                            ) : (
                                <>
                                    <View style={styles.featureRow}>
                                        <View style={styles.checkCircle}>
                                            <Ionicons name="checkmark" size={12} color="#059669" />
                                        </View>
                                        <Text style={styles.featureText}>
                                            Immediate access to customer duty notifications
                                        </Text>
                                    </View>
                                    <View style={styles.featureRow}>
                                        <View style={styles.checkCircle}>
                                            <Ionicons name="checkmark" size={12} color="#059669" />
                                        </View>
                                        <Text style={styles.featureText}>
                                            Priority duty allocation in your preferred areas
                                        </Text>
                                    </View>
                                    <View style={styles.featureRow}>
                                        <View style={styles.checkCircle}>
                                            <Ionicons name="checkmark" size={12} color="#059669" />
                                        </View>
                                        <Text style={styles.featureText}>
                                            Zero commission on duties during plan validity
                                        </Text>
                                    </View>
                                    <View style={styles.featureRow}>
                                        <View style={styles.checkCircle}>
                                            <Ionicons name="checkmark" size={12} color="#059669" />
                                        </View>
                                        <Text style={styles.featureText}>
                                            24/7 dedicated RTR Partner Helpdesk support
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Trust Badges */}
                    <View style={styles.trustRow}>
                        <View style={styles.trustItem}>
                            <Ionicons name="flash-outline" size={16} color="#4B5563" />
                            <Text style={styles.trustText}>Instant Activation</Text>
                        </View>
                        <Text style={styles.trustDot}>•</Text>
                        <View style={styles.trustItem}>
                            <Ionicons name="lock-closed-outline" size={16} color="#4B5563" />
                            <Text style={styles.trustText}>100% Secure Checkout</Text>
                        </View>
                        <Text style={styles.trustDot}>•</Text>
                        <View style={styles.trustItem}>
                            <Ionicons name="headset-outline" size={16} color="#4B5563" />
                            <Text style={styles.trustText}>Driver Support</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Sticky Bottom Checkout Footer */}
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarLeft}>
                        <Text style={styles.bottomBarLabel}>Selected Plan</Text>
                        <View style={styles.bottomPriceRow}>
                            <Text style={styles.bottomCurrency}>₹</Text>
                            <Text style={styles.bottomPrice}>{packagePrice}</Text>
                        </View>
                        <Text style={styles.bottomPlanSub} numberOfLines={1}>
                            {selectPaymentData?.name || "Choose a plan"}
                            {selectPaymentData?.validity_days
                                ? ` • ${selectPaymentData.validity_days} Days`
                                : ""}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => setOpenPayment(true)}
                        style={[
                            styles.purchaseBtn,
                            !selectPaymentData?.id && styles.purchaseBtnDisabled,
                        ]}
                        disabled={!selectPaymentData?.id}
                    >
                        <Text style={styles.purchaseBtnText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Purchase Bottom Sheet Modal */}
            <Modal
                visible={openPayment}
                transparent={true}
                animationType="slide"
                onRequestClose={handleClosePayment}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdropTap}
                        activeOpacity={1}
                        onPress={handleClosePayment}
                    />

                    <View style={styles.sheetContainer}>
                        {/* Drag Handle */}
                        <View style={styles.dragPill} />

                        {/* Modal Header */}
                        <View style={styles.sheetHeader}>
                            <View>
                                <Text style={styles.sheetTitle}>Confirm Subscription</Text>
                                <Text style={styles.sheetSubtitle}>Review your order summary</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleClosePayment}
                                style={styles.closeBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={22} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Order Summary Card */}
                        <View style={styles.orderSummaryCard}>
                            <View style={styles.summaryTop}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.summaryPlanName}>
                                        {selectPaymentData?.name || "Subscription Plan"}
                                    </Text>
                                    <View style={styles.summaryValidityRow}>
                                        <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                                        <Text style={styles.summaryValidityText}>
                                            {selectPaymentData?.validity_days
                                                ? `${selectPaymentData.validity_days} Days Validity`
                                                : "Active Validity"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.summaryPriceBox}>
                                    <Text style={styles.summaryPriceText}>₹{packagePrice}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Wallet Deduction Section */}
                        <View style={styles.walletSectionCard}>
                            <View style={styles.walletHeaderRow}>
                                <View style={styles.walletTitleGroup}>
                                    <View style={styles.walletIconMini}>
                                        <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
                                    </View>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={styles.walletSectionTitle}>Use Partner Wallet</Text>
                                        <Text style={styles.walletAvailText}>
                                            Available: ₹{totalWallet || 0}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => (checkWallet ? closeWallet() : openWallet())}
                                    style={styles.checkboxTouchable}
                                >
                                    <Ionicons
                                        name={checkWallet ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={checkWallet ? COLORS.primary : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            </View>

                            {checkWallet ? (
                                <View style={styles.walletInputWrapper}>
                                    <View style={styles.walletQuickRow}>
                                        <Text style={styles.walletInputLabel}>
                                            Enter amount to deduct:
                                        </Text>
                                        <TouchableOpacity
                                            onPress={applyMaxWallet}
                                            style={styles.maxBtn}
                                        >
                                            <Text style={styles.maxBtnText}>Use Max</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputPrefix}>₹</Text>
                                        <TextInput
                                            value={String(walletAmount)}
                                            onChangeText={(text) => {
                                                const numericValue = text.replace(/[^0-9]/g, "");
                                                setWalletAmount(numericValue);
                                            }}
                                            placeholder="Enter wallet amount"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            style={styles.walletTextInput}
                                        />
                                    </View>

                                    {Number(walletAmount || 0) > Number(totalWallet || 0) && (
                                        <Text style={styles.walletErrorText}>
                                            Exceeds available wallet balance (₹{totalWallet})
                                        </Text>
                                    )}

                                    {Number(walletAmount || 0) > packagePrice && (
                                        <Text style={styles.walletErrorText}>
                                            Exceeds total package price (₹{packagePrice})
                                        </Text>
                                    )}
                                </View>
                            ) : null}
                        </View>

                        {/* Bill Breakdown */}
                        <View style={styles.billCard}>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Package Price</Text>
                                <Text style={styles.billValue}>₹{packagePrice}</Text>
                            </View>

                            {checkWallet && enteredWallet > 0 ? (
                                <View style={styles.billRow}>
                                    <Text style={[styles.billLabel, { color: "#059669" }]}>
                                        Wallet Deduction
                                    </Text>
                                    <Text style={[styles.billValue, { color: "#059669" }]}>
                                        - ₹{enteredWallet}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={styles.billDivider} />

                            <View style={styles.billRowTotal}>
                                <Text style={styles.billTotalLabel}>
                                    {netPayable === 0 ? "Total Deducted" : "Net Payable Online"}
                                </Text>
                                <Text style={styles.billTotalValue}>
                                    ₹{netPayable === 0 ? packagePrice : netPayable}
                                </Text>
                            </View>
                        </View>

                        {/* Payment Actions */}
                        <View style={styles.modalActionButtons}>
                            {checkWallet ? (
                                <TouchableOpacity
                                    activeOpacity={0.88}
                                    onPress={purchaseCondition}
                                    style={styles.payBtn}
                                >
                                    <Ionicons
                                        name={
                                            enteredWallet === packagePrice
                                                ? "checkmark-circle-outline"
                                                : "card-outline"
                                        }
                                        size={20}
                                        color="#FFF"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.payBtnText}>
                                        {enteredWallet === packagePrice
                                            ? `Confirm with Wallet (₹${packagePrice})`
                                            : `Pay ₹${netPayable} via Gateway`}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    activeOpacity={0.88}
                                    onPress={() => purchacePackage(selectPaymentData?.id, false)}
                                    style={styles.payBtn}
                                >
                                    <Ionicons
                                        name="shield-checkmark-outline"
                                        size={20}
                                        color="#FFF"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.payBtnText}>
                                        Pay ₹{packagePrice} Now
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleClosePayment}
                                style={styles.cancelBtn}
                            >
                                <Text style={styles.cancelBtnText}>Back to Plans</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Security Footer inside Modal */}
                        <View style={styles.modalSecureNotice}>
                            <Ionicons name="lock-closed" size={13} color="#9CA3AF" />
                            <Text style={styles.modalSecureText}>
                                256-Bit SSL Encrypted • Powered by Cashfree Payments
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Global Loader Overlay */}
            {loader && (
                <View style={styles.loaderContainer}>
                    <Loader />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    headerBar: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        backgroundColor: COLORS.primary,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 11,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "500",
        marginTop: 1,
    },
    headerRightBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FFF",
        marginLeft: 4,
    },
    bodyWrapper: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 110,
    },
    heroCard: {
        backgroundColor: "#1E293B",
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    heroTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    heroTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    proTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 8,
    },
    proTagText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#FFF",
        marginLeft: 4,
        letterSpacing: 0.6,
    },
    heroTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    heroDesc: {
        fontSize: 12,
        color: "#94A3B8",
        lineHeight: 17,
    },
    heroLogo: {
        width: 80,
        height: 60,
    },
    walletBar: {
        marginTop: 14,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    walletBarLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    walletIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
    },
    walletBarLabel: {
        fontSize: 11,
        color: "#CBD5E1",
        fontWeight: "500",
    },
    walletBarValue: {
        fontSize: 15,
        color: "#FFFFFF",
        fontWeight: "800",
    },
    walletBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(16, 185, 129, 0.18)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    walletBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#34D399",
        marginLeft: 4,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
    },
    sectionSubtitle: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 2,
    },
    planCountBadge: {
        backgroundColor: "#E5E7EB",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    planCountText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#374151",
    },
    plansGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    emptyContainer: {
        padding: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 8,
    },
    benefitsContainer: {
        marginTop: 10,
        marginBottom: 16,
    },
    benefitsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    benefitsHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    sparkleCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(224, 33, 31, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    benefitsTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },
    activePlanChip: {
        backgroundColor: "rgba(224, 33, 31, 0.08)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        maxWidth: 120,
    },
    activePlanChipText: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.primary,
    },
    benefitsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    checkCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
        marginRight: 10,
    },
    featureText: {
        flex: 1,
        fontSize: 13,
        color: "#374151",
        lineHeight: 18,
        fontWeight: "500",
    },
    trustRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    trustItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    trustText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6B7280",
        marginLeft: 4,
    },
    trustDot: {
        marginHorizontal: 8,
        color: "#9CA3AF",
        fontSize: 12,
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 28 : 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    bottomBarLeft: {
        flex: 1,
        paddingRight: 12,
    },
    bottomBarLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#9CA3AF",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    bottomPriceRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    bottomCurrency: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginRight: 2,
    },
    bottomPrice: {
        fontSize: 22,
        fontWeight: "900",
        color: "#111827",
    },
    bottomPlanSub: {
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "500",
        marginTop: 1,
    },
    purchaseBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 14,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    purchaseBtnDisabled: {
        backgroundColor: "#D1D5DB",
        elevation: 0,
        shadowOpacity: 0,
    },
    purchaseBtnText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFFFFF",
        marginRight: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        justifyContent: "flex-end",
    },
    modalBackdropTap: {
        flex: 1,
    },
    sheetContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        elevation: 20,
    },
    dragPill: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D1D5DB",
        alignSelf: "center",
        marginBottom: 14,
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#111827",
    },
    sheetSubtitle: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 2,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    orderSummaryCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 14,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryPlanName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    summaryValidityRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    summaryValidityText: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 4,
        fontWeight: "500",
    },
    summaryPriceBox: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    summaryPriceText: {
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.primary,
    },
    walletSectionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        marginBottom: 14,
    },
    walletHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    walletTitleGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    walletIconMini: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(224, 33, 31, 0.08)",
        justifyContent: "center",
        alignItems: "center",
    },
    walletSectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    walletAvailText: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
        marginTop: 1,
    },
    checkboxTouchable: {
        padding: 4,
    },
    walletInputWrapper: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    walletQuickRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    walletInputLabel: {
        fontSize: 12,
        color: "#4B5563",
        fontWeight: "600",
    },
    maxBtn: {
        backgroundColor: "rgba(224, 33, 31, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    maxBtnText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primary,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
        backgroundColor: "#F9FAFB",
    },
    inputPrefix: {
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
        marginRight: 6,
    },
    walletTextInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
        paddingVertical: 0,
    },
    walletErrorText: {
        fontSize: 11,
        color: "#DC2626",
        fontWeight: "600",
        marginTop: 4,
    },
    billCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    billLabel: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    billValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    billDivider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 6,
    },
    billRowTotal: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    billTotalLabel: {
        fontSize: 14,
        fontWeight: "800",
        color: "#111827",
    },
    billTotalValue: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.primary,
    },
    modalActionButtons: {
        marginBottom: 10,
    },
    payBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 14,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        marginBottom: 10,
    },
    payBtnText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    cancelBtn: {
        paddingVertical: 10,
        alignItems: "center",
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#6B7280",
    },
    modalSecureNotice: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    modalSecureText: {
        fontSize: 11,
        color: "#9CA3AF",
        fontWeight: "500",
        marginLeft: 4,
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
    },
});

export default PackagePurchase;