import React from "react";
import {
    TouchableOpacity,
    Text,
    View
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";

const CustomDropDown = ({data, setValue, value, errMsg}:any) => {

    return(
        <View style={{flex:1}}>
            <View style={{flex:1}}>
            <Dropdown
                style={{ borderWidth: 0.5, borderRadius: 10, height:40 }}
                data={data}
                labelField="label"
                valueField="label"
                placeholder="Select item"
                value={value}
                onChange={item => setValue(item.label)}
            />
            </View>
            <View>
                {
                    errMsg && (<Text style={{color: "red",fontWeight: "400",}}>Field selection is required</Text>)
                }
            </View>
        </View>
    );
};

export default CustomDropDown;