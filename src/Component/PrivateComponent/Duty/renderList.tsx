import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal
} from 'react-native';

const RenderList = ({ item }: any) => {
    const [detailModal, setDetailModal] = useState<boolean>(false);

    const formatDateTime = (dateTime: any, includeTime = true) => {
        if (!dateTime) return "";
        const parsedDate = new Date(dateTime);
        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            ...(includeTime && {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
        });
    };

    const handleAccept = () => {
       
    };

    return (
        <TouchableOpacity style={{ width: '100%', padding: 10, flexDirection: 'row', backgroundColor: '#fff', shadowColor: 'black', elevation: 5, borderWidth: 0.5, borderRadius: 10, height: 100 }}>
            <View style={{ width: '70%' }}>
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Trip Date</Text>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 14, width: '70%', }}>: {formatDateTime(item.startDate)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Name</Text>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 14, width: '70%', }}>: {item.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Trip Fair</Text>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: 500 {'\u20B9'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Trip Mode</Text>
                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '100%', }}>: {item.tripMode}</Text>
                    </View>
                </View>
            </View>

            <View style={{ width: '30%', height: '100%' }}>
                <TouchableOpacity onPress={() => setDetailModal(true)} style={{ backgroundColor: 'fff', shadowColor: 'black', elevation: 1, borderWidth: 0.5, width: '80%', height: '40%', justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                    <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '100%', textAlign: 'center' }}>Trip Details</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleAccept} style={{ backgroundColor: 'fff', shadowColor: 'black', elevation: 1, borderWidth: 0.5, width: '80%', height: '40%', justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginTop: 10 }}>
                    <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '100%', textAlign: 'center' }}>Accept</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                visible={detailModal}
                onRequestClose={() => setDetailModal(false)}
            >
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '80%', height: '80%', backgroundColor: 'white', borderRadius: 20 }}>
                        <View style={{ width: '100%' }}>
                            <TouchableOpacity onPress={() => setDetailModal(false)} style={{ marginLeft: '90%', marginTop: '5%' }}>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 18 }}>X</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ width: '100%', padding: 20 }}>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Name</Text>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: {item.name}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Address</Text>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: {item.address}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Start Data</Text>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: {formatDateTime(item.startDate)}</Text>
                            </View>

                            {
                                item.endDate !== null && (
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>End Data</Text>
                                        <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: {formatDateTime(item.endDate)}</Text>
                                    </View>
                                )
                            }

                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Hours</Text>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: {item.hours}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '30%' }}>Trip Mode</Text>
                                <Text style={{ fontWeight: '600', color: 'black', fontSize: 16, width: '70%', }}>: {item.tripMode}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </TouchableOpacity>
    );
};

export default RenderList;