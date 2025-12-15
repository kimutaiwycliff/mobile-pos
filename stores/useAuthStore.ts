// Auth Store - Zustand

import { create } from 'zustand';
import { supabase, getCurrentUser, getCurrentSession, signOut as supabaseSignOut } from '@/lib/supabase/client';
import { User, Session } from '@/types/database.types';
import { authStorage, STORAGE_KEYS } from '@/lib/storage/mmkv';

interface AuthStore {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    session: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    login: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user && data.session) {
                set({
                    user: data.user as User,
                    session: data.session as Session,
                    isLoading: false,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to login',
                isLoading: false,
            });
            throw error;
        }
    },

    signup: async (email: string, password: string, fullName?: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            if (data.user && data.session) {
                set({
                    user: data.user as User,
                    session: data.session as Session,
                    isLoading: false,
                });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Failed to sign up',
                isLoading: false,
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true, error: null });

            await supabaseSignOut();

            // Clear auth storage
            authStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
            authStorage.remove(STORAGE_KEYS.AUTH_USER);

            set({
                user: null,
                session: null,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Failed to logout',
                isLoading: false,
            });
            throw error;
        }
    },

    refreshSession: async () => {
        try {
            const { data, error } = await supabase.auth.refreshSession();

            if (error) throw error;

            if (data.session) {
                set({
                    session: data.session as Session,
                    user: data.session.user as User,
                });
            }
        } catch (error: any) {
            console.error('Failed to refresh session:', error);
            // If refresh fails, clear the session
            set({
                user: null,
                session: null,
            });
        }
    },

    initializeAuth: async () => {
        try {
            set({ isLoading: true });

            // Check for existing session
            const session = await getCurrentSession();

            if (session) {
                const user = await getCurrentUser();
                set({
                    user: user as User,
                    session: session as Session,
                    isInitialized: true,
                    isLoading: false,
                });
            } else {
                set({
                    user: null,
                    session: null,
                    isInitialized: true,
                    isLoading: false,
                });
            }
        } catch (error: any) {
            console.error('Failed to initialize auth:', error);
            set({
                user: null,
                session: null,
                isInitialized: true,
                isLoading: false,
            });
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        useAuthStore.setState({
            user: session.user as User,
            session: session as Session,
        });
    } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
            user: null,
            session: null,
        });
    } else if (event === 'TOKEN_REFRESHED' && session) {
        useAuthStore.setState({
            session: session as Session,
            user: session.user as User,
        });
    }
});
