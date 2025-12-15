// More Screen

import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button, Card, Avatar, Divider } from 'react-native-paper';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'expo-router';

export default function MoreScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { user, logout, isLoading } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* User Profile Card */}
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.profileHeader}>
                        <Avatar.Text
                            size={64}
                            label={user?.email?.charAt(0).toUpperCase() || 'U'}
                            style={{ backgroundColor: theme.colors.primary }}
                        />
                        <View style={styles.profileInfo}>
                            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                                {user?.user_metadata?.full_name || 'User'}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                {user?.email}
                            </Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* Menu Items */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
                        Menu
                    </Text>

                    <Button
                        mode="outlined"
                        icon="account"
                        onPress={() => router.push('/more/profile')}
                        style={styles.menuButton}
                        contentStyle={styles.menuButtonContent}
                    >
                        Profile Settings
                    </Button>

                    <Button
                        mode="outlined"
                        icon="store"
                        onPress={() => router.push('/more/locations')}
                        style={styles.menuButton}
                        contentStyle={styles.menuButtonContent}
                    >
                        Locations
                    </Button>

                    <Button
                        mode="outlined"
                        icon="cog"
                        onPress={() => router.push('/more/settings')}
                        style={styles.menuButton}
                        contentStyle={styles.menuButtonContent}
                    >
                        App Settings
                    </Button>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* Logout Button */}
            <Card style={styles.card}>
                <Card.Content>
                    <Button
                        mode="contained"
                        icon="logout"
                        onPress={handleLogout}
                        loading={isLoading}
                        disabled={isLoading}
                        buttonColor={theme.colors.error}
                        style={styles.logoutButton}
                        contentStyle={styles.menuButtonContent}
                    >
                        Logout
                    </Button>
                </Card.Content>
            </Card>

            {/* App Info */}
            <View style={styles.footer}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    POS Mobile v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        margin: 16,
        marginBottom: 0,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    divider: {
        marginVertical: 16,
    },
    menuButton: {
        marginBottom: 12,
    },
    menuButtonContent: {
        paddingVertical: 8,
        justifyContent: 'flex-start',
    },
    logoutButton: {
        marginTop: 8,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
});
