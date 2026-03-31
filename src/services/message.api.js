import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const normalizeId = (value) => {
  if (value === null || value === undefined) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  if (typeof value === 'object') {
    const nestedId =
      value.$oid ||
      value.oid ||
      value.id ||
      value._id ||
      value.value;

    if (nestedId !== undefined && nestedId !== null) {
      return String(nestedId).trim();
    }
  }

  return String(value).trim();
};

const isInvalidId = (value) => {
  const normalized = normalizeId(value);
  const invalidValues = ['', 'undefined', 'null', '[object Object]'];
  return invalidValues.includes(normalized);
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const buildErrorFromResponse = async (response) => {
  try {
    const data = await response.json();
    const details = Array.isArray(data?.errors)
      ? data.errors.join(', ')
      : Array.isArray(data?.error)
        ? data.error.join(', ')
        : '';

    const baseMessage =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const message = details ? `${baseMessage}: ${details}` : baseMessage;
    const error = new Error(message);
    error.status = response.status;
    error.responseData = data;
    return error;
  } catch {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    return error;
  }
};

const authenticatedFetch = async (path, options = {}) => {
  const token = await getToken();

  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw await buildErrorFromResponse(response);
  }

  return response.json();
};

const pickMessageText = (message) => {
  const contentValue = message?.content;

  if (contentValue && typeof contentValue === 'object') {
    return (
      contentValue.text ||
      contentValue.message ||
      ''
    );
  }

  return (
    contentValue ||
    message?.message ||
    message?.text ||
    message?.body ||
    ''
  );
};

const pickAttachments = (message) => {
  if (Array.isArray(message?.attachments)) {
    return message.attachments;
  }

  if (Array.isArray(message?.content?.attachments)) {
    return message.content.attachments;
  }

  return [];
};

export const normalizeMessage = (message) => {
  if (!message) return null;

  return {
    id: normalizeId(message._id || message.id || message.messageId || Date.now()),
    conversationId: normalizeId(message.conversationId || message.conversation || ''),
    senderId: normalizeId(message.senderId || message.sender?._id || message.sender?.id || message.userId || ''),
    sender: message.sender || null,
    content: pickMessageText(message),
    attachments: pickAttachments(message),
    type: message.type || 'text',
    createdAt: message.createdAt || message.timestamp || new Date().toISOString(),
    readAt: message.readAt || null,
    raw: message,
  };
};

export const normalizeConversation = (conversation) => {
  const lastMessage =
    normalizeMessage(conversation?.lastMessage) ||
    normalizeMessage(conversation?.latestMessage) ||
    normalizeMessage(conversation?.message);

  return {
    id: normalizeId(conversation?._id || conversation?.id || conversation?.conversationId || ''),
    participants: conversation?.participants || conversation?.members || [],
    title: conversation?.title || conversation?.name || null,
    lastMessage,
    unreadCount:
      conversation?.unreadCount ??
      conversation?.unread ??
      conversation?.unreadMessages ??
      0,
    updatedAt:
      conversation?.updatedAt ||
      lastMessage?.createdAt ||
      conversation?.createdAt ||
      new Date().toISOString(),
    raw: conversation,
  };
};

const pickList = (payload, keys) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }
  return [];
};

const extractDataPayload = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return response?.data || response;
};

const includesParticipant = (conversation, targetUserId) => {
  const normalizedTarget = normalizeId(targetUserId);
  if (isInvalidId(normalizedTarget)) return false;

  const participants = Array.isArray(conversation?.participants)
    ? conversation.participants
    : Array.isArray(conversation?.members)
      ? conversation.members
      : [];

  return participants.some((participant) => {
    const candidateId = normalizeId(
      participant?._id ||
      participant?.id ||
      participant?.userId ||
      participant
    );
    return candidateId === normalizedTarget;
  });
};

export const MessageAPI = {
  getUserById: async (userId) => {
    try {
      const data = await authenticatedFetch(`/users/${userId}`, { method: 'POST' });
      return data?.data || data || null;
    } catch {
      return null;
    }
  },

  getConversations: async () => {
    const response = await authenticatedFetch('/messages/conversations');
    const dataPayload = extractDataPayload(response);
    const rawConversations = pickList(dataPayload, [
      'conversations',
      'items',
      'results',
      'data',
    ]);

    return {
      ...response,
      conversations: rawConversations
        .map(normalizeConversation)
        .filter((item) => item?.id),
    };
  },

  createConversation: async (payload) => {
    const normalizedOtherUserId = normalizeId(
      payload?.otherUserId ||
      payload?.participantId ||
      payload?.recipientId ||
      payload?.sellerId ||
      payload?.userId ||
      payload?.participantIds?.[0]
    );

    if (isInvalidId(normalizedOtherUserId)) {
      throw new Error('otherUserId không hợp lệ');
    }

    const requestPayload = { otherUserId: normalizedOtherUserId };
    console.log('📨 [MessageAPI] createConversation payload:', requestPayload);

    const response = await authenticatedFetch('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });

    const created =
      response?.data?.conversation ||
      response?.data ||
      response?.conversation ||
      response;

    return {
      ...response,
      conversation: normalizeConversation(created),
    };
  },

  findConversationByParticipant: async (participantId) => {
    const normalizedParticipantId = normalizeId(participantId);
    if (isInvalidId(normalizedParticipantId)) {
      return null;
    }

    const response = await MessageAPI.getConversations();
    const conversations = response?.conversations || [];

    const found = conversations.find((conversation) =>
      includesParticipant(conversation, normalizedParticipantId)
    );

    return found || null;
  },

  getConversationMessages: async (conversationId) => {
    const response = await authenticatedFetch(`/messages/conversations/${conversationId}/messages`);

    const dataPayload = extractDataPayload(response);
    const rawMessages = pickList(dataPayload, [
      'messages',
      'items',
      'results',
      'data',
    ]);

    return {
      ...response,
      messages: rawMessages
        .map(normalizeMessage)
        .filter((item) => item?.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    };
  },

  sendMessage: async (conversationId, messageText) => {
    const normalizedConversationId = normalizeId(conversationId);
    const normalizedMessageText = String(messageText || '').trim();

    if (isInvalidId(normalizedConversationId)) {
      throw new Error('conversationId không hợp lệ');
    }

    if (!normalizedMessageText) {
      throw new Error('Nội dung tin nhắn không được để trống');
    }

    const path = `/messages/conversations/${normalizedConversationId}/messages`;

    // Web contract: send text + attachments (conversationId is in route param)
    let response;
    try {
      const primaryPayload = { text: normalizedMessageText, attachments: [] };
      console.log('📨 [MessageAPI] sendMessage request:', { path, payload: primaryPayload });
      response = await authenticatedFetch(path, {
        method: 'POST',
        body: JSON.stringify(primaryPayload),
      });
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const requiresConversationId = message.includes('conversationid');

      if (!requiresConversationId) {
        throw error;
      }

      const fallbackPayload = {
        conversationId: normalizedConversationId,
        text: normalizedMessageText,
        attachments: [],
      };
      console.log('📨 [MessageAPI] sendMessage fallback request:', { path, payload: fallbackPayload });

      response = await authenticatedFetch(path, {
        method: 'POST',
        body: JSON.stringify(fallbackPayload),
      });
    }

    const sentMessage =
      response?.data?.message ||
      response?.data ||
      response?.message ||
      response;

    return {
      ...response,
      message: normalizeMessage(sentMessage),
    };
  },

  markConversationRead: async (conversationId) => {
    return authenticatedFetch(`/messages/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },
};

export default MessageAPI;
