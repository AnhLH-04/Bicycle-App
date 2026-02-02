import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function CheckoutScreen({ navigation, route }) {
    const { product } = route?.params || {};
    const [selectedProtection, setSelectedProtection] = useState('escrow');

    if (!product) {
        return null;
    }

    const shippingFee = 200000;
    const escrowFee = product.price * 0.02; // 2% escrow fee
    const total = product.price + shippingFee + (selectedProtection === 'escrow' ? escrowFee : 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Secure Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
                    <View style={styles.productCard}>
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productCategory}>{product.category} Bike</Text>
                            <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
                        </View>
                    </View>
                </View>

                {/* Escrow Protection */}
                <View style={styles.section}>
                    <View style={styles.protectionHeader}>
                        <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Escrow Protection</Text>
                    </View>
                    <View style={styles.protectionCard}>
                        <View style={styles.protectionItem}>
                            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                            <View style={styles.protectionText}>
                                <Text style={styles.protectionTitle}>Payment Held</Text>
                                <Text style={styles.protectionDesc}>Your money is safely held by us during the inspection phase</Text>
                            </View>
                        </View>

                        <View style={styles.protectionItem}>
                            <Ionicons name="search" size={20} color={COLORS.primary} />
                            <View style={styles.protectionText}>
                                <Text style={styles.protectionTitle}>Smart Inspection</Text>
                                <Text style={styles.protectionDesc}>A local shop verifies the bike's condition only when you positively verify delivery</Text>
                            </View>
                        </View>

                        <View style={styles.protectionItem}>
                            <Ionicons name="cube" size={20} color={COLORS.primary} />
                            <View style={styles.protectionText}>
                                <Text style={styles.protectionTitle}>Insured Delivery</Text>
                                <Text style={styles.protectionDesc}>Tracked shipping directly to your address</Text>
                            </View>
                        </View>

                        <View style={styles.protectionItem}>
                            <Ionicons name="checkmark-done" size={20} color={COLORS.primary} />
                            <View style={styles.protectionText}>
                                <Text style={styles.protectionTitle}>Funds Released</Text>
                                <Text style={styles.protectionDesc}>After receiving payment only after you positively verify and accept the bike</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.feeNote}>
                        <Text style={styles.feeNoteText}>Protection Fee: {escrowFee.toLocaleString('vi-VN')}₫ (2%)</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
                    
                    <TouchableOpacity style={styles.paymentOption}>
                        <View style={styles.paymentLeft}>
                            <Ionicons name="card" size={24} color={COLORS.primary} />
                            <Text style={styles.paymentText}>Credit/Debit Card</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.paymentOption}>
                        <View style={styles.paymentLeft}>
                            <Ionicons name="wallet" size={24} color={COLORS.primary} />
                            <Text style={styles.paymentText}>E-Wallet (Momo, ZaloPay)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.paymentOption}>
                        <View style={styles.paymentLeft}>
                            <Ionicons name="business" size={24} color={COLORS.primary} />
                            <Text style={styles.paymentText}>Bank Transfer</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TOTAL TO PAY NOW</Text>
                    
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Bike Price</Text>
                        <Text style={styles.priceAmount}>{product.price.toLocaleString('vi-VN')}₫</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Shipping Fee</Text>
                        <Text style={styles.priceAmount}>{shippingFee.toLocaleString('vi-VN')}₫</Text>
                    </View>

                    {selectedProtection === 'escrow' && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Escrow Protection (2%)</Text>
                            <Text style={styles.priceAmount}>{escrowFee.toLocaleString('vi-VN')}₫</Text>
                        </View>
                    )}

                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>{total.toLocaleString('vi-VN')}₫</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Total Payment</Text>
                    <Text style={styles.footerAmount}>{total.toLocaleString('vi-VN')}₫</Text>
                </View>
                <TouchableOpacity 
                    style={styles.proceedButton}
                    onPress={() => navigation.navigate('OrderTracking', { 
                        orderId: 'ORD-' + Date.now(),
                        product 
                    })}
                >
                    <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    section: {
        padding: 16,
        marginTop: 12,
        backgroundColor: COLORS.surface,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    productCard: {
        flexDirection: 'row',
        gap: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 13,
        color: COLORS.secondary,
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    protectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    protectionCard: {
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#cce5ff',
    },
    protectionItem: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    protectionText: {
        flex: 1,
    },
    protectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    protectionDesc: {
        fontSize: 12,
        color: COLORS.secondary,
        lineHeight: 18,
    },
    feeNote: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#fff3cd',
        borderRadius: 8,
    },
    feeNoteText: {
        fontSize: 13,
        color: '#856404',
        fontWeight: '600',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentText: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    priceLabel: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    priceAmount: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    totalRow: {
        borderBottomWidth: 0,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    footer: {
        padding: 16,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    footerLabel: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    footerAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    proceedButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    proceedButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
