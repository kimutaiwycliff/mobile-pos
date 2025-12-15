// Theme Configuration - React Native Paper

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Light Theme
export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6200EE',
        primaryContainer: '#BB86FC',
        secondary: '#03DAC6',
        secondaryContainer: '#018786',
        tertiary: '#FF6F00',
        error: '#B00020',
        errorContainer: '#F9DEDC',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        surfaceVariant: '#F5F5F5',
        onPrimary: '#FFFFFF',
        onSecondary: '#000000',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#FFFFFF',
        outline: '#CCCCCC',
        outlineVariant: '#E0E0E0',
        inverseSurface: '#121212',
        inverseOnSurface: '#FFFFFF',
        inversePrimary: '#BB86FC',
        shadow: '#000000',
        scrim: '#000000',
        backdrop: 'rgba(0, 0, 0, 0.4)',
    },
};

// Dark Theme
export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#BB86FC',
        primaryContainer: '#3700B3',
        secondary: '#03DAC6',
        secondaryContainer: '#005B4F',
        tertiary: '#FFB74D',
        error: '#CF6679',
        errorContainer: '#93000A',
        background: '#121212',
        surface: '#121212',
        surfaceVariant: '#1E1E1E',
        onPrimary: '#000000',
        onSecondary: '#000000',
        onBackground: '#FFFFFF',
        onSurface: '#FFFFFF',
        onError: '#000000',
        outline: '#444444',
        outlineVariant: '#333333',
        inverseSurface: '#FFFFFF',
        inverseOnSurface: '#000000',
        inversePrimary: '#6200EE',
        shadow: '#000000',
        scrim: '#000000',
        backdrop: 'rgba(0, 0, 0, 0.6)',
    },
};

// Color constants for custom components
export const Colors = {
    light: {
        text: '#000000',
        background: '#FFFFFF',
        card: '#FFFFFF',
        border: '#CCCCCC',
        notification: '#6200EE',
        success: '#4CAF50',
        warning: '#FFA500',
        info: '#2196F3',
    },
    dark: {
        text: '#FFFFFF',
        background: '#121212',
        card: '#1E1E1E',
        border: '#444444',
        notification: '#BB86FC',
        success: '#66BB6A',
        warning: '#FFB74D',
        info: '#42A5F5',
    },
};
