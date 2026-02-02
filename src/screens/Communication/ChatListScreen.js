import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';

const MOCK_CHATS = [
    { id: '1', user: 'Nguyễn Văn B', lastMessage: 'Xe này còn không bạn?', time: '10:30', avatar: 'https://via.placeholder.com/50' },
    { id: '2', user: 'Shop Xe Đạp X', lastMessage: 'Giá đó đã bao gồm phí ship chưa?', time: 'Hôm qua', avatar: 'https://via.placeholder.com/50' },
];

export default function ChatListScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tin nhắn</Text>
            </View>

            <FlatList
                data={MOCK_CHATS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => navigation.navigate('ChatDetail', { user: item.user })}
                    >
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={styles.content}>
                            <View style={styles.row}>
                                <Text style={styles.name}>{item.user}</Text>
                                <Text style={styles.time}>{item.time}</Text>
                            </View>
                            <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
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
    },
});
