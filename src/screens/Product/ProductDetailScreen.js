import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ProductDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { product } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{product.name}</Text>
                        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</Text>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{product.condition}</Text>
                        </View>
                        <View style={styles.location}>
                            <Ionicons name="location-outline" size={16} color={COLORS.secondary} />
                            <Text style={styles.locationText}>{product.location}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.description}>
                        Xe đạp {product.name} chất lượng cao, phù hợp cho nhu cầu đi lại hàng ngày hoặc tập thể thao.
                        Khung sườn chắc chắn, bộ chuyển động mượt mà. Đã bảo dưỡng đầy đủ.
                    </Text>

                    <View style={styles.divider} />

                    {/* Technical Specs */}
                    <Text style={styles.sectionTitle}>Technical Specs</Text>
                    <View style={styles.specsContainer}>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Frame Material</Text>
                            <Text style={styles.specValue}>Fast 12r Carbon</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Groupset</Text>
                            <Text style={styles.specValue}>Shimano Dura-Ace Di2</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Wheelset</Text>
                            <Text style={styles.specValue}>Roval Rapide CLX</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Weight</Text>
                            <Text style={styles.specValue}>7.8 kg</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Braking</Text>
                            <Text style={styles.specValue}>Hydraulic Disc</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Gears</Text>
                            <Text style={styles.specValue}>22 Speed</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Usage History */}
                    <Text style={styles.sectionTitle}>Usage History</Text>
                    <View style={styles.usageContainer}>
                        <View style={styles.usageItem}>
                            <View style={styles.usageIcon}>
                                <Ionicons name="speedometer" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>Miles Logged</Text>
                                <Text style={styles.usageValue}>1,544 km</Text>
                            </View>
                        </View>

                        <View style={styles.usageItem}>
                            <View style={styles.usageIcon}>
                                <Ionicons name="time" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>Last Service</Text>
                                <Text style={styles.usageValue}>2 months ago</Text>
                            </View>
                        </View>

                        <View style={styles.usageItem}>
                            <View style={styles.usageIcon}>
                                <Ionicons name="calendar" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.usageInfo}>
                                <Text style={styles.usageLabel}>Owned Since</Text>
                                <Text style={styles.usageValue}>Sep 14, 2022</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Escrow Protection Info */}
                    <View style={styles.protectionBanner}>
                        <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
                        <View style={styles.protectionText}>
                            <Text style={styles.protectionTitle}>Escrow Protection Enabled</Text>
                            <Text style={styles.protectionDesc}>
                                This bike is part of our escrow protection program. Your payment is held safely and verified independently by our mechanic team.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Người bán</Text>
                    <View style={styles.sellerContainer}>
                        <View style={styles.sellerAvatar}>
                            <Text style={styles.sellerInitial}>S</Text>
                        </View>
                        <View style={styles.sellerInfo}>
                            <Text style={styles.sellerName}>Nguyễn Văn Seller</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color={COLORS.warning} />
                                <Text style={styles.ratingText}>{product.rating} (12 đánh giá)</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.chatButton}
                            onPress={() => navigation.navigate('ChatDetail', { user: product.seller || 'Seller' })}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.compareButton}
                    onPress={() => navigation.navigate('CompareBikes', { bike1: product })}
                >
                    <Ionicons name="git-compare-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.compareText}>So sánh</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.buyButton}
                    onPress={() => navigation.navigate('Checkout', { product })}
                >
                    <Text style={styles.buyText}>Đặt mua ngay</Text>
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
        padding: 16,
        position: 'absolute',
        top: 0, // Should use safe area, but for simplicity
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
    },
    content: {
        padding: 20,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    titleRow: {
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    badge: {
        backgroundColor: COLORS.gray,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 12,
    },
    badgeText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '500',
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        color: COLORS.secondary,
        fontSize: 14,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: COLORS.text,
    },
    description: {
        fontSize: 14,
        color: COLORS.secondary,
        lineHeight: 22,
    },
    sellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sellerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary, // Placeholder
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerInitial: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sellerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.secondary,
        marginLeft: 4,
    },
    chatButton: {
        padding: 10,
        backgroundColor: COLORS.gray,
        borderRadius: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    compareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: 12,
    },
    compareText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buyButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    buyText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    specsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    specLabel: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    specValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    usageContainer: {
        gap: 12,
    },
    usageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    usageIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    usageInfo: {
        flex: 1,
    },
    usageLabel: {
        fontSize: 13,
        color: COLORS.secondary,
        marginBottom: 4,
    },
    usageValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    protectionBanner: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#90caf9',
    },
    protectionText: {
        flex: 1,
    },
    protectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    protectionDesc: {
        fontSize: 13,
        color: COLORS.secondary,
        lineHeight: 20,
    },
});
