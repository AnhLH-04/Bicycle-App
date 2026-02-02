import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import AuthAPI from '../../services/api';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use useFocusEffect instead of useEffect to reload when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchUserProfile();
        }, [])
    );

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            
            // Check if user is logged in first
            const isLoggedIn = await AuthAPI.isLoggedIn();
            
            if (!isLoggedIn) {
                console.log('❌ Chưa đăng nhập - không có token');
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await AuthAPI.getProfile();
            
            // Try multiple possible structures
            const userData = response.data?.user || response.user || response.data;
            console.log('👤 Parsed user data:', JSON.stringify(userData, null, 2));
            
            if (userData) {
                setUser(userData);
                console.log('✔️ Đã set user state');
            } else {
                console.error('❌ Không tìm thấy user data trong response!');
            }
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            console.error('📄 Error message:', error.message);
            
            // Try to load cached data
            const cachedUser = await AuthAPI.getStoredUserData();
            console.log('💾 Cached user:', cachedUser ? cachedUser.email : 'null');
            
            if (cachedUser) {
                setUser(cachedUser);
                console.log('✔️ Đã dùng cached user');
            } else {
                setUser(null);
                console.log('❌ Không có cached user');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AuthAPI.signOut();
                            navigation.replace('Welcome');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Đăng xuất thất bại');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="person-circle-outline" size={80} color={COLORS.secondary} />
                    <Text style={styles.errorTitle}>Chưa đăng nhập</Text>
                    <Text style={styles.errorText}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
                    <TouchableOpacity 
                        style={styles.loginButton} 
                        onPress={() => navigation.navigate('Welcome')}
                    >
                        <Text style={styles.loginButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const stats = [
        { label: 'Sold', value: user.reputation?.totalSales || '0', icon: 'bag-handle' },
        { label: 'Bought', value: user.reputation?.totalInspections || '0', icon: 'cart' },
        { label: 'Reviews', value: user.reputation?.totalReviews || '0', icon: 'star' },
    ];

    const renderMenuItem = (icon, title, onPress, badge = null, color = COLORS.text) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[styles.menuTitle, { color }]}>{title}</Text>
            </View>
            <View style={styles.menuRight}>
                {badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} 
                                style={styles.avatar} 
                            />
                            {user.verifiedEmail && (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                                </View>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color={COLORS.warning} />
                                <Text style={styles.ratingText}>{user.reputation?.rating || 0}</Text>
                                <Text style={styles.reviewsText}>({user.reputation?.totalReviews || 0} reviews)</Text>
                            </View>
                            <Text style={styles.memberSince}>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statItem}>
                                <Ionicons name={stat.icon} size={20} color={COLORS.primary} />
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Account Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
                    <View style={styles.menuSection}>
                        {renderMenuItem('person-outline', 'Personal Info', () => { }, null, COLORS.primary)}
                        {renderMenuItem('location-outline', 'Saved Addresses', () => { }, null, COLORS.primary)}
                        {renderMenuItem('card-outline', 'Payment Methods', () => { }, '2', COLORS.primary)}
                        {renderMenuItem('lock-closed-outline', 'Security', () => { }, null, COLORS.primary)}
                    </View>
                </View>

                {/* Transaction Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TRUST & SUPPORT</Text>
                    <View style={styles.menuSection}>
                        {renderMenuItem('receipt-outline', 'Transaction History', () => { }, null, '#4CAF50')}
                        {renderMenuItem('shield-checkmark', 'Inspection Reports', () => { }, null, '#4CAF50')}
                        {renderMenuItem('help-circle-outline', 'Escrow Help Center', () => { }, null, '#4CAF50')}
                    </View>
                </View>

                {/* Activity Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACTIVITY</Text>
                    <View style={styles.menuSection}>
                        {renderMenuItem('bag-handle-outline', 'My Listings', () => { }, '3', '#FF9800')}
                        {renderMenuItem('heart-outline', 'Wishlist', () => navigation.navigate('Wishlist'), null, '#FF9800')}
                        {renderMenuItem('chatbubble-ellipses-outline', 'Messages', () => navigation.navigate('ChatList'), '2', '#FF9800')}
                        {renderMenuItem('notifications-outline', 'Notifications', () => { }, '5', '#FF9800')}
                    </View>
                </View>

                {/* Logout */}
                <View style={styles.section}>
                    <View style={styles.menuSection}>
                        {renderMenuItem('log-out-outline', 'Log Out', handleLogout, null, COLORS.error)}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.surface,
        paddingTop: 20,
        paddingBottom: 24,
        marginBottom: 12,
    },
    profileSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.border,
        borderWidth: 3,
        borderColor: '#fff',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    reviewsText: {
        fontSize: 13,
        color: COLORS.secondary,
    },
    memberSince: {
        fontSize: 12,
        color: COLORS.secondary,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 6,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.secondary,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.secondary,
        paddingHorizontal: 20,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    menuSection: {
        backgroundColor: COLORS.surface,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text,
        flex: 1,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 16,
    },
    errorText: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 8,
        marginBottom: 24,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
