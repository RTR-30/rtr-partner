import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../utils/ColorCode";
import AntDesign from "react-native-vector-icons/AntDesign";
import { showError, showSuccess } from "../ToastMessage";
import { FeedbackTagService, submitFeedbackService } from "./helper";

interface Props {
    visible: boolean;
    onClose: () => void;
    bookingdata: any;
    tokens: any;
}

const Feedback = ({ visible, onClose, bookingdata, tokens }: Props) => {
    const [feedbackTag, setFeedbackTag] = useState<any[]>([]);

    const [feedback, setFeedback] = useState<any>({
        bookingId: Number(bookingdata),
        rating: null,
        review: "",
        tags: [],
    });

    const handleRating = (rating: number) => {
        setFeedback((prev: any) => ({
            ...prev,
            rating,
        }));
    };

    const handleSubmit = async () => {
        if (feedback?.rating === null) {
            return showError("Give Rating")
        }
        const payload = {
            bookingId: feedback?.bookingId,
            rating: feedback?.rating,
            review: feedback?.review,
            tags: feedback?.tags
        }
        
        try {
            const res = await submitFeedbackService(payload, tokens);
            const { data: { success = false, message = "", data = {} } } = res;
            console.log(res?.data);

            if (success === true) {
                showSuccess(message);
                onClose()
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        }
    }

    const fetchFeedbackTages = async () => {
        try {
            const res = await FeedbackTagService(tokens)
            const { data: { success = false, message = "", data = [] } } = res;

            if (success === true) {
                setFeedbackTag(data);
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        }
    }

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

    useEffect(() => {
        fetchFeedbackTages()
    }, [])

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                className="flex-1 justify-center items-center"
            >
                <View className="bg-white w-[90%] rounded-3xl p-5 justify-center items-center">
                    <View className="mt-5">
                        <Text className="text-[16px] text-center font-bold" style={{ color: COLORS.primary }}>Please Provide Your Feedback</Text>
                    </View>

                    <View
                        className="mt-12 w-full"
                    >
                        <Text
                            className="text-[14px] font-semibold mb-2"
                            style={{ color: COLORS.primary }}
                        >
                            Ratings *
                        </Text>
                        <View className="flex-row mt-2 justify-center">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Pressable
                                    key={item}
                                    onPress={() => handleRating(item)}
                                    // style={{ marginHorizontal: 10 }}
                                    className="mx-3"
                                >
                                    <AntDesign
                                        name={item <= feedback.rating ? "heart" : "hearto"}
                                        size={36}
                                        color={item <= feedback.rating ? "#FF4D6D" : "#C4C4C4"}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View className="mt-5 justify-center items-center">
                        <View className="w-full mt-6">
                            <Text
                                className="text-[14px] font-semibold mb-2"
                                style={{ color: COLORS.primary }}
                            >
                                Review
                            </Text>

                            <TextInput
                                placeholder="Write your feedback..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                value={feedback.review}
                                onChangeText={(text) =>
                                    setFeedback((prev: any) => ({
                                        ...prev,
                                        review: text,
                                    }))
                                }
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#E5E5E5",
                                    borderRadius: 12,
                                    padding: 12,
                                    minHeight: 120,
                                    textAlignVertical: "top",
                                    color: "#000",
                                }}
                            />
                        </View>
                    </View>

                    <View className="w-full mt-5">
                        <Text
                            className="text-[14px] font-semibold mb-3"
                            style={{ color: COLORS.primary }}
                        >
                            Select Tags
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                            }}
                        >
                            {feedbackTag.map((item: any) => {
                                const selected = feedback.tags.includes(item.name);

                                return (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => handleTagSelect(item.name)}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            borderWidth: 1,
                                            borderColor: selected ? COLORS.primary : "#D9D9D9",
                                            backgroundColor: selected ? COLORS.primary : "#FFF",
                                            marginRight: 8,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: selected ? "#FFF" : "#000",
                                                fontSize: 13,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {item.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View className="mt-10 mb-10">
                            <View className="flex-row justify-around w-full">
                                <TouchableOpacity onPress={() => onClose()} className="w-[46%] p-2 justify-center items-center bg-[#FF9A00] rounded-md">
                                    <Text className="text-center text-[13px] font-bold text-white">Skip</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => handleSubmit()} className="w-[46%] p-2 justify-center items-center rounded-md" style={{ backgroundColor: COLORS.primary }}>
                                    <Text className="text-center text-[13px] font-bold text-white">Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default Feedback;