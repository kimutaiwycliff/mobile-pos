// Signup Screen

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function SignupScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { signup, isLoading, error, clearError } = useAuthStore();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullNameError, setFullNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignup = async () => {
        // Clear previous errors
        setFullNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        clearError();

        // Validate inputs
        let hasError = false;

        if (!fullName.trim()) {
            setFullNameError('Full name is required');
            hasError = true;
        }

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

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        try {
            await signup(email, password, fullName);
            // Navigation will be handled by the root layout based on auth state
        } catch (err) {
            // Error is already set in the store
            console.error('Signup error:', err);
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
                            Create your account
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                            <Text style={{ color: theme.colors.error }}>{error}</Text>
                        </View>
                    )}

                    {/* Full Name Input */}
                    <TextInput
                        label="Full Name"
                        value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            setFullNameError('');
                            clearError();
                        }}
                        mode="outlined"
                        autoCapitalize="words"
                        autoComplete="name"
                        error={!!fullNameError}
                        style={styles.input}
                        disabled={isLoading}
                    />
                    <HelperText type="error" visible={!!fullNameError}>
                        {fullNameError}
                    </HelperText>

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
                        autoComplete="password-new"
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

                    {/* Confirm Password Input */}
                    <TextInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setConfirmPasswordError('');
                            clearError();
                        }}
                        mode="outlined"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="password-new"
                        error={!!confirmPasswordError}
                        style={styles.input}
                        disabled={isLoading}
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        }
                    />
                    <HelperText type="error" visible={!!confirmPasswordError}>
                        {confirmPasswordError}
                    </HelperText>

                    {/* Sign Up Button */}
                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                    >
                        Sign Up
                    </Button>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                            Already have an account?{' '}
                        </Text>
                        <Button
                            mode="text"
                            onPress={() => router.push('/(auth)/login')}
                            disabled={isLoading}
                            compact
                        >
                            Sign In
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
