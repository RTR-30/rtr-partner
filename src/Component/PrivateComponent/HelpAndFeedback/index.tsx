import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    ScrollView
} from "react-native";
import Header from "../../../Common/Header";
import { COLORS } from "../../../utils/ColorCode";

const HelpAndFeedback = () => {
    const value = "Help And Feedback";
    const backNavigate = true;
    return(
        <View className="flex-1" style={{backgroundColor:COLORS.primary}}>
            <View className="flex-1">
                <Header value={value} backNavigate={backNavigate}/>
            </View>

            <View className="flex-[9] bg-white rounded-t-[30px] p-4">
                <ScrollView className="bg-white" showsVerticalScrollIndicator={false}>
                    {/* intoduction */}
                    <View className="mt-1">
                        <Text className="text-black font-bold text-[18px]">⦿ Introduction</Text>
                        <Text className="text-black font-normal text-[14px] mt-1">Welcome to <Text className="text-blue-600 font-bold text-[14px]">RTR Partner!</Text> Our app provides a seamless and efficient ride-partner service, connecting drivers and passengers for safe and reliable transportation. Whether you need a quick ride to your destination or you're a driver looking for passengers, <Text className="text-blue-600 font-bold text-[14px]">RTR Partner</Text> makes the process simple, fast, and secure. With real-time booking, GPS tracking, secure payments, and instant notifications, our app ensures a smooth experience for both drivers and passengers. By using our platform, you agree to our Terms & Conditions, designed to ensure safety, transparency, and a hassle-free ride every time.</Text>
                    </View>

                    {/* User Eligibility */}
                    <View className="mt-3">
                        <Text className="text-black font-bold text-[18px]">⦿ User Eligibility – Who Can Use the App</Text>
                        <Text className="text-black font-normal text-[14px] mt-1">To ensure a safe and reliable experience, users of RTR Partner must meet the following eligibility criteria:</Text>
                        <Text className="text-black font-bold text-[16px] ml-2">⦿ For Passengers:</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">1) Must be at least 18 years old (or the legal age required in your region).{"\n"}2) Must provide accurate and up-to-date personal information.{"\n"}3) Agree to use the app responsibly and follow all local laws.</Text>
                        <Text className="text-black font-bold text-[16px] ml-2">⦿ For Drivers:</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">1) Must be at least [age requirement] years old.{"\n"}2) Must hold a valid driver’s license issued by the appropriate authority.{"\n"}3) Must provide proof of vehicle registration and insurance.{"\n"}4) Vehicles must meet safety and operational standards as per local regulations.{"\n"}5) Must comply with all traffic laws and driving safety regulations.</Text>
                    </View>

                    {/* Privacy Policy */}
                    <View className="mt-3">
                        <Text className="text-black font-bold text-[18px]">⦿ Privacy Policy – How User Data is Stored and Shared</Text>
                        <Text className="text-black font-normal text-[14px] mt-1">At <Text className="text-blue-600 font-bold text-[14px]">RTR Partner</Text>, we prioritize user privacy and data security. This Privacy Policy explains how we collect, store, and share your information when you use our app.</Text>
                        <Text className="text-black font-bold text-[16px] ml-2">⦿ Data Collection</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">1) Personal Information: Name, phone number, email, and profile picture.{"\n"}2) Location Data: Real-time GPS location for ride matching and navigation.{"\n"}3) Payment Information: Payment details for processing transactions (handled securely by third-party payment providers).{"\n"}4) Usage Data: App interactions, preferences, and device information.</Text>
                        <Text className="text-black font-bold text-[16px] ml-2">⦿ Data Storage & Security</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">1) All personal data is stored securely on encrypted servers.{"\n"}2) We use industry-standard encryption and security protocols to protect your information.{"\n"}3) Payment details are not stored on our servers but handled through PCI-compliant third-party payment processors.</Text>
                        <Text className="text-black font-bold text-[16px] ml-2">⦿ Data Sharing & Third-Party Access</Text>
                        <Text className="text-red-600 font-bold text-[14px] mt-1 ml-4">We do not sell user data. However, we may share data with:</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">1) Drivers & Passengers: Limited information (name, location, and contact) is shared during a ride.{"\n"}2) Payment Processors: To securely process transactions.{"\n"}3) Law Enforcement: When required by law or for fraud prevention.{"\n"}4) Analytics & Service Providers: To improve app performance and user experience.</Text>
                        <Text className="text-black font-bold text-[16px] ml-2">⦿ User Rights & Control</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">1) Users can update or delete their accounts at any time.{"\n"}2) Location tracking can be disabled, but it may affect app functionality.{"\n"}3) Users can request a copy of their stored data by contacting support.</Text>
                        <Text className="text-black font-normal text-[14px] ml-2 mt-1">By using <Text className="text-blue-600 font-bold text-[14px]">RTR Partner</Text>, you agree to this Privacy Policy and our data handling practices. Would you like to include a data retention policy or an option for users to opt out of tracking? 🔒📱</Text>
                    </View>

                    {/* No Refund policy */}
                    <View className="mt-3">
                        <Text className="text-black font-bold text-[18px]">⦿ Refund Policy</Text>
                        <Text className="text-black font-normal text-[14px] mt-1 ml-4">Users can request a refund for canceled bookings by contacting our support team to process your refund. A <Text className="font-bold text-red-600">₹100</Text> service fee will be deducted from the total refund amount.</Text>
                    </View>

                </ScrollView>
            </View>
        </View>
    );
};

export default HelpAndFeedback;