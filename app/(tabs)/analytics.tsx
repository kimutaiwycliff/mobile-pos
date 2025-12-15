// Analytics Screen

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, useTheme, Card, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { getSalesMetrics, getSalesTrend, getInventoryMetrics } from '@/lib/api/analytics';
import { formatCurrency } from '@/utils/formatters';
import { useCartStore } from '@/stores/useCartStore';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const theme = useTheme();
    const { locationId } = useCartStore();
    const [period, setPeriod] = useState('week'); // 'week' | 'month'

    // Fetch Sales Metrics
    const { data: sales, isLoading: salesLoading, refetch: refetchSales } = useQuery({
        queryKey: ['analytics', 'sales', locationId, period],
        queryFn: () => getSalesMetrics(locationId, period as any),
    });

    // Fetch Sales Trend
    const { data: trend = [], isLoading: trendLoading, refetch: refetchTrend } = useQuery({
        queryKey: ['analytics', 'trend', locationId, period],
        queryFn: () => getSalesTrend(locationId, period as any),
    });

    // Fetch Inventory Metrics
    const { data: inventory, isLoading: invLoading, refetch: refetchInventory } = useQuery({
        queryKey: ['analytics', 'inventory', locationId],
        queryFn: () => getInventoryMetrics(locationId),
    });

    const isLoading = salesLoading || trendLoading || invLoading;

    const onRefresh = () => {
        refetchSales();
        refetchTrend();
        refetchInventory();
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ marginBottom: 16 }}>Analytics</Text>

                <SegmentedButtons
                    value={period}
                    onValueChange={setPeriod}
                    buttons={[
                        { value: 'week', label: 'Last 7 Days' },
                        { value: 'month', label: 'Last 30 Days' },
                    ]}
                    style={{ marginBottom: 16 }}
                />
            </View>

            {/* Summary Cards */}
            <View style={styles.grid}>
                <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>Total Sales</Text>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>
                            {sales ? formatCurrency(sales.totalSales) : '-'}
                        </Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { backgroundColor: theme.colors.secondaryContainer }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>Orders</Text>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }}>
                            {sales ? sales.totalOrders : '-'}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            <View style={styles.grid}>
                <Card style={[styles.card, { backgroundColor: theme.colors.tertiaryContainer }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onTertiaryContainer }}>Stock Value</Text>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onTertiaryContainer, fontWeight: 'bold' }}>
                            {inventory ? formatCurrency(inventory.totalStockValue) : '-'}
                        </Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Card.Content>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Low Stock</Text>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                            {inventory ? inventory.lowStockCount : '-'}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Sales Trend Chart */}
            <Card style={styles.chartCard}>
                <Card.Content>
                    <Text variant="titleMedium" style={{ marginBottom: 8 }}>Sales Trend</Text>
                    {trendLoading ? (
                        <ActivityIndicator style={{ height: 200 }} />
                    ) : (
                        <View style={{ marginLeft: -20 }}>
                            <VictoryChart
                                width={screenWidth - 48}
                                theme={VictoryTheme.material}
                                domainPadding={{ x: 20 }}
                            >
                                <VictoryAxis
                                    tickFormat={(t) => t} // Already formatted as MMM DD
                                    style={{
                                        tickLabels: { fontSize: 10, padding: 5, angle: -45 }
                                    }}
                                />
                                <VictoryAxis
                                    dependentAxis
                                    tickFormat={(t) => `${t / 1000}k`}
                                    style={{ tickLabels: { fontSize: 10, padding: 5 } }}
                                />
                                <VictoryBar
                                    data={trend}
                                    x="label"
                                    y="amount"
                                    style={{ data: { fill: theme.colors.primary } }}
                                    animate={{
                                        duration: 500,
                                        onLoad: { duration: 500 }
                                    }}
                                />
                            </VictoryChart>
                        </View>
                    )}
                </Card.Content>
            </Card>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 8,
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
    },
    chartCard: {
        marginTop: 8,
        marginBottom: 16,
        paddingVertical: 8,
    }
});
