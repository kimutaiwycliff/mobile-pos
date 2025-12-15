// Checkout Modal Component

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, TextInput, Divider, RadioButton, Switch, IconButton } from 'react-native-paper';
import { useCartStore } from '@/stores/useCartStore';
import { createOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';
import { Discount } from '@/types/database.types';

interface CheckoutModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSuccess: (orderId: string) => void;
}

export function CheckoutModal({ visible, onDismiss, onSuccess }: CheckoutModalProps) {
    const theme = useTheme();
    const { items, totals, locationId, customerId, notes, clearCart, setDiscountCode } = useCartStore();

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [isLayaway, setIsLayaway] = useState(false);
    const [layawayName, setLayawayName] = useState('');
    const [layawayPhone, setLayawayPhone] = useState('');

    // Discount State
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountInput, setDiscountInput] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cashAmount = parseFloat(cashReceived) || 0;
    const change = cashAmount - totals.total;
    const balance = isLayaway ? Math.max(0, totals.total - cashAmount) : 0;

    const handleApplyDiscount = () => {
        const amount = parseFloat(discountInput);
        if (isNaN(amount) || amount < 0) {
            setError('Invalid discount amount');
            return;
        }

        if (amount > totals.subtotal) {
            setError('Discount cannot exceed subtotal');
            return;
        }

        // Create a manual discount object
        const manualDiscount: Discount = {
            id: `manual_${Date.now()}`,
            code: 'MANUAL',
            name: 'Manual Discount',
            description: 'Manual discount applied at checkout',
            discount_type: 'fixed_amount',
            discount_value: amount,
            min_purchase_amount: null,
            max_discount_amount: null,
            usage_limit: null,
            usage_count: 0,
            per_customer_limit: null,
            start_date: new Date().toISOString(),
            end_date: null,
            is_active: true,
            applies_to: 'all',
            product_ids: [],
            category_ids: [],
            created_at: new Date().toISOString()
        };

        setDiscountCode('MANUAL', manualDiscount);
        setShowDiscountInput(false);
        setDiscountInput('');
        setError(null);
    };

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);
            setError(null);

            // Validate payment
            if (!isLayaway && paymentMethod === 'cash' && cashAmount < totals.total) {
                setError('Cash received is less than total amount');
                return;
            }

            if (isLayaway) {
                if (cashAmount <= 0) {
                    setError('Deposit amount must be greater than 0');
                    return;
                }
                if (!customerId && (!layawayName || !layawayPhone)) {
                    setError('Customer Name and Phone are required for Layaway');
                    return;
                }
            }

            // Calculate Due Date (30 days default)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);

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
                isLayaway,
                layawayCustomerName: layawayName,
                layawayCustomerPhone: layawayPhone,
                layawayDueDate: dueDate,
                layawayDepositPercent: isLayaway ? (cashAmount / totals.total) * 100 : undefined
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

                        {/* Discount Section */}
                        {totals.totalDiscount > 0 && (
                            <View style={styles.row}>
                                <Text style={{ color: theme.colors.error }}>Discount:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: theme.colors.error, marginRight: 8 }}>
                                        -{formatCurrency(totals.totalDiscount)}
                                    </Text>
                                    <IconButton
                                        icon="close-circle"
                                        size={16}
                                        iconColor={theme.colors.error}
                                        onPress={() => setDiscountCode(null, null)}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Add Discount Toggle */}
                        {totals.totalDiscount === 0 && !showDiscountInput && (
                            <Button
                                mode="text"
                                compact
                                onPress={() => setShowDiscountInput(true)}
                                style={{ alignSelf: 'flex-start', marginLeft: -8 }}
                            >
                                + Add Discount
                            </Button>
                        )}

                        {/* Discount Input */}
                        {showDiscountInput && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <TextInput
                                    label="Discount Amount"
                                    value={discountInput}
                                    onChangeText={setDiscountInput}
                                    keyboardType="numeric"
                                    mode="outlined"
                                    style={{ flex: 1, height: 40 }}
                                    dense
                                />
                                <Button mode="contained-tonal" onPress={handleApplyDiscount}>
                                    Apply
                                </Button>
                                <IconButton icon="close" onPress={() => setShowDiscountInput(false)} />
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

                    {/* Layaway Toggle */}
                    <View style={[styles.section, styles.row, { alignItems: 'center' }]}>
                        <Text variant="titleMedium">Layaway Order</Text>
                        <Switch value={isLayaway} onValueChange={setIsLayaway} />
                    </View>
                    <Divider />

                    {/* Layaway Details */}
                    {isLayaway && (
                        <View style={styles.section}>
                            <TextInput
                                label="Customer Name"
                                value={layawayName}
                                onChangeText={setLayawayName}
                                mode="outlined"
                                style={{ marginBottom: 12 }}
                            />
                            <TextInput
                                label="Customer Phone"
                                value={layawayPhone}
                                onChangeText={setLayawayPhone}
                                keyboardType="phone-pad"
                                mode="outlined"
                                style={{ marginBottom: 12 }}
                            />
                            <Text variant="bodySmall" style={{ marginBottom: 12 }}>
                                Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </Text>
                        </View>
                    )}

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

                    {/* Payment Details (Cash or Deposit) */}
                    {(paymentMethod === 'cash' || isLayaway) && (
                        <>
                            <Divider />
                            <View style={styles.section}>
                                <TextInput
                                    label={isLayaway ? "Deposit Amount" : "Cash Received"}
                                    value={cashReceived}
                                    onChangeText={setCashReceived}
                                    keyboardType="numeric"
                                    mode="outlined"
                                    disabled={isProcessing}
                                    style={{ marginBottom: 16 }}
                                />

                                {!isLayaway && cashAmount > 0 && (
                                    <View style={styles.row}>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                                            Change:
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: change >= 0 ? theme.colors.primary : theme.colors.error, fontWeight: 'bold' }}>
                                            {formatCurrency(Math.max(0, change))}
                                        </Text>
                                    </View>
                                )}

                                {isLayaway && (
                                    <View style={styles.row}>
                                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                                            Balance Due:
                                        </Text>
                                        <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                                            {formatCurrency(balance)}
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
                        <Button mode="outlined" onPress={onDismiss} disabled={isProcessing} style={{ flex: 1 }}>
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCheckout}
                            loading={isProcessing}
                            disabled={isProcessing || (!isLayaway && paymentMethod === 'cash' && cashAmount < totals.total)}
                            style={{ flex: 1 }}
                        >
                            {isLayaway ? 'Create Layaway' : 'Complete Order'}
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
        alignItems: 'center',
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
