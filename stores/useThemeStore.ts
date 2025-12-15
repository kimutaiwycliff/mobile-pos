// Theme Store - Zustand

import { create } from 'zustand';
import { settingsStorage, STORAGE_KEYS } from '@/lib/storage/mmkv';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
    themeMode: ThemeMode;
    theme: 'light' | 'dark';
    setThemeMode: (mode: ThemeMode, systemTheme?: 'light' | 'dark') => void;
    initializeTheme: (systemTheme?: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
    themeMode: 'system',
    theme: 'light',

    setThemeMode: (mode: ThemeMode, systemTheme: 'light' | 'dark' = 'light') => {
        settingsStorage.set(STORAGE_KEYS.THEME, mode);

        // Determine actual theme based on mode
        let actualTheme: 'light' | 'dark' = 'light';
        if (mode === 'system') {
            actualTheme = systemTheme;
        } else {
            actualTheme = mode;
        }

        set({ themeMode: mode, theme: actualTheme });
    },

    initializeTheme: (systemTheme: 'light' | 'dark' = 'light') => {
        const savedMode = settingsStorage.getString(STORAGE_KEYS.THEME) as ThemeMode | undefined;
        const mode = savedMode || 'system';

        // Determine actual theme
        let actualTheme: 'light' | 'dark' = 'light';
        if (mode === 'system') {
            actualTheme = systemTheme;
        } else {
            actualTheme = mode;
        }

        set({ themeMode: mode, theme: actualTheme });
    },
}));
