// Login Screen

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        // Clear previous errors
        setEmailError('');
        setPasswordError('');
        clearError();

        // Validate inputs
        let hasError = false;

        if (!email) {
            setEmailError('Email is required');
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            hasError = true;
        }

        if (hasError) return;

        try {
            await login(email, password);
            // Navigation will be handled by the root layout based on auth state
        } catch (err) {
            // Error is already set in the store
            console.error('Login error:', err);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Logo/Title */}
                    <View style={styles.header}>
                        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            POS Mobile
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                            Sign in to continue
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                            <Text style={{ color: theme.colors.error }}>{error}</Text>
                        </View>
                    )}

                    {/* Email Input */}
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailError('');
                            clearError();
                        }}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        error={!!emailError}
                        style={styles.input}
                        disabled={isLoading}
                    />
                    <HelperText type="error" visible={!!emailError}>
                        {emailError}
                    </HelperText>

                    {/* Password Input */}
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError('');
                            clearError();
                        }}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                        error={!!passwordError}
                        style={styles.input}
                        disabled={isLoading}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />
                    <HelperText type="error" visible={!!passwordError}>
                        {passwordError}
                    </HelperText>

                    {/* Login Button */}
                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Sign In
                    </Button>

                    {/* Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                            Don't have an account?{' '}
                        </Text>
                        <Button
                            mode="text"
                            onPress={() => router.push('/(auth)/signup')}
                            disabled={isLoading}
                            compact
                        >
                            Sign Up
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    input: {
        marginBottom: 4,
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
});
