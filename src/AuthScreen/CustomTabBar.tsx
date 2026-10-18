import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "../utils/ColorCode";

interface TabItemProps {
    route: any;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

const getTabConfig = (routeName: string, focused: boolean) => {
    switch (routeName) {
        case "Home":
            return {
                iconName: focused ? "home" : "home-outline",
                label: "Home",
            };
        case "Duty":
            return {
                iconName: focused ? "briefcase" : "briefcase-outline",
                label: "Duty",
            };
        case "MyDuty":
            return {
                iconName: focused ? "clipboard" : "clipboard-outline",
                label: "My Trips",
            };
        case "Wallet":
            return {
                iconName: focused ? "card" : "card-outline",
                label: "Wallet",
            };
        case "Menu":
            return {
                iconName: focused ? "grid" : "grid-outline",
                label: "Menu",
            };
        default:
            return {
                iconName: focused ? "ellipse" : "ellipse-outline",
                label: routeName,
            };
    }
};

const TabItem: React.FC<TabItemProps> = ({
    route,
    isFocused,
    onPress,
    onLongPress,
}) => {
    const scaleAnim = useRef(new Animated.Value(isFocused ? 1.15 : 1.0)).current;
    const translateYAnim = useRef(new Animated.Value(isFocused ? -3 : 0)).current;
    const indicatorOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const indicatorScale = useRef(new Animated.Value(isFocused ? 1 : 0.4)).current;
    const bubbleOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    const { iconName, label } = getTabConfig(route.name, isFocused);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1.15 : 1.0,
                friction: 5,
                tension: 180,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: isFocused ? -3 : 0,
                friction: 6,
                tension: 180,
                useNativeDriver: true,
            }),
            Animated.timing(indicatorOpacity, {
                toValue: isFocused ? 1 : 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.spring(indicatorScale, {
                toValue: isFocused ? 1 : 0.4,
                friction: 6,
                tension: 180,
                useNativeDriver: true,
            }),
            Animated.timing(bubbleOpacity, {
                toValue: isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isFocused]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            friction: 6,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.15 : 1.0,
            friction: 5,
            tension: 180,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tabButton}
        >
            {/* Top Glowing Active Line Indicator */}
            <Animated.View
                style={[
                    styles.activeTopIndicator,
                    {
                        opacity: indicatorOpacity,
                        transform: [{ scaleX: indicatorScale }],
                    },
                ]}
            />

            {/* Icon & Bubble Container with Spring Lift Animation */}
            <Animated.View
                style={[
                    styles.iconWrapper,
                    {
                        transform: [
                            { scale: scaleAnim },
                            { translateY: translateYAnim },
                        ],
                    },
                ]}
            >
                {/* Soft Glowing Aura Behind Active Icon */}
                <Animated.View
                    style={[
                        styles.activeBubbleAura,
                        { opacity: bubbleOpacity },
                    ]}
                />

                <Icon
                    name={iconName}
                    size={22}
                    color={isFocused ? COLORS.primary : "#94A3B8"}
                />
            </Animated.View>

            {/* Tab Label */}
            <Text
                style={[
                    styles.tabLabel,
                    {
                        color: isFocused ? COLORS.primary : "#64748B",
                        fontWeight: isFocused ? "800" : "600",
                    },
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
    state,
    descriptors,
    navigation,
    insets,
}) => {
    // Dynamic bottom padding supporting iOS home indicator & Android navigation bar
    const bottomPadding = Math.max(
        insets?.bottom ?? 0,
        Platform.OS === "ios" ? 18 : 8
    );

    return (
        <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
            <View style={styles.tabBarContent}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    return (
                        <TabItem
                            key={route.key}
                            route={route}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default CustomTabBar;

const styles = StyleSheet.create({
    tabBarContainer: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 12,
    },
    tabBarContent: {
        flexDirection: "row",
        height: 56,
        alignItems: "center",
        justifyContent: "space-between",
    },
    tabButton: {
        flex: 1,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        paddingTop: 4,
    },
    activeTopIndicator: {
        position: "absolute",
        top: 0,
        width: 26,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 2,
    },
    iconWrapper: {
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 30,
        position: "relative",
    },
    activeBubbleAura: {
        position: "absolute",
        width: 36,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(224, 33, 31, 0.09)",
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 2,
        letterSpacing: 0.2,
    },
});
