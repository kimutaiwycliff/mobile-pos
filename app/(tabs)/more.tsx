// More Screen

import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function MoreScreen() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
                More Screen
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                Additional features and settings will be here
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
