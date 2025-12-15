import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, RadioButton, Card, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/stores/useCartStore';
import { Stack } from 'expo-router';

export default function LocationsScreen() {
    const theme = useTheme();
    // Assuming useCartStore holds the current locationId? 
    // If not, we should probably add `setLocationId` to it or a separate store.
    // Checking `useCartStore` implementation, it usually has `locationId`.
    const { locationId, setLocation } = useCartStore();

    const { data: locations, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('is_active', true)
                .order('name');
            if (error) throw error;
            return data;
        }
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Locations' }} />

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    data={locations}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setLocation(item.id)}>
                            <Card style={[
                                styles.card,
                                locationId === item.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                            ]}>
                                <Card.Title
                                    title={item.name}
                                    subtitle={item.address || item.city}
                                    right={(props) => (
                                        <RadioButton
                                            value={item.id}
                                            status={locationId === item.id ? 'checked' : 'unchecked'}
                                            onPress={() => setLocation(item.id)}
                                        />
                                    )}
                                />
                            </Card>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
