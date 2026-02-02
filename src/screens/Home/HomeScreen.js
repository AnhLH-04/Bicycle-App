import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import ProductCard from '../../components/product/ProductCard';

export default function HomeScreen({ navigation }) {
    const renderCategory = ({ item }) => (
        <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.iconContainer}>
                {/* Using standard icons for demo */}
                <Ionicons name="bicycle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={COLORS.secondary} />
                <TextInput
                    style={styles.input}
                    placeholder="Tìm kiếm xe..."
                    placeholderTextColor={COLORS.secondary}
                    onFocus={() => navigation.navigate('Search')} // Go to dedicated search screen
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh mục</Text>
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategory}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                />
            </View>

            <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginBottom: 12 }]}>Xe nổi bật</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={PRODUCTS}
                renderItem={({ item }) => (
                    <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { product: item })} />
                )}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingBottom: 20,
    },
    header: {
        marginBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        marginLeft: 8,
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginLeft: 16,
        marginBottom: 12,
    },
    categoryList: {
        paddingHorizontal: 16,
        gap: 16,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.gray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.text,
        fontWeight: '500',
    },
    productGrid: {
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
});
