import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const ProductCard = ({ product, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{product.condition}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteBtn}>
                    <Ionicons name="heart-outline" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                    <Text style={styles.location}>{product.location}</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</Text>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '48%', // For grid layout
    },
    imageContainer: {
        height: 140,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.surface,
        padding: 6,
        borderRadius: 20,
    },
    info: {
        padding: 10,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    location: {
        fontSize: 12,
        color: COLORS.secondary,
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.secondary,
        marginLeft: 2,
    },
});

export default ProductCard;
