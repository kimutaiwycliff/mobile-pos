// MMKV Storage Configuration

import { createMMKV } from 'react-native-mmkv';

// Create MMKV instances for different purposes
export const storage = createMMKV({
    id: 'app-storage',
});

export const authStorage = createMMKV({
    id: 'auth-storage',
});

export const cartStorage = createMMKV({
    id: 'cart-storage',
});

export const settingsStorage = createMMKV({
    id: 'settings-storage',
});

// Storage keys
export const STORAGE_KEYS = {
    // Auth
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',

    // Cart
    CART_ITEMS: 'cart_items',
    CART_CUSTOMER: 'cart_customer',
    CART_LOCATION: 'cart_location',
    CART_NOTES: 'cart_notes',

    // Settings
    THEME: 'theme',
    DEFAULT_LOCATION: 'default_location',
    LANGUAGE: 'language',

    // Other
    LAST_SYNC: 'last_sync',
} as const;

// Helper functions
export const setItem = (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
};

export const getItem = <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

export const removeItem = (key: string) => {
    storage.remove(key);
};

export const clearAll = () => {
    storage.clearAll();
};
