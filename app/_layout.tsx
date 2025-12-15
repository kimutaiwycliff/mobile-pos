// Root Layout - Expo Router

import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '@/lib/api/queryClient';
import { useThemeStore } from '@/stores/useThemeStore';
import { lightTheme, darkTheme } from '@/constants/theme';

export default function RootLayout() {
    const { theme } = useThemeStore();
    const paperTheme = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <PaperProvider theme={paperTheme}>
                    <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </PaperProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}
