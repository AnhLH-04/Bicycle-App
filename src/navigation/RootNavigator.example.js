/**
 * Example: Complete Navigation Setup with RBAC for Inspector Module
 * 
 * File này demo cách setup đầy đủ navigation với role-based access control
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import AuthGuard from '../components/common/AuthGuard';

// Import screens from different modules
import { HomeScreen } from '../screens/Home';
import { ProfileScreen } from '../screens/Profile';
import { LoginScreen, RegisterScreen } from '../screens/Auth';

// Import Inspector screens
import {
  InspectorDashboardScreen,
  InspectionRequestsScreen,
  InspectionDetailScreen,
  PerformInspectionScreen,
  InspectionHistoryScreen,
  DisputeResolutionScreen,
  EarningsScreen,
} from '../screens/Inspector';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Inspector Stack Navigator
 * Protected by AuthGuard - only accessible by users with role='inspector'
 */
function InspectorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="InspectorDashboard"
        component={InspectorDashboardScreen}
        options={{ title: 'Trang chủ Kiểm định' }}
      />
      <Stack.Screen
        name="InspectionRequests"
        component={InspectionRequestsScreen}
        options={{ title: 'Yêu cầu kiểm định' }}
      />
      <Stack.Screen
        name="InspectionDetail"
        component={InspectionDetailScreen}
        options={{ title: 'Chi tiết yêu cầu' }}
      />
      <Stack.Screen
        name="PerformInspection"
        component={PerformInspectionScreen}
        options={{ title: 'Thực hiện kiểm định' }}
      />
      <Stack.Screen
        name="InspectionHistory"
        component={InspectionHistoryScreen}
        options={{ title: 'Lịch sử kiểm định' }}
      />
      <Stack.Screen
        name="DisputeResolution"
        component={DisputeResolutionScreen}
        options={{ title: 'Xử lý tranh chấp' }}
      />
      <Stack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Thu nhập' }}
      />
    </Stack.Navigator>
  );
}

/**
 * Protected Inspector Navigator
 * Wraps Inspector Stack with AuthGuard
 */
function InspectorNavigator() {
  return (
    <AuthGuard 
      requiredRole="inspector"
      onUnauthorized={(reason, data) => {
        console.log('Access denied:', reason, data);
        // You can add analytics tracking here
      }}
    >
      <InspectorStack />
    </AuthGuard>
  );
}

/**
 * Main App Tab Navigator
 * Dynamically shows/hides tabs based on user role
 */
function AppTabs() {
  const { user, isLoggedIn, isInspector, isSeller, isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Inspector':
              iconName = 'clipboard-check';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
      })}
    >
      {/* Home Tab - Available for everyone */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />

      {/* Inspector Tab - ONLY for users with role='inspector' */}
      {isInspector && (
        <Tab.Screen
          name="Inspector"
          component={InspectorNavigator}
          options={{
            tabBarLabel: 'Kiểm định',
            tabBarBadge: 5, // Optional: Show number of pending requests
          }}
        />
      )}

      {/* Profile Tab - Available for logged in users */}
      {isLoggedIn && (
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: 'Cá nhân' }}
        />
      )}
    </Tab.Navigator>
  );
}

/**
 * Auth Stack Navigator
 * For login/register screens
 */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/**
 * Root Navigator
 * Decides whether to show Auth or App based on login status
 */
function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen />;
  }

  // Show Auth stack if not logged in
  if (!isLoggedIn) {
    return <AuthStack />;
  }

  // Show App tabs if logged in
  return <AppTabs />;
}

export default RootNavigator;

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{ marginTop: 16, color: COLORS.gray }}>
        Đang kiểm tra đăng nhập...
      </Text>
    </View>
  );
}

/**
 * ==============================================
 * Usage in App.js:
 * ==============================================
 * 
 * import React from 'react';
 * import { NavigationContainer } from '@react-navigation/native';
 * import { AuthProvider } from './src/context/AuthContext';
 * import RootNavigator from './src/navigation/RootNavigator';
 * 
 * export default function App() {
 *   return (
 *     <AuthProvider>
 *       <NavigationContainer>
 *         <RootNavigator />
 *       </NavigationContainer>
 *     </AuthProvider>
 *   );
 * }
 * 
 * ==============================================
 * Test Scenarios:
 * ==============================================
 * 
 * 1. Not logged in:
 *    - Should see Login/Register screens
 *    - No tabs visible
 * 
 * 2. Logged in as Inspector (role='inspector'):
 *    - Should see: Home, Inspector, Profile tabs
 *    - Can access all Inspector screens
 * 
 * 3. Logged in as Buyer (role='buyer'):
 *    - Should see: Home, Profile tabs
 *    - No Inspector tab visible
 *    - Cannot access Inspector screens via deep link
 * 
 * 4. Logged in as Seller (role='seller'):
 *    - Should see: Home, Seller, Profile tabs
 *    - No Inspector tab visible
 * 
 * 5. Logged in as Admin (role='admin'):
 *    - Should see: All tabs including Admin panel
 *    - Can access everything
 * 
 * ==============================================
 * Deep Linking Example:
 * ==============================================
 * 
 * // If user tries to access inspector via deep link:
 * // bicycleapp://inspector/requests
 * 
 * // Behavior:
 * // - If role='inspector' → Navigate to screen ✅
 * // - If other role → Show AuthGuard error screen ❌
 * // - If not logged in → Show login prompt ❌
 * 
 */
