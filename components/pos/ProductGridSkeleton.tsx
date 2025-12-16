
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, Card } from 'react-native-paper';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProductGridSkeleton() {
    const theme = useTheme();
    // Generate dummy data for 8 skeleton items
    const dummyData = Array.from({ length: 8 }).map((_, i) => ({ id: `skeleton-${i}` }));

    return (
        <FlatList
            data={dummyData}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={{ justifyContent: 'space-between', gap: 8 }}
            renderItem={() => (
                <Card style={styles.card}>
                    <View style={styles.imageContainer}>
                        <Skeleton height={140} borderRadius={12} />
                    </View>
                    <Card.Content style={styles.content}>
                        <Skeleton width="80%" height={16} style={{ marginBottom: 4 }} />
                        <Skeleton width="40%" height={20} />
                    </Card.Content>
                </Card>
            )}
        />
    );
}

const styles = StyleSheet.create({
    grid: {
        padding: 8,
    },
    card: {
        flex: 1,
        marginBottom: 8,
        borderRadius: 12,
        elevation: 2,
    },
    imageContainer: {
        height: 140,
        backgroundColor: '#eee',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    content: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
});
