// Protected Route Wrapper Component

import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const theme = useTheme();
    const { user, isInitialized } = useAuthStore();

    useEffect(() => {
        if (isInitialized && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, isInitialized]);

    if (!isInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
