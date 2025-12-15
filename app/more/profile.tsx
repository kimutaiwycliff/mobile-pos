import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, useTheme, TextInput, Button, Avatar } from 'react-native-paper';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase/client';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
    const theme = useTheme();
    const { user, refreshSession } = useAuthStore();
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;

            await refreshSession();
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Profile' }} />

            <View style={styles.header}>
                <Avatar.Text
                    size={80}
                    label={user?.email?.charAt(0).toUpperCase() || 'U'}
                    style={{ backgroundColor: theme.colors.primary, marginBottom: 16 }}
                />
                <Text variant="headlineSmall">{user?.email}</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    mode="outlined"
                    style={styles.input}
                />

                <Button
                    mode="contained"
                    onPress={handleUpdateProfile}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Update Profile
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginVertical: 32,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: 8,
    }
});
