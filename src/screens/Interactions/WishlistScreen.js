import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { PRODUCTS } from '../../data/mockData';
import ProductCard from '../../components/product/ProductCard';

export default function WishlistScreen({ navigation }) {
    // Mock wishlist data (subset of products)
    const [wishlist, setWishlist] = useState([PRODUCTS[0], PRODUCTS[1], PRODUCTS[2], PRODUCTS[3]]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const removeFromWishlist = (productId) => {
        setWishlist(wishlist.filter(item => item.id !== productId));
    };

    const renderGridItem = ({ item }) => (
        <View style={styles.gridItemWrapper}>
            <TouchableOpacity 
                style={styles.gridCard}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="cover" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.condition}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.heartButton}
                        onPress={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Ionicons name="heart" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.cardRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                        <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
                    </View>
                    <View style={styles.cardPriceRow}>
                        <Text style={styles.cardPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
                        <View style={styles.cardRating}>
                            <Ionicons name="star" size={12} color={COLORS.warning} />
                            <Text style={styles.cardRatingText}>{item.rating}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeFromWishlist(item.id)}
            >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
        </View>
    );

    const renderListItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.listItem}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
            <Image source={{ uri: item.image }} style={styles.listImage} />
            <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <View style={styles.listMeta}>
                    <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                    <Text style={styles.listLocation}>{item.location}</Text>
                </View>
                <View style={styles.listPriceRow}>
                    <Text style={styles.listPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
                    <View style={styles.listRating}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.listRatingText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.listRemoveButton}
                onPress={() => removeFromWishlist(item.id)}
            >
                <Ionicons name="heart" size={24} color={COLORS.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Wishlist ({wishlist.length})</Text>
                <View style={styles.viewModeButtons}>
                    <TouchableOpacity 
                        style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
                        onPress={() => setViewMode('grid')}
                    >
                        <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#fff' : COLORS.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : COLORS.secondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {wishlist.length > 0 && (
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{wishlist.length}</Text>
                        <Text style={styles.statLabel}>Items</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {(wishlist.reduce((sum, item) => sum + item.price, 0) / 1000000).toFixed(1)}M
                        </Text>
                        <Text style={styles.statLabel}>Total Value</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {(wishlist.reduce((sum, item) => sum + item.rating, 0) / wishlist.length).toFixed(1)}
                        </Text>
                        <Text style={styles.statLabel}>Avg Rating</Text>
                    </View>
                </View>
            )}

            <FlatList
                data={wishlist}
                renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                keyExtractor={item => item.id}
                numColumns={viewMode === 'grid' ? 2 : 1}
                key={viewMode} // Force re-render when changing view mode
                columnWrapperStyle={viewMode === 'grid' ? styles.productGrid : null}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={80} color={COLORS.border} />
                        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                        <Text style={styles.emptyDesc}>Save bikes you like to view them later</Text>
                        <TouchableOpacity 
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.browseButtonText}>Browse Bikes</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {wishlist.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.compareAllButton}>
                        <Ionicons name="git-compare-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.compareAllText}>Compare Selected</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearButton} onPress={() => setWishlist([])}>
                        <Text style={styles.clearText}>Clear All</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    viewModeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    viewModeButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    viewModeButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: 16,
        marginBottom: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.secondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    productGrid: {
        justifyContent: 'space-between',
        gap: 12,
    },
    gridItemWrapper: {
        width: '48%',
        marginBottom: 12,
    },
    gridCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        height: 140,
        position: 'relative',
        backgroundColor: '#f0f0f0',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    cardInfo: {
        padding: 12,
    },
    cardName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardLocation: {
        fontSize: 12,
        color: COLORS.secondary,
        marginLeft: 4,
        flex: 1,
    },
    cardPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cardRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    cardRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        gap: 12,
    },
    listImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
    },
    listInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    listName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    listMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    listLocation: {
        fontSize: 12,
        color: COLORS.secondary,
    },
    listPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    listRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    listRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    listRemoveButton: {
        justifyContent: 'center',
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: COLORS.secondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 12,
    },
    compareAllButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 8,
    },
    compareAllText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: 'bold',
    },
    clearButton: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.error,
        justifyContent: 'center',
    },
    clearText: {
        color: COLORS.error,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
