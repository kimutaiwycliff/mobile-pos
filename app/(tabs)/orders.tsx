// Orders Screen

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, useTheme, SegmentedButtons, Card, Button, Portal, Modal, TextInput, Divider, FAB } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { getOrders, addOrderPayment } from '@/lib/api/orders';
import { Order } from '@/types/database.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function OrdersScreen() {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all'); // all, layaway, completed
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

    // Fetch orders
    const { data: orders = [], isLoading, refetch } = useQuery({
        queryKey: ['orders', filter],
        queryFn: () => getOrders(filter === 'all' ? undefined : filter),
    });

    // Payment Mutation
    const payMutation = useMutation({
        mutationFn: async ({ orderId, amount }: { orderId: string; amount: number }) => {
            return addOrderPayment(orderId, amount, 'cash'); // Defaulting to cash for repayment
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setPaymentModalVisible(false);
            setPaymentAmount('');
            setSelectedOrder(null);
        },
        onError: (error) => {
            console.error('Payment failed', error);
            // Handle error (toast?)
        }
    });

    const handlePayBalance = (order: Order) => {
        setSelectedOrder(order);
        setPaymentAmount(''); // Reset
        setPaymentModalVisible(true);
    };

    const submitPayment = () => {
        if (!selectedOrder) return;
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return;

        setIsSubmittingInfo(true);
        payMutation.mutate({ orderId: selectedOrder.id, amount }, {
            onSettled: () => setIsSubmittingInfo(false)
        });
    };

    const renderItem = ({ item }: { item: Order }) => {
        const balance = item.total_amount - (item.paid_amount || 0);
        const isLayaway = item.status === 'layaway';

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.row}>
                        <View>
                            <Text variant="titleMedium">{item.order_number}</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {formatDate(item.created_at)}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                {formatCurrency(item.total_amount)}
                            </Text>
                            <Text
                                variant="labelSmall"
                                style={{
                                    color: item.status === 'completed' ? theme.colors.primary :
                                        item.status === 'layaway' ? theme.colors.secondary : theme.colors.error
                                }}
                            >
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Divider style={{ marginVertical: 12 }} />

                    {/* Layaway / Customer Info */}
                    {(item.layaway_customer_name || item.customer) && (
                        <View style={{ marginBottom: 8 }}>
                            <Text variant="bodyMedium">
                                Customer: {item.layaway_customer_name || (item.customer ? `${item.customer.first_name} ${item.customer.last_name}` : 'Walk-in')}
                            </Text>
                            {isLayaway && item.layaway_due_date && (
                                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                                    Due: {new Date(item.layaway_due_date).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={styles.row}>
                        <Text variant="bodyMedium">Paid: {formatCurrency(item.paid_amount || 0)}</Text>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: balance > 0.01 ? theme.colors.error : theme.colors.primary }}>
                            Balance: {formatCurrency(Math.max(0, balance))}
                        </Text>
                    </View>
                </Card.Content>

                {balance > 0.01 && (
                    <Card.Actions>
                        <Button mode="contained-tonal" onPress={() => handlePayBalance(item)}>
                            Take Payment
                        </Button>
                    </Card.Actions>
                )}
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <SegmentedButtons
                    value={filter}
                    onValueChange={setFilter}
                    buttons={[
                        { value: 'all', label: 'All' },
                        { value: 'layaway', label: 'Layaway' },
                        { value: 'completed', label: 'Completed' },
                    ]}
                />
            </View>

            <FlashList
                data={orders}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text>No orders found</Text>
                    </View>
                }
            />

            {/* Payment Modal */}
            <Portal>
                <Modal
                    visible={paymentModalVisible}
                    onDismiss={() => setPaymentModalVisible(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
                >
                    <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Take Payment</Text>
                    {selectedOrder && (
                        <View>
                            <Text style={{ marginBottom: 16 }}>
                                Balance Due: {formatCurrency(Math.max(0, selectedOrder.total_amount - (selectedOrder.paid_amount || 0)))}
                            </Text>
                            <TextInput
                                label="Amount Received"
                                value={paymentAmount}
                                onChangeText={setPaymentAmount}
                                keyboardType="numeric"
                                mode="outlined"
                                style={{ marginBottom: 16 }}
                            />
                            <View style={styles.modalActions}>
                                <Button onPress={() => setPaymentModalVisible(false)} style={{ flex: 1 }}>Cancel</Button>
                                <Button
                                    mode="contained"
                                    onPress={submitPayment}
                                    loading={isSubmittingInfo}
                                    style={{ flex: 1 }}
                                >
                                    Confirm
                                </Button>
                            </View>
                        </View>
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
    },
    list: {
        paddingHorizontal: 16,
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
    empty: {
        padding: 24,
        alignItems: 'center',
    },
    modal: {
        margin: 20,
        padding: 24,
        borderRadius: 12,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    }
});
