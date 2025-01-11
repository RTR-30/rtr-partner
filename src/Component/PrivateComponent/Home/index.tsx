import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Platform,
    PermissionsAndroid,
    Alert,
    ToastAndroid,
    Switch,
    Image
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';

// Custom map style
const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dcdcdc",
            },
        ],
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off",
            },
        ],
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161",
            },
        ],
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff",
            },
        ],
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#9e9e9e",
            },
        ],
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5",
            },
        ],
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#e0e0e0",
            },
        ],
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#cfcfcf",
            },
        ],
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#b0bec5",
            },
        ],
    },
];

const Home = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [region, setRegion] = useState<any>(null); 

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    useEffect(() => {
        const requestLocationPermission = async () => {
            try {
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert(
                            'Permission Denied',
                            'Location permission is required to show your position.'
                        );
                        return;
                    }
                }

                // Fetch the user's current location
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setRegion({
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    },
                );

            } catch (err) {
                console.error('Permission Error:', err);
            }
        };

        requestLocationPermission();
    }, []);


    if (!region) {
        return null;
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ width: "100%", height: "100%" }}>
                <MapView
                    style={{ width: "100%", height: "100%" }}
                    customMapStyle={mapStyle}
                    initialRegion={region}
                    showsUserLocation={false}
                    followsUserLocation={true}
                >
                    <Marker
                        coordinate={{
                            latitude: region.latitude,
                            longitude: region.longitude,
                        }}
                        title="You are here"
                        description="This is your current location"
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                source={require('../../../../assets/Imgs/man.png')}
                                style={{ width: 40, height: 40, resizeMode: 'contain' }} 
                            />
                        </View>
                    </Marker>
                </MapView>
            </View>

            <View
                style={{
                    position: 'absolute',
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-around",
                    alignItems: "center",
                    marginTop: '10%',
                    height: '10%'
                }}
            >
                <View style={{ width: "30%", backgroundColor: "white", borderRadius: 10, height: '50%', justifyContent: "center", alignItems: "center", flexDirection: 'row' }}>
                    <Text style={{ color: isEnabled ? "green" : 'red', fontSize: 16, fontWeight: '600' }}>{isEnabled ? "Online" : "Offline"}</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#ABBA7C' }}
                        thumbColor={isEnabled ? '#3D5300' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                </View>

                <View style={{ width: "60%", backgroundColor: "white", borderRadius: 10, height: '50%', justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "black", fontSize: 16, fontWeight: "600", textAlign: "center" }}>
                        RTR Partner
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default Home;
