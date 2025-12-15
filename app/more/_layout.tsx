import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function MoreLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.onSurface,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitle: 'Back', // Explicit back title
            }}
        >
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="profile" options={{ title: 'Profile' }} />
            <Stack.Screen name="locations" options={{ title: 'Locations' }} />
        </Stack>
    );
}
