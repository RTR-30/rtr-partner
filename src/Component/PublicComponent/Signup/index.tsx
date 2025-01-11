import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    Dimensions,
    TextInput,
} from "react-native";
import CustomDropDown from "../../../Common/DropDown/index";
import { fetchSignUp } from "./helper";
import Loader from "../../../Common/Loader";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const SignUp = () => {
    const navigation = useNavigation();

    const [value, setValue] = useState<any>(null);
    const [showLoader, setShowLoader] = useState<boolean>(false);

    const data = [
        { label: "Acting Driver", value: "1" },
        { label: "Car Owner", value: "2" },
    ];

    const [errName, setErrName] = useState(false);
    const [errEmail, setErrEmail] = useState(false);
    const [errPassword, setErrPassword] = useState(false);
    const [errConfirmPassword, setErrConfirmPassword] = useState(false);
    const [errMobileNo, setErrMobileNo] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mobileNo, setMobileNo] = useState("");

    const checkCondition = () => {

        if (!name || !email || !password || !confirmPassword || !mobileNo ) {
            setErrName(!name);
            setErrEmail(!email);
            setErrPassword(!password);
            setErrConfirmPassword(!confirmPassword);
            setErrMobileNo(!mobileNo);
        } else {
            if (password === confirmPassword) {
                handleSignUp();
            } else {
                Alert.alert("password")
            }
        }
        4
    };

    const handleSignUp = async () => {
        setShowLoader(true);

        const formData = {
            "name": name,
            "email": email,
            "phoneNumber": mobileNo,
            "password": password,
            "field": "Car Driver",
        };
        
        try {
            const response = await fetchSignUp(formData)
            if(response.status === 200){
                setName("");
                setEmail("");
                setMobileNo("");
                setPassword("");

                navigation.navigate("Login");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setShowLoader(false);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#5a639c" }}>
            <StatusBar backgroundColor="#5a639c" barStyle="dark-content" />

            {
                showLoader && (
                    <View style={{top:0, left:0, right:0, bottom:0, position:'absolute', zIndex:20, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)'}}>
                        <View style={{height:'10%', width:'10%', justifyContent:'center', alignItems:'center', backgroundColor:'#fff'}}>
                            <Loader/>
                        </View>
                    </View>
                )
            }

            <View style={{ flex:1, justifyContent: "center", alignItems: "center" }}>
                <View style={{ width: "97%", justifyContent: "center", alignItems: "center", shadowColor: "black", elevation: 5, backgroundColor: "#ffffff", borderRadius: 10, height: 700, }}>
                    <Text style={{ color: "black", fontSize: 20, fontWeight: "bold", marginBottom: 20, }}>Create Account</Text>

                    <View style={{ width: "99%", marginVertical: 5, }}>
                        <Text style={{ color: "black", fontSize: 16, fontWeight: "700", marginBottom: 5, }}>Name:</Text>
                        <TextInput
                            style={{ color: "black", borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 10, height: 40, }}
                            placeholder="Enter name"
                            placeholderTextColor="gray"
                            onChangeText={(txt) => {
                                setName(txt);
                                setErrName(!txt);
                            }}
                        />
                        {errName && <Text style={{ color: "red", fontWeight: "400", }}>Name is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, }}>
                        <Text style={{ color: "black", fontSize: 16, fontWeight: "700", marginBottom: 5, }}>Email:</Text>
                        <TextInput
                            style={{ color: "black", borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 10, height: 40, }}
                            placeholder="Enter email id"
                            placeholderTextColor="gray"
                            onChangeText={(txt) => {
                                setEmail(txt);
                                setErrEmail(!txt);
                            }}
                        />
                        {errEmail && <Text style={{ color: "red", fontWeight: "400" }}>Email is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, }}>
                        <Text style={{ color: "black", fontSize: 16, fontWeight: "700", marginBottom: 5, }}>Mobile Number:</Text>
                        <TextInput
                            style={{ color: "black", borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 10, height: 40, }}
                            placeholder="Enter mobile number"
                            placeholderTextColor="gray"
                            onChangeText={(txt) => {
                                setMobileNo(txt);
                                setErrMobileNo(!txt);
                            }}
                        />
                        {errMobileNo && <Text style={{ color: "red", fontWeight: "400", }}>Mobile number is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, }}>
                        <Text style={{ color: "black", fontSize: 16, fontWeight: "700", marginBottom: 5, }}>Password:</Text>
                        <TextInput
                            style={{ color: "black", borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 10, height: 40, }}
                            placeholder="Enter password"
                            placeholderTextColor="gray"
                            secureTextEntry
                            onChangeText={(txt) => {
                                setPassword(txt);
                                setErrPassword(!txt);
                            }}
                        />
                        {errPassword && <Text style={{ color: "red", fontWeight: "400", }}>Password is required</Text>}
                    </View>

                    <View style={{ width: "99%", marginVertical: 5, }}>
                        <Text style={{ color: "black", fontSize: 16, fontWeight: "700", marginBottom: 5, }}>Confirm Password:</Text>
                        <TextInput
                            style={{ color: "black", borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 10, height: 40, }}
                            placeholder="Confirm password"
                            placeholderTextColor="gray"
                            secureTextEntry
                            onChangeText={(txt) => {
                                setConfirmPassword(txt);
                                setErrConfirmPassword(!txt);
                            }}
                        />
                        {errConfirmPassword && <Text style={{ color: "red", fontWeight: "400", }}>Confirm Password is required</Text>}
                    </View>

                    <View style={{ marginTop: 20, width: "100%", justifyContent: "center", alignItems: "center", }}>
                        <TouchableOpacity onPress={checkCondition} style={{ width: 150, height: 40, backgroundColor: "#9400FF", justifyContent: "center", alignItems: "center", borderRadius: 10, }}>
                            <Text style={{ color: "white", fontWeight: "900", fontSize: 18, }}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SignUp;
