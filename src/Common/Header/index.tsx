import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";

const Header = ({value}:any) => {
    const navigation = useNavigation();
    return(
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <View style={{width:'100%', flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                {/* <TouchableOpacity onPress={()=>navigation.goBack()} style={{width:'15%', justifyContent:'center', alignItems:'center'}}>
                    <Ionicons name="arrow-back" color={"black"} size={24}/>
                </TouchableOpacity> */}

                <View style={{width:'70%', justifyContent:'center', alignItems:'center'}}>
                    <Text style={{textAlign:'center', fontSize:18, fontWeight:'bold'}}>{value}</Text>
                </View>

                {/* <View style={{width:'15%', justifyContent:'center', alignItems:'center'}}>
                    
                </View> */}
            </View>
        </View>
    )
}

export default Header;