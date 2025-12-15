// Analytics Screen

import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function AnalyticsScreen() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
                Analytics Screen
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Analytics and reports will be implemented here
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});
