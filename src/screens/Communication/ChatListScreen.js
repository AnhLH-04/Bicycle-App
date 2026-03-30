import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import MessageAPI from '../../services/message.api';
import SocketService from '../../services/socket.service';
import { useAuth } from '../../context/AuthContext';

const getId = (value) => String(value?._id || value?.id || value || '');

const getDisplayName = (user) => {
    if (!user) return 'Người dùng';
    if (typeof user === 'string') return user;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.name || user.email || user.phone || 'Người dùng';
};

const formatChatTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    if (Number.isNaN(date.getTime())) return '';

    const isSameDay =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isSameDay) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export default function ChatListScreen({ navigation }) {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const currentUserId = useMemo(() => getId(user), [user]);

    const loadConversations = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await MessageAPI.getConversations();
            const normalized = response?.conversations || [];

            const sorted = [...normalized].sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );

            setConversations(sorted);
        } catch (error) {
            console.error('❌ Load conversations error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadConversations();
        }, [loadConversations])
    );

    useEffect(() => {
        let isMounted = true;
        let newMessageHandler;

        const setupSocket = async () => {
            try {
                await SocketService.connect({ token, userId: currentUserId });

                newMessageHandler = () => {
                    if (isMounted) {
                        loadConversations(true);
                    }
                };

                SocketService.on('message:new', newMessageHandler);
                SocketService.on('new-message', newMessageHandler);
                SocketService.on('newMessage', newMessageHandler);
                SocketService.on('conversation:updated', newMessageHandler);
                SocketService.on('messages-read', newMessageHandler);
            } catch (error) {
                console.error('❌ Connect socket error (chat list):', error);
            }
        };

        setupSocket();

        return () => {
            isMounted = false;
            if (newMessageHandler) {
                SocketService.off('message:new', newMessageHandler);
                SocketService.off('new-message', newMessageHandler);
                SocketService.off('newMessage', newMessageHandler);
                SocketService.off('conversation:updated', newMessageHandler);
                SocketService.off('messages-read', newMessageHandler);
            }
        };
    }, [token, currentUserId, loadConversations]);

    const renderChatItem = ({ item }) => {
        const participants = Array.isArray(item.participants) ? item.participants : [];
        const otherParticipant =
            participants.find((participant) => getId(participant) !== currentUserId) ||
            participants[0] ||
            null;

        const displayName = item.title || getDisplayName(otherParticipant);
        const avatar = otherParticipant?.avatar || otherParticipant?.profileImage || otherParticipant?.photoURL;
        const unreadCount = Number(item.unreadCount || 0);

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() =>
                    navigation.navigate('ChatDetail', {
                        conversationId: item.id,
                        user: displayName,
                        recipientId: getId(otherParticipant),
                    })
                }
            >
                <Image
                    source={{ uri: avatar || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.time}>{formatChatTime(item.lastMessage?.createdAt || item.updatedAt)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.message} numberOfLines={1}>
                            {item.lastMessage?.content || 'Chưa có tin nhắn'}
                        </Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tin nhắn</Text>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Đang tải hội thoại...</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChatItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadConversations(true)}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerState}>
                            <Text style={styles.stateText}>Chưa có cuộc trò chuyện nào</Text>
                            <Text style={styles.stateSubText}>Bạn có thể bắt đầu nhắn tin từ chi tiết kiểm định hoặc sản phẩm.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.gray,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.text,
    },
    time: {
        fontSize: 12,
        color: COLORS.secondary,
    },
    message: {
        color: COLORS.secondary,
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '700',
    },
    centerState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    stateText: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    stateSubText: {
        marginTop: 8,
        textAlign: 'center',
        color: COLORS.secondary,
    },
});
