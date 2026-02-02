import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ChatDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params;

    const [messages, setMessages] = useState([
        { id: '1', text: 'Chào bạn, xe này còn không?', sender: 'me' },
        { id: '2', text: 'Chào, xe vẫn còn nhé!', sender: 'them' },
    ]);
    const [inputText, setInputText] = useState('');

    const sendMessage = () => {
        if (inputText.trim()) {
            setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'me' }]);
            setInputText('');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{user}</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={[...messages].reverse()}
                inverted
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messageList}
                renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMessage : styles.theirMessage]}>
                        <Text style={[styles.messageText, item.sender === 'me' ? styles.myMessageText : styles.theirMessageText]}>
                            {item.text}
                        </Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
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
});
