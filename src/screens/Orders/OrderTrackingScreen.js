import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function OrderTrackingScreen({ navigation, route }) {
    const { orderId, product } = route?.params || {};
    
    // Mock order status
    const [orderStatus, setOrderStatus] = useState('inspected');
    
    const statusSteps = [
        { 
            id: 'ordered', 
            label: 'Ordered', 
            icon: 'cart',
            date: 'Oct 16, 10:28 AM',
            description: '4 Barrow payment services',
            completed: true 
        },
        { 
            id: 'inspected', 
            label: 'Inspected', 
            icon: 'checkmark-circle',
            date: 'Oct 18, 3:18 PM',
            description: 'Certified by pro mechanic',
            completed: true 
        },
        { 
            id: 'shipped', 
            label: 'Shipped', 
            icon: 'cube',
            date: 'In Transit',
            description: 'Estimated Oct 18',
            completed: false 
        },
        { 
            id: 'delivered', 
            label: 'Delivered', 
            icon: 'home',
            date: 'Payment will be released after delivery',
            description: '',
            completed: false 
        },
    ];

    const currentStepIndex = statusSteps.findIndex(step => step.id === orderStatus);

    const renderStatusStep = (step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isActive = index === currentStepIndex;
        const isLast = index === statusSteps.length - 1;

        return (
            <View key={step.id} style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                    <View style={[
                        styles.stepDot,
                        isCompleted && styles.stepDotCompleted,
                        isActive && styles.stepDotActive
                    ]}>
                        {isCompleted ? (
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        ) : (
                            <Ionicons name={step.icon} size={20} color={COLORS.secondary} />
                        )}
                    </View>
                    {!isLast && (
                        <View style={[
                            styles.stepLine,
                            isCompleted && styles.stepLineCompleted
                        ]} />
                    )}
                </View>

                <View style={styles.stepContent}>
                    <Text style={[
                        styles.stepLabel,
                        isCompleted && styles.stepLabelCompleted
                    ]}>
                        {step.label}
                    </Text>
                    <Text style={styles.stepDate}>{step.date}</Text>
                    {step.description && (
                        <Text style={styles.stepDescription}>{step.description}</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Tracking</Text>
                <TouchableOpacity>
                    <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order ID */}
                <View style={styles.orderIdSection}>
                    <Text style={styles.orderIdLabel}>ORDER ID</Text>
                    <Text style={styles.orderIdValue}>{orderId || 'ORD-1234567'}</Text>
                </View>

                {/* Product Info */}
                {product && (
                    <View style={styles.productSection}>
                        <Text style={styles.sectionTitle}>ITEM DETAILS</Text>
                        <View style={styles.productCard}>
                            <Image source={{ uri: product.image }} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productPrice}>
                                    {product.price?.toLocaleString('vi-VN')}₫
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Order Status */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>ORDER STATUS</Text>
                    <View style={styles.statusTimeline}>
                        {statusSteps.map((step, index) => renderStatusStep(step, index))}
                    </View>
                </View>

                {/* Escrow Protection */}
                <View style={styles.protectionSection}>
                    <View style={styles.protectionHeader}>
                        <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
                        <Text style={styles.protectionTitle}>ESCROW PROTECTION</Text>
                    </View>
                    <View style={styles.protectionCard}>
                        <View style={styles.protectionItem}>
                            <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
                            <Text style={styles.protectionText}>
                                Your 100% refund is ready. We only release payment after you positively verify and accept the bike.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>DELIVERY INFORMATION</Text>
                    
                    <View style={styles.infoItem}>
                        <Ionicons name="location" size={20} color={COLORS.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Delivery Address</Text>
                            <Text style={styles.infoValue}>123 Nguyễn Huệ, Q1, TP.HCM</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="person" size={20} color={COLORS.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Recipient</Text>
                            <Text style={styles.infoValue}>Nguyễn Văn A</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="call" size={20} color={COLORS.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>+84 123 456 789</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.actionButtonText}>Contact Seller</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.actionButtonText}>Get Help</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Button */}
            {orderStatus === 'shipped' && (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.trackButton}
                        onPress={() => {/* Track delivery */}}
                    >
                        <Ionicons name="navigate" size={20} color="#fff" />
                        <Text style={styles.trackButtonText}>Track Delivery</Text>
                    </TouchableOpacity>
                </View>
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
    orderIdSection: {
        padding: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        marginTop: 12,
    },
    orderIdLabel: {
        fontSize: 12,
        color: COLORS.secondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    orderIdValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    productSection: {
        padding: 16,
        backgroundColor: COLORS.surface,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    productCard: {
        flexDirection: 'row',
        gap: 12,
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statusSection: {
        padding: 16,
        backgroundColor: COLORS.surface,
        marginTop: 12,
    },
    statusTimeline: {
        paddingLeft: 8,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    stepIndicator: {
        alignItems: 'center',
        marginRight: 16,
    },
    stepDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotCompleted: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    stepDotActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        borderWidth: 3,
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.border,
        marginTop: 4,
    },
    stepLineCompleted: {
        backgroundColor: COLORS.primary,
    },
    stepContent: {
        flex: 1,
        paddingTop: 8,
    },
    stepLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 4,
    },
    stepLabelCompleted: {
        color: COLORS.text,
    },
    stepDate: {
        fontSize: 13,
        color: COLORS.secondary,
        marginBottom: 2,
    },
    stepDescription: {
        fontSize: 12,
        color: COLORS.secondary,
        fontStyle: 'italic',
    },
    protectionSection: {
        padding: 16,
        backgroundColor: COLORS.surface,
        marginTop: 12,
    },
    protectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    protectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary,
        letterSpacing: 0.5,
    },
    protectionCard: {
        backgroundColor: '#e8f5e9',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#a5d6a7',
    },
    protectionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    protectionText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 20,
    },
    infoSection: {
        padding: 16,
        backgroundColor: COLORS.surface,
        marginTop: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.secondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    actionsSection: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 8,
    },
    actionButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    trackButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    trackButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
