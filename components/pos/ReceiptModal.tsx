// Receipt Modal Component

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Share, ActivityIndicator } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, Divider, DataTable } from 'react-native-paper';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { supabase } from '@/lib/supabase/client';
import { Order, OrderItem, Payment } from '@/types/database.types';

interface ReceiptModalProps {
    visible: boolean;
    onDismiss: () => void;
    orderId: string | null;
}

type OrderWithDetails = Order & {
    items: OrderItem[];
    payments: Payment[];
};

export function ReceiptModal({ visible, onDismiss, orderId }: ReceiptModalProps) {
    const theme = useTheme();
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && orderId) {
            fetchOrderDetails(orderId);
        } else {
            setOrder(null);
        }
    }, [visible, orderId]);

    const fetchOrderDetails = async (id: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(*),
                    payments(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data as OrderWithDetails);
        } catch (err) {
            console.error('Error fetching receipt:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!order) return;

        const itemsList = order.items.map(item =>
            `${item.quantity}x ${item.product_name} (${formatCurrency(item.total_amount)})`
        ).join('\n');

        const message = `
Receipt for Order #${order.order_number}
Date: ${new Date(order.created_at).toLocaleString()}

Items:
${itemsList}

Subtotal: ${formatCurrency(order.subtotal)}
Tax: ${formatCurrency(order.tax_amount)}
Discount: -${formatCurrency(order.discount_amount)}
Total: ${formatCurrency(order.total_amount)}

Thank you for shopping with us!
        `.trim();

        try {
            await Share.share({
                message,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (!visible) return null;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ marginTop: 16 }}>Loading Receipt...</Text>
                    </View>
                ) : order ? (
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Text style={{ fontSize: 48 }}>✅</Text>
                            </View>
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Payment Successful</Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                {new Date(order.created_at).toLocaleString()}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Order #{order.order_number}
                            </Text>
                        </View>

                        <Divider style={{ marginVertical: 16 }} />

                        <ScrollView style={styles.scrollContent}>
                            {/* Items Table */}
                            <DataTable>
                                <DataTable.Header>
                                    <DataTable.Title style={{ flex: 2 }}>Item</DataTable.Title>
                                    <DataTable.Title numeric>Qty</DataTable.Title>
                                    <DataTable.Title numeric>Total</DataTable.Title>
                                </DataTable.Header>

                                {order.items.map((item) => (
                                    <DataTable.Row key={item.id}>
                                        <DataTable.Cell style={{ flex: 2 }}>
                                            <Text variant="bodySmall">{item.product_name}</Text>
                                            {item.discount_amount > 0 && (
                                                <Text variant="labelSmall" style={{ color: theme.colors.error }}>
                                                    {'\n'}- {formatCurrency(item.discount_amount)} off
                                                </Text>
                                            )}
                                        </DataTable.Cell>
                                        <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                                        <DataTable.Cell numeric>
                                            <Text variant="bodySmall">{formatCurrency(item.total_amount)}</Text>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                ))}
                            </DataTable>

                            <Divider style={{ marginVertical: 16 }} />

                            {/* Totals */}
                            <View style={styles.row}>
                                <Text variant="bodyMedium">Subtotal</Text>
                                <Text variant="bodyMedium">{formatCurrency(order.subtotal)}</Text>
                            </View>

                            {order.tax_amount > 0 && (
                                <View style={styles.row}>
                                    <Text variant="bodyMedium">Tax (Included)</Text>
                                    <Text variant="bodyMedium">{formatCurrency(order.tax_amount)}</Text>
                                </View>
                            )}

                            {order.discount_amount > 0 && (
                                <View style={styles.row}>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.error }}>Discount</Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                                        -{formatCurrency(order.discount_amount)}
                                    </Text>
                                </View>
                            )}

                            <Divider style={{ marginVertical: 8 }} />

                            <View style={styles.row}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total</Text>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                    {formatCurrency(order.total_amount)}
                                </Text>
                            </View>

                            <Divider style={{ marginVertical: 16 }} />

                            {/* Payments */}
                            <Text variant="labelLarge" style={{ marginBottom: 8 }}>Payment Method</Text>
                            {order.payments.map((p) => (
                                <View key={p.id} style={styles.row}>
                                    <Text variant="bodySmall" style={{ textTransform: 'capitalize' }}>
                                        {p.payment_method}
                                    </Text>
                                    <Text variant="bodySmall">{formatCurrency(p.amount)}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.actions}>
                            <Button
                                mode="outlined"
                                onPress={handleShare}
                                icon="share-variant"
                                style={{ flex: 1, marginRight: 8 }}
                            >
                                Share
                            </Button>

                            <Button
                                mode="contained"
                                onPress={onDismiss}
                                style={{ flex: 1, marginLeft: 8 }}
                            >
                                Done
                            </Button>
                        </View>
                    </View>
                ) : (
                    <View style={styles.errorContainer}>
                        <Text>Failed to load receipt.</Text>
                        <Button onPress={onDismiss}>Close</Button>
                    </View>
                )}
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 16,
        padding: 20,
        height: '85%',
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 8,
    },
    scrollContent: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 8,
    }
});
