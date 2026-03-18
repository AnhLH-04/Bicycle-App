import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * AuthGuard Component
 * 
 * Protects routes based on user authentication and role
 * 
 * @param {ReactNode} children - Components to render if authorized
 * @param {string} requiredRole - Required role to access ('buyer', 'seller', 'inspector', 'admin')
 * @param {function} onUnauthorized - Optional callback when user is unauthorized
 * 
 * Usage:
 * <AuthGuard requiredRole="inspector">
 *   <InspectorScreens />
 * </AuthGuard>
 */
const AuthGuard = ({ children, requiredRole, onUnauthorized }) => {
  // TODO: Replace with your actual auth context
  // import { useAuth } from '../context/AuthContext';
  // const { user, loading } = useAuth();
  
  // Mock data for demonstration - REMOVE THIS IN PRODUCTION
  const loading = false;
  const user = {
    id: '123',
    name: 'John Doe',
    role: 'inspector', // Change this to test different roles: 'buyer', 'seller', 'inspector', 'admin'
  };
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }
  
  // User not logged in
  if (!user) {
    return (
      <View style={styles.container}>
        <Icon name="lock-outline" size={80} color={COLORS.error} />
        <Text style={styles.errorTitle}>Yêu cầu đăng nhập</Text>
        <Text style={styles.errorText}>
          Vui lòng đăng nhập để truy cập tính năng này
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => {
            if (onUnauthorized) {
              onUnauthorized('not_logged_in');
            }
            // TODO: Navigate to login screen
            // navigation.navigate('Login');
          }}
        >
          <Icon name="login" size={20} color={COLORS.white} />
          <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <View style={styles.container}>
        <Icon name="shield-alert-outline" size={80} color={COLORS.warning} />
        <Text style={styles.errorTitle}>Không có quyền truy cập</Text>
        <Text style={styles.errorText}>
          Tính năng này chỉ dành cho{' '}
          <Text style={styles.roleText}>{getRoleName(requiredRole)}</Text>
        </Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role hiện tại của bạn:</Text>
            <Text style={styles.infoValue}>{getRoleName(user.role)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role yêu cầu:</Text>
            <Text style={styles.infoValue}>{getRoleName(requiredRole)}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (onUnauthorized) {
              onUnauthorized('wrong_role', { userRole: user.role, requiredRole });
            }
            // TODO: Navigate back or to home
            // navigation.goBack();
          }}
        >
          <Icon name="arrow-left" size={20} color={COLORS.primary} />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // User is authorized - render children
  return <>{children}</>;
};

/**
 * Get Vietnamese role name
 */
const getRoleName = (role) => {
  const roleNames = {
    buyer: 'Người mua',
    seller: 'Người bán',
    inspector: 'Người kiểm định',
    admin: 'Quản trị viên',
  };
  return roleNames[role] || role;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  roleText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthGuard;
