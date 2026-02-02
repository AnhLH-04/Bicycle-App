import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, 
    ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AuthAPI from '../../services/api';

export default function RegisterScreen({ navigation }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'buyer'
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.phone || !formData.password || !formData.firstName || !formData.lastName) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return false;
        }

        if (formData.password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return false;
        }

        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!phoneRegex.test(formData.phone)) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await AuthAPI.register({
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role
            });

            Alert.alert(
                'Thành công', 
                'Đăng ký tài khoản thành công!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Main')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
                        <Text style={styles.subtitle}>Tạo tài khoản mới trên VeloTrust</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.nameRow}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Tên</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Nhập tên"
                                    placeholderTextColor={COLORS.secondary}
                                    value={formData.firstName}
                                    onChangeText={(text) => handleInputChange('firstName', text)}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Họ</Text>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Nhập họ"
                                    placeholderTextColor={COLORS.secondary}
                                    value={formData.lastName}
                                    onChangeText={(text) => handleInputChange('lastName', text)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="example@email.com"
                                placeholderTextColor={COLORS.secondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="0xxxxxxxxx"
                                placeholderTextColor={COLORS.secondary}
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput 
                                    style={styles.inputWithIcon}
                                    placeholder="Ít nhất 6 ký tự"
                                    placeholderTextColor={COLORS.secondary}
                                    secureTextEntry={!showPassword}
                                    value={formData.password}
                                    onChangeText={(text) => handleInputChange('password', text)}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons 
                                        name={showPassword ? "eye-off" : "eye"} 
                                        size={20} 
                                        color={COLORS.secondary} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput 
                                    style={styles.inputWithIcon}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor={COLORS.secondary}
                                    secureTextEntry={!showConfirmPassword}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? "eye-off" : "eye"} 
                                        size={20} 
                                        color={COLORS.secondary} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.registerButton, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.registerButtonText}>Đăng ký</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    form: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    passwordContainer: {
        position: 'relative',
    },
    inputWithIcon: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 14,
        paddingRight: 50,
        fontSize: 16,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledButton: {
        backgroundColor: COLORS.secondary,
        opacity: 0.6,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: COLORS.secondary,
        fontSize: 14,
    },
    loginLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
