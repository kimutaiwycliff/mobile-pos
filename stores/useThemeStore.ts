// Theme Store - Zustand

import { create } from 'zustand';
import { settingsStorage, STORAGE_KEYS } from '@/lib/storage/mmkv';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
    themeMode: ThemeMode;
    theme: 'light' | 'dark';
    setThemeMode: (mode: ThemeMode) => void;
    initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
    themeMode: 'system',
    theme: 'light',

    setThemeMode: (mode: ThemeMode) => {
        settingsStorage.set(STORAGE_KEYS.THEME, mode);

        // Determine actual theme based on mode
        let actualTheme: 'light' | 'dark' = 'light';
        if (mode === 'system') {
            const systemTheme = useColorScheme();
            actualTheme = systemTheme === 'dark' ? 'dark' : 'light';
        } else {
            actualTheme = mode;
        }

        set({ themeMode: mode, theme: actualTheme });
    },

    initializeTheme: () => {
        const savedMode = settingsStorage.getString(STORAGE_KEYS.THEME) as ThemeMode | undefined;
        const mode = savedMode || 'system';

        // Determine actual theme
        let actualTheme: 'light' | 'dark' = 'light';
        if (mode === 'system') {
            const systemTheme = useColorScheme();
            actualTheme = systemTheme === 'dark' ? 'dark' : 'light';
        } else {
            actualTheme = mode;
        }

        set({ themeMode: mode, theme: actualTheme });
    },
}));
