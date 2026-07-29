import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import DatePicker from "react-native-date-picker";

interface Props {
    value: Date | null;
    placeholder?: string;
    onChange: (date: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
}

const DatePickers = ({
    value,
    placeholder = "Select Date",
    onChange,
    minimumDate,
    maximumDate,
}: Props) => {
    const [open, setOpen] = useState(false);

    const pickerDate =
        value ||
        maximumDate ||
        minimumDate ||
        new Date();

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="h-full w-full justify-center items-center"
            >
                <Text className="text-black font-bold text-[13px]">
                    {value
                        ? value.toLocaleDateString("en-GB")
                        : placeholder}
                </Text>
            </TouchableOpacity>

            <DatePicker
                modal
                open={open}
                date={pickerDate}
                mode="date"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onConfirm={(date) => {
                    setOpen(false);
                    onChange(date);
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />
        </>
    );
};

export default DatePickers;