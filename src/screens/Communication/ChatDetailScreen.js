import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import MessageAPI, { normalizeMessage } from '../../services/message.api';
import SocketService from '../../services/socket.service';
import { useAuth } from '../../context/AuthContext';

export default function ChatDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user: targetUserName, conversationId: initialConversationId, recipientId, userId, sellerId } = route.params || {};
    const { user, token } = useAuth();

    const toId = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
        if (typeof value === 'object') {
            const nested = value.$oid || value.oid || value.id || value._id || value.value;
            if (nested !== undefined && nested !== null) return String(nested).trim();
        }
        return String(value).trim();
    };

    const isInvalidId = (value) => {
        const normalized = toId(value);
        return ['', 'undefined', 'null', '[object Object]'].includes(normalized);
    };

    const [conversationId, setConversationId] = useState(() => {
        const normalized = toId(initialConversationId);
        return isInvalidId(normalized) ? null : normalized;
    });
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);
    const pendingOutgoingRef = useRef(new Map());

    const currentUserId = useMemo(
        () => toId(user?._id || user?.id || ''),
        [user]
    );
    const targetUserId = useMemo(
        () => toId(recipientId || userId || sellerId || ''),
        [recipientId, userId, sellerId]
    );

    const mergeMessages = useCallback((incoming) => {
        setMessages((prev) => {
            const map = new Map(prev.map((item) => [item.id, item]));
            incoming.forEach((msg) => {
                if (!msg?.id) return;
                map.set(msg.id, msg);
            });

            return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
    }, []);

    const ensureConversation = useCallback(async () => {
        if (conversationId) return conversationId;
        if (isInvalidId(targetUserId)) {
            throw new Error('Không tìm thấy người nhận để tạo cuộc trò chuyện');
        }

        try {
            const existingConversation = await MessageAPI.findConversationByParticipant(targetUserId);
            if (existingConversation?.id && !isInvalidId(existingConversation.id)) {
                const existingConversationId = toId(existingConversation.id);
                setConversationId(existingConversationId);
                return existingConversationId;
            }
        } catch (error) {
            console.warn('⚠️ Find existing conversation error:', error?.message || error);
        }

        const payloadCandidates = [
            { otherUserId: targetUserId },
            { participantId: targetUserId },
            { recipientId: targetUserId },
            { sellerId: targetUserId },
            { participantIds: [targetUserId] },
        ];

        let createdConversation = null;
        let lastError = null;

        for (const payload of payloadCandidates) {
            try {
                const response = await MessageAPI.createConversation(payload);
                createdConversation = response?.conversation;
                if (createdConversation?.id && !isInvalidId(createdConversation.id)) {
                    break;
                }
            } catch (error) {
                lastError = error;
            }
        }

        if (!createdConversation?.id || isInvalidId(createdConversation.id)) {
            throw lastError || new Error('Không thể tạo cuộc trò chuyện');
        }

        const normalizedConversationId = toId(createdConversation.id);
        setConversationId(normalizedConversationId);
        return normalizedConversationId;
    }, [conversationId, targetUserId]);

    const loadMessages = useCallback(async (conversationIdValue) => {
        const response = await MessageAPI.getConversationMessages(conversationIdValue);
        const loadedMessages = response?.messages || [];
        setMessages(loadedMessages);
    }, []);

    const markAsRead = useCallback(async (conversationIdValue) => {
        if (!conversationIdValue) return;

        try {
            await MessageAPI.markConversationRead(conversationIdValue);
            SocketService.markConversationRead(conversationIdValue, currentUserId);
        } catch (error) {
            console.warn('⚠️ Mark read error:', error?.message || error);
        }
    }, [currentUserId]);

    useEffect(() => {
        let isMounted = true;
        let realtimeMessageHandler;

        const init = async () => {
            try {
                setLoading(true);

                const activeConversationId = await ensureConversation();
                if (!isMounted) return;

                await loadMessages(activeConversationId);
                await markAsRead(activeConversationId);

                await SocketService.connect({ token, userId: currentUserId });
                SocketService.joinConversation(activeConversationId);

                realtimeMessageHandler = (payload) => {
                    const rawMessage = payload?.message || payload;
                    const normalized = normalizeMessage(rawMessage);

                    if (!normalized?.id) return;
                    if (String(normalized.conversationId || activeConversationId) !== String(activeConversationId)) return;

                    const pendingEntries = Array.from(pendingOutgoingRef.current.entries());
                    const matchedPending = pendingEntries.find(([, pending]) =>
                        pending?.conversationId === String(activeConversationId) &&
                        pending?.senderId === currentUserId &&
                        String(pending?.text || '').trim() === String(normalized?.content || '').trim()
                    );

                    if (matchedPending) {
                        const [tempId, pendingData] = matchedPending;
                        if (pendingData?.timeoutId) {
                            clearTimeout(pendingData.timeoutId);
                        }
                        pendingOutgoingRef.current.delete(tempId);
                        setMessages((prev) => prev.filter((item) => item.id !== tempId));
                    }

                    mergeMessages([normalized]);
                    markAsRead(activeConversationId);
                };

                SocketService.on('new-message', realtimeMessageHandler);
                SocketService.on('message:new', realtimeMessageHandler);
                SocketService.on('newMessage', realtimeMessageHandler);
                SocketService.on('message:created', realtimeMessageHandler);
            } catch (error) {
                console.error('❌ Init chat detail error:', error);
                Alert.alert('Lỗi', error?.message || 'Không thể tải cuộc trò chuyện');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        init();

        return () => {
            isMounted = false;
            if (realtimeMessageHandler) {
                SocketService.off('new-message', realtimeMessageHandler);
                SocketService.off('message:new', realtimeMessageHandler);
                SocketService.off('newMessage', realtimeMessageHandler);
                SocketService.off('message:created', realtimeMessageHandler);
            }

            pendingOutgoingRef.current.forEach((pending) => {
                if (pending?.timeoutId) {
                    clearTimeout(pending.timeoutId);
                }
            });
            pendingOutgoingRef.current.clear();

            if (conversationId) {
                SocketService.leaveConversation(conversationId);
            }
        };
    }, [conversationId, currentUserId, ensureConversation, loadMessages, markAsRead, mergeMessages, token]);

    useEffect(() => {
        if (messages.length > 0) {
            requestAnimationFrame(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            });
        }
    }, [messages]);

    const sendMessage = async () => {
        const content = inputText.trim();
        if (!content || sending) return;

        try {
            setSending(true);

            const activeConversationId = await ensureConversation();
            const normalizedConversationId = toId(activeConversationId);
            if (isInvalidId(normalizedConversationId)) {
                throw new Error('Không tìm thấy hội thoại hợp lệ');
            }

            const tempMessage = {
                id: `temp-${Date.now()}`,
                conversationId: normalizedConversationId,
                senderId: currentUserId,
                content,
                createdAt: new Date().toISOString(),
                pending: true,
            };

            mergeMessages([tempMessage]);
            setInputText('');

            const socket = SocketService.getSocket();

            if (socket?.connected) {
                const timeoutId = setTimeout(async () => {
                    // If no realtime ack received in time, fallback to HTTP once
                    if (!pendingOutgoingRef.current.has(tempMessage.id)) return;

                    try {
                        const response = await MessageAPI.sendMessage(normalizedConversationId, content);
                        const serverMessage = response?.message;

                        pendingOutgoingRef.current.delete(tempMessage.id);
                        setMessages((prev) => prev.filter((item) => item.id !== tempMessage.id));

                        if (serverMessage?.id) {
                            mergeMessages([serverMessage]);
                        }
                    } catch (fallbackError) {
                        pendingOutgoingRef.current.delete(tempMessage.id);
                        console.error('❌ HTTP fallback send error:', fallbackError);
                    }
                }, 4000);

                pendingOutgoingRef.current.set(tempMessage.id, {
                    conversationId: normalizedConversationId,
                    senderId: currentUserId,
                    text: content,
                    timeoutId,
                });

                SocketService.sendRealtimeMessage({
                    conversationId: normalizedConversationId,
                    senderId: currentUserId,
                    text: content,
                    attachments: [],
                });
            } else {
                const response = await MessageAPI.sendMessage(normalizedConversationId, content);
                const serverMessage = response?.message;

                setMessages((prev) => prev.filter((item) => item.id !== tempMessage.id));
                if (serverMessage?.id) {
                    mergeMessages([serverMessage]);
                }
            }
        } catch (error) {
            console.error('❌ Send message error:', error);
            const debugInfo = error?.responseData ? `\n\nChi tiết: ${JSON.stringify(error.responseData)}` : '';
            Alert.alert('Lỗi', `${error?.message || 'Gửi tin nhắn thất bại'}${debugInfo}`);
        } finally {
            setSending(false);
        }
    };

    const renderMessageItem = ({ item }) => {
        const isMine = String(item.senderId || '') === currentUserId;

        return (
            <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                    {item.content}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{targetUserName || 'Tin nhắn'}</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={[...messages].reverse()}
                    inverted
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    renderItem={renderMessageItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
                            <Text style={styles.emptySubText}>Hãy bắt đầu cuộc trò chuyện.</Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, sending && styles.disabledSendButton]} disabled={sending}>
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageList: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.gray,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: 'white',
    },
    theirMessageText: {
        color: COLORS.text,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.gray,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 12,
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSendButton: {
        opacity: 0.6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.secondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    emptySubText: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.secondary,
    },
});
