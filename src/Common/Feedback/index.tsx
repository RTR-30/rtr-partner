import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { COLORS } from "../../utils/ColorCode";
import Ionicons from "react-native-vector-icons/Ionicons";
import { showError, showSuccess } from "../ToastMessage";
import { FeedbackTagService, submitFeedbackService } from "./helper";

interface Props {
    visible: boolean;
    onClose: () => void;
    bookingdata: any;
}

const Feedback = ({ visible, onClose, bookingdata }: Props) => {
    const [feedbackTag, setFeedbackTag] = useState<any[]>([]);
    const [loadingTags, setLoadingTags] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const [feedback, setFeedback] = useState<any>({
        bookingId: Number(bookingdata),
        rating: null,
        review: "",
        tags: [],
    });

    // Reset and sync bookingId when modal opens or bookingdata changes
    useEffect(() => {
        if (visible) {
            setFeedback({
                bookingId: Number(bookingdata),
                rating: null,
                review: "",
                tags: [],
            });
            fetchFeedbackTags();
        }
    }, [visible, bookingdata]);

    const fetchFeedbackTags = async () => {
        setLoadingTags(true);
        try {
            const res = await FeedbackTagService();
            const { data: { success = false, message = "", data = [] } } = res;

            if (success === true && Array.isArray(data)) {
                setFeedbackTag(data);
            } else if (Array.isArray(data)) {
                setFeedbackTag(data);
            } else if (message) {
                showError(message);
            }
        } catch (error: any) {
            showError(error?.message || "Failed to load feedback tags");
        } finally {
            setLoadingTags(false);
        }
    };

    const handleRating = (rating: number) => {
        setFeedback((prev: any) => ({
            ...prev,
            rating,
        }));
    };

    const handleTagSelect = (name: string) => {
        setFeedback((prev: any) => {
            const exists = prev.tags.includes(name);
            return {
                ...prev,
                tags: exists
                    ? prev.tags.filter((tag: string) => tag !== name)
                    : [...prev.tags, name],
            };
        });
    };

    const handleSubmit = async () => {
        if (feedback?.rating === null || feedback?.rating === undefined) {
            return showError("Please select a star rating");
        }

        setSubmitting(true);
        const payload = {
            bookingId: feedback?.bookingId,
            rating: feedback?.rating,
            review: feedback?.review?.trim() || "",
            tags: feedback?.tags || [],
        };

        try {
            const res = await submitFeedbackService(payload);
            const { data: { success = false, message = "" } } = res;

            if (success === true) {
                showSuccess(message || "Thank you for your feedback!");
                onClose();
            } else {
                showError(message || "Failed to submit feedback");
            }
        } catch (error: any) {
            showError(error?.message || "Error submitting feedback");
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingLabel = () => {
        switch (feedback.rating) {
            case 1:
                return "Poor Experience";
            case 2:
                return "Below Average";
            case 3:
                return "Good Trip";
            case 4:
                return "Very Good";
            case 5:
                return "Excellent / 5 Stars!";
            default:
                return "Tap a star to rate";
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
                className="flex-1 justify-center items-center px-4"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="w-full items-center"
                >
                    <View
                        className="bg-white w-full rounded-2xl p-4"
                        style={styles.dialogCard}
                    >
                        {/* FIXED HEADER BAR */}
                        <View className="flex-row justify-between items-center pb-2.5 border-b border-gray-100 mb-2.5">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View className="w-8 h-8 rounded-xl bg-amber-50 justify-center items-center mr-2 border border-amber-100">
                                    <Ionicons name="star" size={16} color="#F59E0B" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-black text-gray-900">
                                        Trip Feedback
                                    </Text>
                                    <Text className="text-[10px] text-gray-400 font-medium">
                                        Booking #{bookingdata || "---"}
                                    </Text>
                                </View>
                            </View>

                            {/* Close Button */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onClose}
                                className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center"
                            >
                                <Ionicons name="close" size={16} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        {/* SCROLLABLE BODY CONTENT (Stars, Tags, Review) */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                            keyboardShouldPersistTaps="handled"
                            style={{ maxHeight: 330 }}
                        >
                            {/* Compact Rating Section */}
                            <View className="bg-slate-50 rounded-xl p-2.5 items-center border border-slate-100 mb-2.5">
                                <Text className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">
                                    Rate Customer & Trip
                                </Text>

                                {/* Star Buttons */}
                                <View className="flex-row justify-center items-center my-0.5">
                                    {[1, 2, 3, 4, 5].map((item) => {
                                        const isFilled = item <= (feedback.rating || 0);
                                        return (
                                            <Pressable
                                                key={item}
                                                onPress={() => handleRating(item)}
                                                className="mx-1 p-0.5"
                                                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                                            >
                                                <Ionicons
                                                    name={isFilled ? "star" : "star-outline"}
                                                    size={28}
                                                    color={isFilled ? "#F59E0B" : "#D1D5DB"}
                                                />
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                {/* Live Rating Descriptor */}
                                <Text
                                    className={`text-[11px] font-extrabold mt-0.5 ${
                                        feedback.rating ? "text-amber-600" : "text-gray-400"
                                    }`}
                                >
                                    {getRatingLabel()}
                                </Text>
                            </View>

                            {/* Quick Highlights Tags */}
                            {(loadingTags || feedbackTag.length > 0) && (
                                <View className="mb-2.5">
                                    <Text className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                                        Quick Highlights
                                    </Text>

                                    {loadingTags ? (
                                        <View className="flex-row items-center py-1">
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                            <Text className="text-[11px] text-gray-400 ml-2">Loading tags...</Text>
                                        </View>
                                    ) : (
                                        <View className="flex-row flex-wrap">
                                            {feedbackTag.map((item: any) => {
                                                const selected = feedback.tags.includes(item.name);
                                                return (
                                                    <Pressable
                                                        key={item.id || item.name}
                                                        onPress={() => handleTagSelect(item.name)}
                                                        className={`flex-row items-center px-2.5 py-1 rounded-full mr-1.5 mb-1.5 border ${
                                                            selected
                                                                ? "bg-red-50 border-red-300"
                                                                : "bg-gray-100 border-gray-200"
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <Ionicons
                                                                name="checkmark-circle"
                                                                size={12}
                                                                color={COLORS.primary}
                                                                style={{ marginRight: 3 }}
                                                            />
                                                        )}
                                                        <Text
                                                            className={`text-[11px] font-bold ${
                                                                selected
                                                                    ? "text-red-700"
                                                                    : "text-gray-700"
                                                            }`}
                                                        >
                                                            {item.name}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Review Note Section */}
                            <View className="mb-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                                        Comments (Optional)
                                    </Text>
                                    <Text className="text-[9px] text-gray-400">
                                        {feedback.review?.length || 0}/200
                                    </Text>
                                </View>

                                <TextInput
                                    placeholder="Write details about the trip or route..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    maxLength={200}
                                    numberOfLines={2}
                                    value={feedback.review}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onChangeText={(text) =>
                                        setFeedback((prev: any) => ({
                                            ...prev,
                                            review: text,
                                        }))
                                    }
                                    style={[
                                        styles.textInput,
                                        isFocused && { borderColor: COLORS.primary, backgroundColor: "#FFFFFF" },
                                    ]}
                                />
                            </View>
                        </ScrollView>

                        {/* FIXED FOOTER: Skip and Submit ALWAYS visible on first view */}
                        <View className="flex-row justify-between items-center pt-2.5 border-t border-gray-100 mt-2">
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onClose}
                                className="flex-1 py-2.5 bg-gray-100 rounded-xl mr-2 items-center justify-center"
                            >
                                <Text className="text-xs font-bold text-gray-600">
                                    Skip
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row shadow-sm"
                                style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                                ) : (
                                    <Ionicons
                                        name="paper-plane"
                                        size={13}
                                        color="#FFFFFF"
                                        style={{ marginRight: 5 }}
                                    />
                                )}
                                <Text className="text-xs font-extrabold text-white">
                                    {submitting ? "Submitting..." : "Submit"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default Feedback;

const styles = StyleSheet.create({
    dialogCard: {
        maxWidth: 360,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minHeight: 52,
        textAlignVertical: "top",
        color: "#1F2937",
        fontSize: 12,
        backgroundColor: "#F9FAFB",
    },
    submitButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
});