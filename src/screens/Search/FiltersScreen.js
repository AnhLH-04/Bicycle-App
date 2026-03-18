import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function FiltersScreen({ navigation, route }) {
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [selectedBikeTypes, setSelectedBikeTypes] = useState([]);
    const [selectedFrameSizes, setSelectedFrameSizes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [inspectedOnly, setInspectedOnly] = useState(false);

    const bikeTypes = ['Road', 'Mountain', 'Hybrid', 'Fixie', 'Gravel', 'Electric'];
    const frameSizes = ['XS', 'S', 'M', 'L', 'XL'];
    const brands = ['Specialized', 'Giant', 'Trek', 'Cannondale', 'Canyon', 'Scott'];

    const toggleSelection = (item, selectedArray, setArray) => {
        if (selectedArray.includes(item)) {
            setArray(selectedArray.filter(i => i !== item));
        } else {
            setArray([...selectedArray, item]);
        }
    };

    const handleApplyFilters = () => {
        const filters = {
            priceRange,
            bikeTypes: selectedBikeTypes,
            frameSizes: selectedFrameSizes,
            brands: selectedBrands,
            inspectedOnly,
        };
        
        // Pass filters back to previous screen
        if (route?.params?.onApplyFilters) {
            route.params.onApplyFilters(filters);
        }
        navigation.goBack();
    };

    const handleReset = () => {
        setPriceRange([0, 50000000]);
        setSelectedBikeTypes([]);
        setSelectedFrameSizes([]);
        setSelectedBrands([]);
        setInspectedOnly(false);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedBikeTypes.length > 0) count++;
        if (selectedFrameSizes.length > 0) count++;
        if (selectedBrands.length > 0) count++;
        if (inspectedOnly) count++;
        if (priceRange[0] > 0 || priceRange[1] < 50000000) count++;
        return count;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Filters</Text>
                <TouchableOpacity onPress={handleReset}>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Inspected Only Toggle */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.inspectedHeader}>
                            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Inspected Bikes Only</Text>
                        </View>
                        <Switch
                            value={inspectedOnly}
                            onValueChange={setInspectedOnly}
                            trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                    <Text style={styles.sectionSubtitle}>Show only bikes verified by professionals</Text>
                </View>

                {/* Price Range */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Price Range</Text>
                    </View>
                    <View style={styles.priceDisplay}>
                        <View style={styles.priceBox}>
                            <Text style={styles.priceLabel}>Min</Text>
                            <Text style={styles.priceValue}>{priceRange[0].toLocaleString('vi-VN')}₫</Text>
                        </View>
                        <View style={styles.priceDivider} />
                        <View style={styles.priceBox}>
                            <Text style={styles.priceLabel}>Max</Text>
                            <Text style={styles.priceValue}>{priceRange[1].toLocaleString('vi-VN')}₫</Text>
                        </View>
                    </View>
                    <View style={styles.priceRangeButtons}>
                        <TouchableOpacity 
                            style={styles.priceRangeBtn}
                            onPress={() => setPriceRange([0, 10000000])}
                        >
                            <Text style={styles.priceRangeBtnText}> 10M</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.priceRangeBtn}
                            onPress={() => setPriceRange([10000000, 25000000])}
                        >
                            <Text style={styles.priceRangeBtnText}>10-25M</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.priceRangeBtn}
                            onPress={() => setPriceRange([25000000, 50000000])}
                        >
                            <Text style={styles.priceRangeBtnText}> 25M</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bike Type */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bike Type</Text>
                        {selectedBikeTypes.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{selectedBikeTypes.length}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.chipsContainer}>
                        {bikeTypes.map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.chip,
                                    selectedBikeTypes.includes(type) && styles.chipSelected
                                ]}
                                onPress={() => toggleSelection(type, selectedBikeTypes, setSelectedBikeTypes)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    selectedBikeTypes.includes(type) && styles.chipTextSelected
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Frame Size */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Frame Size</Text>
                        {selectedFrameSizes.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{selectedFrameSizes.length}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.sizesContainer}>
                        {frameSizes.map(size => (
                            <TouchableOpacity
                                key={size}
                                style={[
                                    styles.sizeBox,
                                    selectedFrameSizes.includes(size) && styles.sizeBoxSelected
                                ]}
                                onPress={() => toggleSelection(size, selectedFrameSizes, setSelectedFrameSizes)}
                            >
                                <Text style={[
                                    styles.sizeText,
                                    selectedFrameSizes.includes(size) && styles.sizeTextSelected
                                ]}>
                                    {size}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Brands */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Brands</Text>
                        {selectedBrands.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{selectedBrands.length}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.brandsContainer}>
                        {brands.map(brand => (
                            <TouchableOpacity
                                key={brand}
                                style={styles.brandItem}
                                onPress={() => toggleSelection(brand, selectedBrands, setSelectedBrands)}
                            >
                                <Text style={styles.brandText}>{brand}</Text>
                                {selectedBrands.includes(brand) ? (
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                                ) : (
                                    <Ionicons name="ellipse-outline" size={24} color={COLORS.border} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer with Apply Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                    <Text style={styles.applyButtonText}>
                        Show {getActiveFiltersCount() > 0 ? `(${getActiveFiltersCount()} filters)` : 'All Bikes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    resetText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    inspectedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: COLORS.secondary,
        marginTop: -8,
    },
    badge: {
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    priceDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    priceBox: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    priceDivider: {
        width: 16,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
    priceLabel: {
        fontSize: 11,
        color: COLORS.secondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    priceRangeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    priceRangeBtn: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    priceRangeBtnText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '600',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    sizesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    sizeBox: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    sizeBoxSelected: {
        backgroundColor: '#e3f2fd',
        borderColor: COLORS.primary,
    },
    sizeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    sizeTextSelected: {
        color: COLORS.primary,
    },
    brandsContainer: {
        gap: 12,
    },
    brandItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    brandText: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
