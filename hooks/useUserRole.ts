import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'manager' | 'cashier' | null;

export function useUserRole() {
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    if (mounted) {
                        setRole(null);
                        setIsLoading(false);
                    }
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user role:', error);
                    // Fallback or handle error
                }

                if (mounted) {
                    setRole((profile?.role as UserRole) || null);
                }
            } catch (err) {
                console.error('Failed to fetch role:', err);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchRole();

        // Optional: Subscribe to changes if roles can change real-time
        // const channel = supabase.channel('user_profiles_role')
        //     .on(...)
        //     .subscribe();

        return () => {
            mounted = false;
        };
    }, []);

    const isAdmin = role === 'admin';
    const isManager = role === 'manager';

    return { role, isAdmin, isManager, isLoading };
}
