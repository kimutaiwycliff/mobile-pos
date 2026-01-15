import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, Divider, Card, Chip } from 'react-native-paper';
import { Order } from '@/types/database.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface OrderDetailsModalProps {
    visible: boolean;
    onDismiss: () => void;
    order: Order | null;
}

export function OrderDetailsModal({ visible, onDismiss, order }: OrderDetailsModalProps) {
    const theme = useTheme();

    if (!order) return null;

    const balance = order.total_amount - (order.paid_amount || 0);

    // Get payment methods from payments if available
    const paymentMethods = order.payments?.map(p => ({
        method: p.payment_method,
        amount: p.amount,
    })) || [];

    // If no detailed payments, infer from paid_amount
    const hasPayments = paymentMethods.length > 0;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                            Order Details
                        </Text>
                        <Chip
                            mode="flat"
                            style={{
                                backgroundColor: order.status === 'completed' 
                                    ? theme.colors.primaryContainer 
                                    : order.status === 'layaway' 
                                    ? theme.colors.secondaryContainer 
                                    : theme.colors.errorContainer
                            }}
                        >
                            {order.status.toUpperCase()}
                        </Chip>
                    </View>

                    {/* Order Info */}
                    <View style={styles.section}>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Order Number
                        </Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>
                            {order.order_number}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                            {formatDate(order.created_at)}
                        </Text>
                    </View>

                    <Divider />

                    {/* Customer Info */}
                    {(order.layaway_customer_name || order.customer) && (
                        <>
                            <View style={styles.section}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                                    Customer
                                </Text>
                                <Text variant="bodyMedium">
                                    {order.layaway_customer_name || 
                                     (order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Walk-in')}
                                </Text>
                                {order.layaway_customer_phone && (
                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                        {order.layaway_customer_phone}
                                    </Text>
                                )}
                                {order.layaway_due_date && (
                                    <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                                        Due: {new Date(order.layaway_due_date).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                            <Divider />
                        </>
                    )}

                    {/* Order Items */}
                    <View style={styles.section}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                            Items
                        </Text>
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <Card key={item.id} style={styles.itemCard} mode="outlined">
                                    <Card.Content>
                                        <View style={styles.itemRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                                                    {item.product_name}
                                                </Text>
                                                {item.variant_name && (
                                                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                        {item.variant_name}
                                                    </Text>
                                                )}
                                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                                                    SKU: {item.sku}
                                                </Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(item.total_amount)}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                                    {item.quantity} × {formatCurrency(item.unit_price)}
                                                </Text>
                                                {item.discount_amount > 0 && (
                                                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                                                        Discount: -{formatCurrency(item.discount_amount)}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))
                        ) : (
                            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                No item details available
                            </Text>
                        )}
                    </View>

                    <Divider />

                    {/* Pricing Summary */}
                    <View style={styles.section}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                            Pricing Summary
                        </Text>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium">Subtotal</Text>
                            <Text variant="bodyMedium">{formatCurrency(order.subtotal)}</Text>
                        </View>
                        {order.discount_amount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                                    Discount
                                </Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                                    -{formatCurrency(order.discount_amount)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium">Tax</Text>
                            <Text variant="bodyMedium">{formatCurrency(order.tax_amount)}</Text>
                        </View>
                        <Divider style={{ marginVertical: 8 }} />
                        <View style={styles.summaryRow}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                Total
                            </Text>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                {formatCurrency(order.total_amount)}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    {/* Payment Information */}
                    <View style={styles.section}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 12 }}>
                            Payment Information
                        </Text>
                        
                        {hasPayments ? (
                            paymentMethods.map((payment, index) => (
                                <View key={index} style={styles.summaryRow}>
                                    <Text variant="bodyMedium">
                                        {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                    </Text>
                                    <Text variant="bodyMedium">{formatCurrency(payment.amount)}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium">Amount Paid</Text>
                                <Text variant="bodyMedium">{formatCurrency(order.paid_amount || 0)}</Text>
                            </View>
                        )}
                        
                        {balance > 0.01 && (
                            <>
                                <Divider style={{ marginVertical: 8 }} />
                                <View style={styles.summaryRow}>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                                        Balance Due
                                    </Text>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', color: theme.colors.error }}>
                                        {formatCurrency(balance)}
                                    </Text>
                                </View>
                            </>
                        )}
                        
                        {balance <= 0.01 && order.paid_amount > 0 && (
                            <View style={{ marginTop: 8, alignItems: 'center' }}>
                                <Chip icon="check-circle" mode="flat" style={{ backgroundColor: theme.colors.primaryContainer }}>
                                    Fully Paid
                                </Chip>
                            </View>
                        )}
                    </View>

                    {/* Notes */}
                    {order.notes && (
                        <>
                            <Divider />
                            <View style={styles.section}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                                    Notes
                                </Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {order.notes}
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Close Button */}
                    <Button mode="contained" onPress={onDismiss} style={{ marginTop: 16 }}>
                        Close
                    </Button>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        padding: 24,
        borderRadius: 12,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    section: {
        paddingVertical: 16,
    },
    itemCard: {
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
});
