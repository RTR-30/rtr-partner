import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";

// Define the type for the item
interface TripItem {
    name: string;
    address: string;
    startDate: string;
    endDate?: string | null;
    hours: number;
    tripMode: string;
}

// Placeholder for date formatting function
const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(); // Format as needed
};

const TripDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item }: { item: TripItem } = route.params || { item: {} as TripItem };

    return (
        <View style={{ width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: "80%", backgroundColor: "white", borderRadius: 20 }}>
                <View style={{ width: "100%", height: '15%', padding: 10, backgroundColor: '#5a639c', borderTopLeftRadius: 20, borderTopRightRadius: 20, justifyContent: 'space-between', flexDirection: 'row' }}>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{ fontWeight: "700", color: "white", fontSize: 18 }}>Trip Details</Text>
                    </View>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10, justifyContent: 'center' }}>
                        <Text style={{ fontWeight: "700", color: "white", fontSize: 18 }}>X</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ width: "100%", padding: 20 }}>
                    <Text style={{ textAlign: 'center', fontWeight: '600' }}>Amount : <Text style={{ color: 'green' }}>{'\u20B9'}500</Text></Text>

                    <DetailRow label="Name" value={item.name} />
                    <DetailRow label="Address" value={item.address} />
                    <DetailRow label="Start Date" value={formatDateTime(item.startDate)} />
                    {item.endDate && <DetailRow label="End Date" value={formatDateTime(item.endDate)} />}
                    <DetailRow label="Hours" value={String(item.hours)} />
                    <DetailRow label="Trip Mode" value={item.tripMode} />
                </View>

                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ width: '40%', backgroundColor: '#5a639c', height: 30, justifyContent: 'center', alignItems: 'center', top: '20%', borderRadius: 10 }}>
                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// Reusable component for each row of details
const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={{ flexDirection: "row", marginTop: 10 }}>
        <Text style={{ fontWeight: "600", color: "#D2649A", fontSize: 16, width: "30%" }}>{label}</Text>
        <Text style={{ fontWeight: "600", color: "black", fontSize: 16, width: "70%" }}>:  {value}</Text>
    </View>
);

export default TripDetails;
