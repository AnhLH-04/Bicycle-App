import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AuthContext - Manages user authentication state
 * 
 * Provides:
 * - user: Current user object with role
 * - loading: Loading state
 * - login: Save user and token to context
 * - logout: Clear user and token
 * - updateUser: Update user info function
 */

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load user from storage on mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('accessToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function - Save user and token to context
   * Note: Actual API call is done in LoginScreen using AuthAPI
   * @param {string} authToken - JWT token from API
   * @param {object} userData - User object with role
   */
  const login = async (authToken, userData) => {
    try {
      setLoading(true);

      // Validate user has required fields
      if (!userData.role) {
        throw new Error('User role not provided');
      }

      // Validate role is one of the valid roles
      const validRoles = ['buyer', 'seller', 'inspector', 'admin'];
      if (!validRoles.includes(userData.role)) {
        throw new Error('Invalid user role');
      }

      // Save to storage
      await AsyncStorage.setItem('accessToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setUser(userData);

      console.log('✅ User logged in to context:', userData.role);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login context error:', error);
      return {
        success: false,
        error: error.message || 'Lưu thông tin đăng nhập thất bại',
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      setLoading(true);

      // Clear storage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userData');

      // Clear state
      setToken(null);
      setUser(null);

      console.log('✅ User logged out');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user info
   * @param {object} updates - User fields to update
   */
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      
      // Save to storage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    return user?.role && roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isLoggedIn: !!user,
    isInspector: user?.role === 'inspector',
    isBuyer: user?.role === 'buyer',
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
