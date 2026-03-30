import { API_BASE_URL, SOCKET_URL } from '@env';

const resolvedApiBaseUrl = API_BASE_URL || 'https://bicycle-marketplace.onrender.com/api/v1';

const resolveSocketUrl = () => {
  if (SOCKET_URL) {
    return SOCKET_URL;
  }

  // Convert API URL to server URL for Socket.IO
  // Example: https://domain.com/api/v1 -> https://domain.com
  return resolvedApiBaseUrl.replace(/\/api\/v\d+\/?$/, '');
};

// API Configuration
export const API_CONFIG = {
  // BASE_URL is now loaded from .env file
  // For Android Emulator: http://10.0.2.2:3000/api/v1
  // For Physical Device: http://YOUR_COMPUTER_IP:3000/api/v1
  BASE_URL: resolvedApiBaseUrl,
  SOCKET_URL: resolveSocketUrl(),

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
