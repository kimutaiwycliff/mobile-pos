// Checkout Modal Component

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, TextInput, Divider, RadioButton } from 'react-native-paper';
import { useCartStore } from '@/stores/useCartStore';
import { createOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';

interface CheckoutModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSuccess: (orderId: string) => void;
}

export function CheckoutModal({ visible, onDismiss, onSuccess }: CheckoutModalProps) {
    const theme = useTheme();
    const { items, totals, locationId, customerId, notes, clearCart } = useCartStore();

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cashAmount = parseFloat(cashReceived) || 0;
    const change = cashAmount - totals.total;

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);
            setError(null);

            // Validate payment
            if (paymentMethod === 'cash' && cashAmount < totals.total) {
                setError('Cash received is less than total amount');
                return;
            }

            // Create order
            const result = await createOrder({
                customerId,
                locationId,
                items,
                subtotal: totals.subtotal,
                totalDiscount: totals.totalDiscount,
                taxAmount: totals.taxAmount,
                total: totals.total,
                paymentMethod,
                amountPaid: paymentMethod === 'cash' ? cashAmount : totals.total,
                notes,
            });

            // Clear cart
            clearCart();

            // Notify success
            onSuccess(result.order.id);
            onDismiss();
        } catch (err: any) {
            setError(err.message || 'Failed to process checkout');
            console.error('Checkout error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                <ScrollView>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                            Checkout
                        </Text>
                    </View>

                    <Divider />

                    {/* Order Summary */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
                            Order Summary
                        </Text>

                        <View style={styles.row}>
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>Items:</Text>
                            <Text style={{ color: theme.colors.onSurface }}>{items.length}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>Subtotal:</Text>
                            <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(totals.subtotal)}</Text>
                        </View>

                        {totals.totalDiscount > 0 && (
                            <View style={styles.row}>
                                <Text style={{ color: theme.colors.error }}>Discount:</Text>
                                <Text style={{ color: theme.colors.error }}>-{formatCurrency(totals.totalDiscount)}</Text>
                            </View>
                        )}

                        {totals.taxAmount > 0 && (
                            <View style={styles.row}>
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>Tax:</Text>
                                <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(totals.taxAmount)}</Text>
                            </View>
                        )}

                        <Divider style={{ marginVertical: 12 }} />

                        <View style={styles.row}>
                            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                Total:
                            </Text>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                {formatCurrency(totals.total)}
                            </Text>
                        </View>
                    </View>

                    <Divider />

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
                            Payment Method
                        </Text>

                        <RadioButton.Group value={paymentMethod} onValueChange={setPaymentMethod}>
                            {PAYMENT_METHODS.map((method) => (
                                <RadioButton.Item
                                    key={method.value}
                                    label={method.label}
                                    value={method.value}
                                    disabled={isProcessing}
                                />
                            ))}
                        </RadioButton.Group>
                    </View>

                    {/* Cash Payment Details */}
                    {paymentMethod === 'cash' && (
                        <>
                            <Divider />
                            <View style={styles.section}>
                                <TextInput
                                    label="Cash Received"
                                    value={cashReceived}
                                    onChangeText={setCashReceived}
                                    keyboardType="numeric"
                                    mode="outlined"
                                    disabled={isProcessing}
                                    style={{ marginBottom: 16 }}
                                />

                                {cashAmount > 0 && (
                                    <View style={styles.row}>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                                            Change:
                                        </Text>
                                        <Text
                                            variant="titleMedium"
                                            style={{
                                                color: change >= 0 ? theme.colors.primary : theme.colors.error,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {formatCurrency(Math.max(0, change))}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <View style={[styles.error, { backgroundColor: theme.colors.errorContainer }]}>
                            <Text style={{ color: theme.colors.error }}>{error}</Text>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={onDismiss}
                            disabled={isProcessing}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCheckout}
                            loading={isProcessing}
                            disabled={isProcessing || (paymentMethod === 'cash' && cashAmount < totals.total)}
                            style={{ flex: 1 }}
                        >
                            Complete Order
                        </Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 12,
        maxHeight: '90%',
    },
    header: {
        padding: 20,
    },
    section: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    error: {
        margin: 20,
        padding: 12,
        borderRadius: 8,
    },
    actions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
});
