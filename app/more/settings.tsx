import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, List, Switch } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/useThemeStore';
// Note: We need a theme store or context to toggle theme. 
// For now, I'll mock the toggle or look for existing theme store.
// If none exists, I'll create a placeholder implementation or just valid visual toggle.

export default function SettingsScreen() {
    const theme = useTheme();
    const { theme: storeTheme, setThemeMode } = useThemeStore();
    const isDarkMode = storeTheme === 'dark';

    const toggleTheme = () => {
        setThemeMode(isDarkMode ? 'light' : 'dark');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Settings' }} />

            <List.Section>
                <List.Subheader>Appearance</List.Subheader>
                <List.Item
                    title="Dark Mode"
                    left={() => <List.Icon icon="theme-light-dark" />}
                    right={() => (
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                        />
                    )}
                />
            </List.Section>

            <List.Section>
                <List.Subheader>General</List.Subheader>
                <List.Item
                    title="Version"
                    description="1.0.0"
                    left={() => <List.Icon icon="information" />}
                />
            </List.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
