// Tabs Layout

import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useUserRole } from '@/hooks/useUserRole';

export default function TabsLayout() {
    const theme = useTheme();
    const { isAdmin, isLoading } = useUserRole();

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.outline,
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.onSurface,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'POS',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="point-of-sale" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    href: isAdmin ? '/orders' : null,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="receipt-text" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Inventory',
                    href: isAdmin ? '/inventory' : null,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="package-variant" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    href: isAdmin ? '/analytics' : null,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chart-line" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="menu" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
