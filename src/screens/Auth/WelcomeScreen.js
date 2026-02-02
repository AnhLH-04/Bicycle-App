import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo/Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="bicycle" size={80} color={COLORS.primary} />
                    </View>
                    <Text style={styles.brandName}>Bicycle Marketplace</Text>
                    <Text style={styles.tagline}>VeloTrust - Professional Bicycle Marketplace</Text>
                </View>

                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1485965120184-e224f723d62c?w=800&auto=format&fit=crop&q=60' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                        <Text style={styles.overlayTitle}>Ride with Confidence</Text>
                        <Text style={styles.overlaySubtitle}>
                            Verified listings and secure escrow payments for every cyclist.
                        </Text>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                        <Text style={styles.featureText}>Secure Payments</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-done" size={20} color={COLORS.primary} />
                        <Text style={styles.featureText}>Verified Listings</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                        <Text style={styles.featureText}>Buyer Protection</Text>
                    </View>
                </View>

                {/* Contact Info */}
                <View style={styles.contactContainer}>
                    <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={16} color={COLORS.secondary} />
                        <Text style={styles.contactText}>rider@velotrustapp.com</Text>
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.secondaryButtonText}>Register</Text>
                </TouchableOpacity>

                <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Ionicons name="logo-google" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Ionicons name="logo-apple" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: COLORS.secondary,
        textAlign: 'center',
    },
    imageContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 16,
    },
    overlayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    overlaySubtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        paddingVertical: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureText: {
        fontSize: 10,
        color: COLORS.secondary,
        marginTop: 4,
        textAlign: 'center',
    },
    contactContainer: {
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 12,
        color: COLORS.secondary,
    },
    footer: {
        padding: 24,
        paddingTop: 0,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});
