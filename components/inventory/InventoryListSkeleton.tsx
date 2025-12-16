
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, Card, Divider } from 'react-native-paper';
import { Skeleton } from '@/components/ui/Skeleton';

export function InventoryListSkeleton() {
    const theme = useTheme();
    const dummyData = Array.from({ length: 10 }).map((_, i) => ({ id: `inv-skeleton-${i}` }));

    return (
        <FlatList
            data={dummyData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={() => (
                <View style={styles.itemContainer}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Skeleton width="60%" height={18} style={{ marginBottom: 6 }} />
                            <Skeleton width="40%" height={14} />
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Skeleton width={60} height={18} style={{ marginBottom: 6 }} />
                            <Skeleton width={80} height={14} />
                        </View>
                    </View>
                    <Divider style={{ marginTop: 12 }} />
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    itemContainer: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
