import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, Chip, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/lib/api/orders';
import { Order } from '@/types/database.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface LayawayListProps {
    onOrderPress: (order: Order) => void;
}

export function LayawayList({ onOrderPress }: LayawayListProps) {
    const theme = useTheme();

    const { data: orders = [], isLoading, refetch } = useQuery({
        queryKey: ['orders', 'layaway'],
        queryFn: () => getOrders('layaway'),
    });

    const renderItem = ({ item }: { item: Order }) => {
        const balance = item.total_amount - item.paid_amount;
        const percentPaid = (item.paid_amount / item.total_amount) * 100;
        const isOverdue = item.layaway_due_date ? new Date(item.layaway_due_date) < new Date() : false;

        return (
            <Card style={styles.card} onPress={() => onOrderPress(item)}>
                <Card.Content>
                    <View style={styles.row}>
                        <View>
                            <Text variant="titleMedium">{item.layaway_customer_name || 'Unknown Customer'}</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                {item.layaway_customer_phone || 'No Phone'}
                            </Text>
                        </View>
                        <Chip
                            textStyle={{ fontSize: 10, lineHeight: 10 }}
                            style={{ height: 24, backgroundColor: isOverdue ? theme.colors.errorContainer : theme.colors.primaryContainer }}
                        >
                            {isOverdue ? 'Overdue' : 'Active'}
                        </Chip>
                    </View>

                    <View style={[styles.row, { marginTop: 12 }]}>
                        <View>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Order Total</Text>
                            <Text variant="titleSmall">{formatCurrency(item.total_amount)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Balance Due</Text>
                            <Text variant="titleSmall" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                                {formatCurrency(balance)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${percentPaid}%`, backgroundColor: theme.colors.primary }]} />
                    </View>

                    <View style={styles.row}>
                        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                            Paid: {Math.round(percentPaid)}%
                        </Text>
                        {item.layaway_due_date && (
                            <Text variant="labelSmall" style={{ color: isOverdue ? theme.colors.error : theme.colors.outline }}>
                                Due: {formatDate(item.layaway_due_date)}
                            </Text>
                        )}
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.empty}>
                            <Text style={{ color: theme.colors.outline }}>No active layaway orders</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginVertical: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
});
