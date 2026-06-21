import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";

const Header = ({
    value,
    backNavigate,
    edit,
    clickEdit
}: any) => {
    const navigation = useNavigation();

    const handleEdit = () => {
        clickEdit()
    }
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                    {
                        backNavigate && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="arrow-back" color={"white"} size={24} />
                            </TouchableOpacity>
                        )
                    }
                </View>

                <View style={{ width: '70%', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: 'white' }}>{value}</Text>
                </View>

                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                    {
                        edit && (
                            <TouchableOpacity onPress={handleEdit} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text className="text-white font-bold text-[18px]">Edit</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
        </View>
    )
}

export default Header;