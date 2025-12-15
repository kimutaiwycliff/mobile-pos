// Orders Screen

import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function OrdersScreen() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
                Orders Screen
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Order management will be implemented here
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
