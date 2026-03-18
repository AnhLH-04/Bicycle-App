import { API_BASE_URL } from '@env';

// API Configuration
export const API_CONFIG = {
    // BASE_URL is now loaded from .env file
    // For Android Emulator: http://10.0.2.2:3000/api/v1
    // For Physical Device: http://YOUR_COMPUTER_IP:3000/api/v1
    BASE_URL: API_BASE_URL || 'https://bicycle-marketplace.onrender.com/api/docs', // Fallback if env not loaded
    
    // You can also use your computer's IP address for testing on physical device
    // Example: 'http://192.168.1.100:3000/api/v1'
    
    // Endpoints
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/register',
            SIGNIN: '/auth/signin',
            SIGNOUT: '/auth/signout',
            PROFILE: '/auth/profile',
        },
        // Add more endpoints here as needed
    },
    
    // Timeout settings
    TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;
