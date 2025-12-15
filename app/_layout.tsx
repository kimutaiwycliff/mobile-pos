// Root Layout - Expo Router

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { queryClient } from '@/lib/api/queryClient';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { lightTheme, darkTheme } from '@/constants/theme';

function RootLayoutNav() {
    const router = useRouter();
    const segments = useSegments();
    const { theme, initializeTheme } = useThemeStore();
    const { user, isInitialized, initializeAuth } = useAuthStore();
    const paperTheme = theme === 'dark' ? darkTheme : lightTheme;

    // Initialize theme and auth on mount
    useEffect(() => {
        initializeTheme();
        initializeAuth();
    }, []);

    // Handle navigation based on auth state
    useEffect(() => {
        if (!isInitialized) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to tabs if authenticated
            router.replace('/(tabs)');
        }
    }, [user, segments, isInitialized]);

    // Show loading screen while initializing
    if (!isInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: paperTheme.colors.background }}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <PaperProvider>
                    <RootLayoutNav />
                </PaperProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
