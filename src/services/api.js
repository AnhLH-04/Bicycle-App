import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get stored token
const getToken = async () => {
    try {
        return await AsyncStorage.getItem('accessToken');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// Helper function to store token
const storeToken = async (token) => {
    try {
        await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
        console.error('Error storing token:', error);
    }
};

// Helper function to remove token
const removeToken = async () => {
    try {
        await AsyncStorage.removeItem('accessToken');
    } catch (error) {
        console.error('Error removing token:', error);
    }
};

// Helper function to store user data
const storeUserData = async (userData) => {
    try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        console.error('Error storing user data:', error);
    }
};

// Helper function to get user data
const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Helper function to remove user data
const removeUserData = async () => {
    try {
        await AsyncStorage.removeItem('userData');
    } catch (error) {
        console.error('Error removing user data:', error);
    }
};

// API Service
export const AuthAPI = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token and user data
            if (data.data?.accessToken) {
                await storeToken(data.data.accessToken);
            }
            if (data.data?.user) {
                await storeUserData(data.data.user);
            }

            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // Sign in user
    signIn: async (credentials) => {
        try {
            console.log('📤 Gửi request signin tới:', `${API_BASE_URL}/auth/signin`);
            console.log('📋 Credentials:', credentials);
            
            const response = await fetch(`${API_BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            console.log('📥 Response status:', response.status);
            console.log('📦 Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Sign in failed');
            }

            // Store token and user data
            if (data.data?.accessToken) {
                console.log('💾 Đang lưu token...');
                await storeToken(data.data.accessToken);
                console.log('✅ Token đã lưu');
            } else {
                console.warn('⚠️ Không có token trong response!');
            }
            
            if (data.data?.user) {
                console.log('💾 Đang lưu user data...');
                await storeUserData(data.data.user);
                console.log('✅ User data đã lưu');
            } else {
                console.warn('⚠️ Không có user data trong response!');
            }

            return data;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    },

    // Sign out user
    signOut: async () => {
        try {
            const token = await getToken();
            
            if (token) {
                const response = await fetch(`${API_BASE_URL}/auth/signout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    console.warn('Sign out API failed:', data.message);
                }
            }

            // Remove token and user data regardless of API response
            await removeToken();
            await removeUserData();

            return { message: 'Signed out successfully' };
        } catch (error) {
            console.error('Sign out error:', error);
            // Still remove local data even if API fails
            await removeToken();
            await removeUserData();
            throw error;
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            const token = await getToken();

            if (!token) {
                throw new Error('No access token found');
            }

            console.log('📡 Fetching profile from:', `${API_BASE_URL}/auth/profile`);
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log('📥 Profile response status:', response.status);
            console.log('📦 FULL Profile response:', JSON.stringify(data, null, 2));
            console.log('🔍 data.data:', data.data);
            console.log('🔍 data.data?.user:', data.data?.user);
            console.log('🔍 data.user:', data.user);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get profile');
            }

            // Update stored user data - check both possible structures
            let userData = data.data?.user || data.user || data.data;
            console.log('👤 Parsed user data:', userData);
            
            if (userData) {
                await storeUserData(userData);
            }

            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Get stored token
    getStoredToken: getToken,

    // Get stored user data
    getStoredUserData: getUserData,

    // Check if user is logged in
    isLoggedIn: async () => {
        const token = await getToken();
        return !!token;
    },
};

// Bicycle API Service
export const BicycleAPI = {
    /**
     * Get bicycle by ID
     * POST /api/v1/bicycles/get-bicycle-by-id
     * @param {string} bicycleId - The bicycle ID
     */
    getBicycleById: async (bicycleId) => {
        try {
            console.log(`📤 Fetching bicycle by ID: ${bicycleId}`);
            const response = await fetch(`${API_BASE_URL}/bicycles/get-bicycle-by-id`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: bicycleId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get bicycle');
            }

            // console.log('✅ Bicycle fetched:', data);
            return data;
        } catch (error) {
            console.error('❌ Get bicycle error:', error);
            throw error;
        }
    },

    /**
     * Get all bicycles
     * POST /api/v1/bicycles/get-all-bicycles
     */
    getAllBicycles: async () => {
        try {
            console.log('📤 Fetching all bicycles...');
            const response = await fetch(`${API_BASE_URL}/bicycles/get-all-bicycles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get bicycles');
            }

            console.log('✅ Bicycles fetched:', data);
            return data;
        } catch (error) {
            console.error('❌ Get bicycles error:', error);
            throw error;
        }
    },
};

export default AuthAPI;
