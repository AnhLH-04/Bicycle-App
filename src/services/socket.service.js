import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import API_CONFIG from '../config/api.config';

const SOCKET_URL = API_CONFIG.SOCKET_URL;

let socketInstance = null;

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting token for socket:', error);
    return null;
  }
};

const createSocket = async ({ token, userId } = {}) => {
  const authToken = token || (await getToken());

  if (!authToken) {
    throw new Error('No authentication token found. Please login again.');
  }

  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    forceNew: false,
    reconnection: true,
    autoConnect: true,
    auth: {
      userId,
      token: authToken,
    },
    query: {
      token: authToken,
      userId,
    },
    extraHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return socket;
};

export const SocketService = {
  connect: async ({ token, userId } = {}) => {
    if (socketInstance?.connected) {
      return socketInstance;
    }

    if (!socketInstance) {
      socketInstance = await createSocket({ token, userId });
    } else if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return socketInstance;
  },

  getSocket: () => socketInstance,

  disconnect: () => {
    if (socketInstance) {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  joinConversation: (conversationId) => {
    if (!socketInstance || !conversationId) return;

    const payload = { conversationId: String(conversationId) };
    socketInstance.emit('join-conversation', payload);
    socketInstance.emit('conversation:join', payload);
    socketInstance.emit('joinConversation', payload);
  },

  leaveConversation: (conversationId) => {
    if (!socketInstance || !conversationId) return;

    const payload = { conversationId: String(conversationId) };
    socketInstance.emit('conversation:leave', payload);
    socketInstance.emit('leaveConversation', payload);
  },

  sendRealtimeMessage: (payload) => {
    if (!socketInstance || !payload) return;

    socketInstance.emit('send-message', payload);
    socketInstance.emit('message:send', payload);
    socketInstance.emit('sendMessage', payload);
  },

  markConversationRead: (conversationId, userId) => {
    if (!socketInstance || !conversationId) return;

    const payload = { conversationId: String(conversationId), userId: userId ? String(userId) : undefined };
    socketInstance.emit('mark-read', payload);
    socketInstance.emit('conversation:read', payload);
    socketInstance.emit('markConversationRead', payload);
  },

  on: (eventName, handler) => {
    if (!socketInstance || !eventName || !handler) return;
    socketInstance.on(eventName, handler);
  },

  off: (eventName, handler) => {
    if (!socketInstance || !eventName) return;
    socketInstance.off(eventName, handler);
  },
};

export default SocketService;
