// Supabase Client Configuration

import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';

// Initialize MMKV storage for Supabase auth
const storage = createMMKV({
    id: 'supabase-storage',
});

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Custom storage adapter for MMKV
const MMKVStorageAdapter = {
    getItem: (key: string) => {
        const value = storage.getString(key);
        return value || null;
    },
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    removeItem: (key: string) => {
        storage.remove(key);
    },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: MMKVStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Helper function to get current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

// Helper function to get current session
export const getCurrentSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

// Helper function to sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
