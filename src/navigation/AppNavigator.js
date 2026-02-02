import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
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

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                <Stack.Screen name="CompareBikes" component={CompareBikesScreen} />
                <Stack.Screen name="Filters" component={FiltersScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                <Stack.Screen name="ChatList" component={ChatListScreen} />
                <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
