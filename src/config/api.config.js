// API Configuration
export const API_CONFIG = {
    // Change this to your backend URL
    // For Android Emulator, use: 'http://10.0.2.2:3000/api/v1'
    // For Physical Device or iOS, use your computer's IP
    BASE_URL: 'http://192.168.1.85:3000/api/v1',
    
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
