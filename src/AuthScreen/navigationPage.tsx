import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import InitialPage from "../index";
import SplashScreen from "../Component/PublicComponent/SplashScreen/index";
import Login from "../Component/PublicComponent/Login/index";
import SignUp from "../Component/PublicComponent/Signup/index";
import Home from "../Component/PrivateComponent/Home/index";
import DutyScreen from "../Component/PrivateComponent/Duty/index";
import PaymentScreen from "../Component/PrivateComponent/Payment/index";
import MenuScreen from "../Component/PrivateComponent/Menu/index";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

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
                } else if (route.name === "Payment") {
                    iconName = focused ? "card" : "card-outline";
                } else if (route.name === "Menu") {
                    iconName = focused ? "menu" : "menu-outline";
                }

                return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#007bff", 
            tabBarInactiveTintColor: "gray",  
            tabBarStyle: {
                backgroundColor: "#f8f9fa", 
                borderTopWidth: 0,          
                height: 60,                 
                paddingBottom: 10,
                borderTopLeftRadius:30,
                borderTopRightRadius:30,       
            },
            tabBarLabelStyle: {
                fontSize: 12,               
                fontWeight: "600",          
            },
        })}
    >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Duty" component={DutyScreen} />
        <Tab.Screen name="Payment" component={PaymentScreen} />
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
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default NavigationPage;