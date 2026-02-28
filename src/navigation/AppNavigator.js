import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '../context/AuthContext';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import { COLORS } from '../constants/colors';

import SearchScreen from '../screens/Search/SearchScreen';
import FiltersScreen from '../screens/Search/FiltersScreen';
import ProductDetailScreen from '../screens/Product/ProductDetailScreen';
import CompareBikesScreen from '../screens/Product/CompareBikesScreen';
import WishlistScreen from '../screens/Interactions/WishlistScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChatListScreen from '../screens/Communication/ChatListScreen';
import ChatDetailScreen from '../screens/Communication/ChatDetailScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import OrderTrackingScreen from '../screens/Orders/OrderTrackingScreen';

// Import Inspector screens
import InspectorDashboardScreen from '../screens/Inspector/InspectorDashboardScreen';
import InspectionRequestsScreen from '../screens/Inspector/InspectionRequestsScreen';
import InspectionDetailScreen from '../screens/Inspector/InspectionDetailScreen';
import PerformInspectionScreen from '../screens/Inspector/PerformInspectionScreen';
import InspectionHistoryScreen from '../screens/Inspector/InspectionHistoryScreen';
import DisputeResolutionScreen from '../screens/Inspector/DisputeResolutionScreen';
import EarningsScreen from '../screens/Inspector/EarningsScreen';
import InspectorProfileScreen from '../screens/Inspector/InspectorProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator cho Buyer/Seller
function BuyerTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Wishlist') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Wishlist" component={WishlistScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Tab Navigator cho Inspector
function InspectorTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'speedometer' : 'speedometer-outline';
                    } else if (route.name === 'Requests') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Earnings') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'InspectorProfile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                headerShown: false,
            })}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={InspectorDashboardScreen}
                options={{ tabBarLabel: 'Tổng quan' }}
            />
            <Tab.Screen 
                name="Requests" 
                component={InspectionRequestsScreen}
                options={{ tabBarLabel: 'Yêu cầu' }}
            />
            <Tab.Screen 
                name="History" 
                component={InspectionHistoryScreen}
                options={{ tabBarLabel: 'Lịch sử' }}
            />
            <Tab.Screen 
                name="Earnings" 
                component={EarningsScreen}
                options={{ tabBarLabel: 'Thu nhập' }}
            />
            <Tab.Screen 
                name="InspectorProfile" 
                component={InspectorProfileScreen}
                options={{ tabBarLabel: 'Hồ sơ' }}
            />
        </Tab.Navigator>
    );
}

function AppNavigatorContent() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
            {/* Auth Screens */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            
            {/* Buyer/Seller Main Screens */}
            <Stack.Screen name="BuyerMain" component={BuyerTabNavigator} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="CompareBikes" component={CompareBikesScreen} />
            <Stack.Screen name="Filters" component={FiltersScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            
            {/* Inspector Main Screens */}
            <Stack.Screen name="InspectorMain" component={InspectorTabNavigator} />
            <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} />
            <Stack.Screen name="PerformInspection" component={PerformInspectionScreen} />
            <Stack.Screen name="DisputeResolution" component={DisputeResolutionScreen} />
            
            {/* Legacy support - redirect to BuyerMain */}
            <Stack.Screen 
                name="Main" 
                component={BuyerTabNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigatorContent />
            </NavigationContainer>
        </AuthProvider>
    );
}
