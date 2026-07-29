import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import InitialPage from "../index";
import SplashScreen from "../Component/PublicComponent/SplashScreen/index";
import Login from "../Component/PublicComponent/Login/index";
import SignUp from "../Component/PublicComponent/Signup/index";
import Home from "../Component/PrivateComponent/Home/index";
import DutyScreen from "../Component/PrivateComponent/Duty/index";
import MyDuty from "../Component/PrivateComponent/MyDuty/index";
import PaymentScreen from "../Component/PrivateComponent/Payment/index";
import MenuScreen from "../Component/PrivateComponent/Menu/index";
import HelpAndFeedback from "../Component/PrivateComponent/HelpAndFeedback/index";
import ContactUs from "../Component/PrivateComponent/ContactUs/index";
import Statistics from "../Component/PrivateComponent/Statistics/index";
import ForgetPassword from "../Component/PublicComponent/Login/forgetPassword";
import MyReferal from "../Component/PrivateComponent/MyReferal";
import Profile from "../Component/PrivateComponent/Profile";

import TripDetails from "../Component/PrivateComponent/Duty/TripDetails";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../utils/ColorCode";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Home") {
                    iconName = focused ? "home" : "home-outline";
                } else if (route.name === "Duty") {
                    iconName = focused ? "briefcase" : "briefcase-outline";
                } else if (route.name === "MyDuty") {
                    iconName = focused ? "clipboard" : "clipboard-outline";
                } else if (route.name === "Wallet") {
                    iconName = focused ? "card" : "card-outline";
                } else if (route.name === "Menu") {
                    iconName = focused ? "menu" : "menu-outline";
                } 

                return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.primary, 
            tabBarInactiveTintColor: "gray",  
            tabBarStyle: {
                backgroundColor: "#f8f9fa", 
                borderTopWidth: 0,          
                height: 60,                 
                paddingBottom: 10,
            },
            tabBarLabelStyle: {
                fontSize: 12,               
                fontWeight: "600",          
            },
        })}
    >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Duty" component={DutyScreen} />
        <Tab.Screen name="MyDuty" component={MyDuty} />
        <Tab.Screen name="Wallet" component={PaymentScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
)

const NavigationPage = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false
            }}>
                <Stack.Screen name="Initial" component={InitialPage}/>
                <Stack.Screen name="Splash" component={SplashScreen}/>
                <Stack.Screen name="Login" component={Login}/>
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="Home" component={TabNavigator} />
                <Stack.Screen name="TripDetails" component={TripDetails} />
                <Stack.Screen name="Statistics" component={Statistics} />
                <Stack.Screen name="HelpAndFeedback" component={HelpAndFeedback} />
                <Stack.Screen name="ContactUs" component={ContactUs} />
                <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
                <Stack.Screen name="MyReferal" component={MyReferal}/>
                <Stack.Screen name="Profile" component={Profile}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default NavigationPage;