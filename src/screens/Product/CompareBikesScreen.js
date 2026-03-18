import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function CompareBikesScreen({ navigation, route }) {
    // Get bikes from route params or use defaults
    const defaultSpecs = {
        weight: 'N/A',
        frameMaterial: 'N/A',
        groupset: 'N/A',
        wheelset: 'N/A',
        braking: 'N/A',
        gears: 'N/A',
    };

    const bike1Param = route?.params?.bike1;
    const bike2Param = route?.params?.bike2;

    const [bike1, setBike1] = useState({
        id: bike1Param?.id || '1',
        name: bike1Param?.name || 'Specialized Tarmac SL7',
        price: bike1Param?.price || 84200000,
        image: bike1Param?.image || 'https://images.unsplash.com/photo-1485965120184-e224f723d62c?w=500&auto=format&fit=crop&q=60',
        rating: bike1Param?.rating || 4.8,
        condition: bike1Param?.condition || 'Used',
        specs: bike1Param?.specs || defaultSpecs,
    });

    const [bike2, setBike2] = useState({
        id: bike2Param?.id || '2',
        name: bike2Param?.name || 'Cannondale Advanced',
        price: bike2Param?.price || 71000000,
        image: bike2Param?.image || 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop&q=60',
        rating: bike2Param?.rating || 4.5,
        condition: bike2Param?.condition || 'Certified',
        specs: bike2Param?.specs || defaultSpecs,
    });

    const renderComparisonRow = (label, value1, value2, highlight = false) => {
        const isBetter1 = highlight && parseFloat(value1) < parseFloat(value2);
        const isBetter2 = highlight && parseFloat(value2) < parseFloat(value1);

        return (
            <View style={styles.comparisonRow}>
                <View style={[styles.valueCell, isBetter1 && styles.highlightCell]}>
                    <Text style={[styles.valueText, isBetter1 && styles.highlightText]}>{value1}</Text>
                </View>
                <View style={styles.labelCell}>
                    <Text style={styles.labelText}>{label}</Text>
                </View>
                <View style={[styles.valueCell, isBetter2 && styles.highlightCell]}>
                    <Text style={[styles.valueText, isBetter2 && styles.highlightText]}>{value2}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Compare Bikes</Text>
                <TouchableOpacity style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Bike Images & Names */}
                <View style={styles.bikesHeader}>
                    <View style={styles.bikeCard}>
                        <Image source={{ uri: bike1.image }} style={styles.bikeImage} resizeMode="cover" />
                        <View style={styles.bikeInfo}>
                            <Text style={styles.bikeName} numberOfLines={2}>{bike1.name}</Text>
                            <Text style={styles.bikePrice}>{bike1.price.toLocaleString('vi-VN')}₫</Text>
                            <View style={styles.bikeRating}>
                                <Ionicons name="star" size={14} color={COLORS.warning} />
                                <Text style={styles.ratingText}>{bike1.rating}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bikeCard}>
                        <Image source={{ uri: bike2.image }} style={styles.bikeImage} resizeMode="cover" />
                        <View style={styles.bikeInfo}>
                            <Text style={styles.bikeName} numberOfLines={2}>{bike2.name}</Text>
                            <Text style={styles.bikePrice}>{bike2.price.toLocaleString('vi-VN')}₫</Text>
                            <View style={styles.bikeRating}>
                                <Ionicons name="star" size={14} color={COLORS.warning} />
                                <Text style={styles.ratingText}>{bike2.rating}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Price Comparison */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PRICE COMPARISON</Text>
                    {renderComparisonRow('Price', 
                        bike1.price.toLocaleString('vi-VN') + '₫',
                        bike2.price.toLocaleString('vi-VN') + '₫',
                        true
                    )}
                    {renderComparisonRow('Condition', bike1.condition, bike2.condition)}
                </View>

                {/* Technical Specs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
                    {renderComparisonRow('Weight', bike1.specs?.weight || 'N/A', bike2.specs?.weight || 'N/A', true)}
                    {renderComparisonRow('Frame', bike1.specs?.frameMaterial || 'N/A', bike2.specs?.frameMaterial || 'N/A')}
                    {renderComparisonRow('Groupset', bike1.specs?.groupset || 'N/A', bike2.specs?.groupset || 'N/A')}
                    {renderComparisonRow('Wheelset', bike1.specs?.wheelset || 'N/A', bike2.specs?.wheelset || 'N/A')}
                    {renderComparisonRow('Braking', bike1.specs?.braking || 'N/A', bike2.specs?.braking || 'N/A')}
                    {renderComparisonRow('Gears', bike1.specs?.gears || 'N/A', bike2.specs?.gears || 'N/A')}
                </View>

                {/* Rating Comparison */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>RATINGS</Text>
                    {renderComparisonRow('Overall Rating', bike1.rating.toString(), bike2.rating.toString())}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('ProductDetail', { product: bike1 })}
                    >
                        <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('ProductDetail', { product: bike2 })}
                    >
                        <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomButtons}>
                    <TouchableOpacity style={[styles.bottomButton, styles.buyButton]}>
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.bottomButton, styles.cartButton]}>
                        <Text style={styles.cartButtonText}>Live Chat</Text>
                    </TouchableOpacity>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    bikesHeader: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    bikeCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bikeImage: {
        width: '100%',
        height: 120,
    },
    bikeInfo: {
        padding: 12,
    },
    bikeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        height: 36,
    },
    bikePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 6,
    },
    bikeRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        overflow: 'hidden',
    },
    valueCell: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    labelCell: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    labelText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    valueText: {
        fontSize: 12,
        color: COLORS.text,
        textAlign: 'center',
    },
    highlightCell: {
        backgroundColor: '#e3f2fd',
    },
    highlightText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 24,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    bottomButtons: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        marginBottom: 20,
    },
    bottomButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buyButton: {
        backgroundColor: COLORS.primary,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    cartButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
