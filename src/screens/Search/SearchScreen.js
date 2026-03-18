import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';
import ProductCard from '../../components/product/ProductCard';

export default function SearchScreen({ navigation }) {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    // Simple filter logic
    const filteredProducts = PRODUCTS.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = activeCategory ? p.category === activeCategory : true;
        return matchesQuery && matchesCategory;
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={COLORS.secondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={16} color={COLORS.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity 
                    style={{ marginLeft: 12 }}
                    onPress={() => navigation.navigate('Filters')}
                >
                    <Ionicons name="options-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                    <TouchableOpacity
                        style={[styles.filterChip, !activeCategory && styles.activeChip]}
                        onPress={() => setActiveCategory(null)}
                    >
                        <Text style={[styles.chipText, !activeCategory && styles.activeChipText]}>Tất cả</Text>
                    </TouchableOpacity>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.filterChip, activeCategory === cat.name && styles.activeChip]}
                            onPress={() => setActiveCategory(cat.name)}
                        >
                            <Text style={[styles.chipText, activeCategory === cat.name && styles.activeChipText]}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={({ item }) => (
                    <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { product: item })} />
                )}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Không tìm thấy kết quả nào</Text>
                    </View>
                }
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.text,
    },
    filtersWrapper: {
        paddingVertical: 12,
        backgroundColor: COLORS.background,
    },
    filters: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    activeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.text,
        fontSize: 14,
    },
    activeChipText: {
        color: 'white',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
    },
    productGrid: {
        justifyContent: 'space-between',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: COLORS.secondary,
        fontSize: 16,
    },
});
