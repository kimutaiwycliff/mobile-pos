// Checkout Modal Component

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, TextInput, Divider, RadioButton, Switch, IconButton } from 'react-native-paper';
import { useCartStore } from '@/stores/useCartStore';
import { createOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/utils/formatters';
import { Discount } from '@/types/database.types';

interface CheckoutModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSuccess: (orderId: string) => void;
}

const PAYMENT_OPTIONS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'split', label: 'Split (Cash & M-Pesa)' },
];

export function CheckoutModal({ visible, onDismiss, onSuccess }: CheckoutModalProps) {
    const theme = useTheme();
    const { items, totals, locationId, customerId, notes, clearCart, setDiscountCode } = useCartStore();

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState('');
    const [mpesaReceived, setMpesaReceived] = useState('');

    const [isLayaway, setIsLayaway] = useState(false);
    const [layawayName, setLayawayName] = useState('');
    const [layawayPhone, setLayawayPhone] = useState('');

    // Discount State
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountInput, setDiscountInput] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cashAmount = parseFloat(cashReceived) || 0;
    const mpesaInputAmount = parseFloat(mpesaReceived) || 0;

    // Calculate detailed totals
    let totalPaid = 0;
    if (paymentMethod === 'cash') {
        // If exact cash or more is given, we just consider it fully paid up to the total
        totalPaid = cashAmount;
    } else if (paymentMethod === 'mpesa') {
        // For M-Pesa, usually we assume exact payment unless Layaway
        // But for consistency let's allow input if it's Layaway, else assume total
        totalPaid = isLayaway ? mpesaInputAmount : totals.total;
    } else if (paymentMethod === 'split') {
        totalPaid = cashAmount + mpesaInputAmount;
    }

    // Change only meaningful for Cash or Split where Cash is involved and total > due
    // But typically change is (Total Paid - Due).
    const change = totalPaid - totals.total;
    const balance = isLayaway ? Math.max(0, totals.total - totalPaid) : 0;

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
            if (!isLayaway) {
                if (paymentMethod === 'cash' && cashAmount < totals.total) { // Accept exact or more
                    // If they leave it empty, cashAmount is 0. 
                    // We probably should enforcement input for Cash payment?
                    // Or if they click "Complete" with 0, maybe they mean exact change?
                    // Let's enforce input for clarity.
                    setError('Cash received is less than total amount');
                    return;
                }
                if (paymentMethod === 'split' && (cashAmount + mpesaInputAmount) < totals.total) {
                    setError('Total payment is less than order total');
                    return;
                }
            }

            if (isLayaway) {
                // Deposit validation
                if (totalPaid <= 0) {
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

            // Construct Payments Array
            const finalPayments = [];
            if (paymentMethod === 'cash') {
                // For non-layaway, we record the order Total as paid amount, even if they gave more (Change)
                // For layaway, we record exactly what they gave as deposit
                const amount = isLayaway ? cashAmount : totals.total;
                finalPayments.push({ paymentMethod: 'cash', amount });
            } else if (paymentMethod === 'mpesa') {
                const amount = isLayaway ? mpesaInputAmount : totals.total;
                finalPayments.push({ paymentMethod: 'mpesa', amount });
            } else if (paymentMethod === 'split') {
                if (cashAmount > 0) finalPayments.push({ paymentMethod: 'cash', amount: cashAmount });
                if (mpesaInputAmount > 0) finalPayments.push({ paymentMethod: 'mpesa', amount: mpesaInputAmount });
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
                // We don't use single paymentMethod/amountPaid anymore in favor of payments array
                // But for backward compat or simplistic logging we can pass primary
                // The updated createOrder uses 'payments' array.
                payments: finalPayments,
                notes,
                isLayaway,
                layawayCustomerName: layawayName,
                layawayCustomerPhone: layawayPhone,
                layawayDueDate: dueDate,
                layawayDepositPercent: isLayaway ? (totalPaid / totals.total) * 100 : undefined
            });

            // Clear cart
            clearCart();
            // Clear local states
            setCashReceived('');
            setMpesaReceived('');
            setPaymentMethod('cash');
            setIsLayaway(false);

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
                            {PAYMENT_OPTIONS.map((method) => (
                                <RadioButton.Item
                                    key={method.value}
                                    label={method.label}
                                    value={method.value}
                                    disabled={isProcessing}
                                />
                            ))}
                        </RadioButton.Group>
                    </View>

                    {/* Payment Inputs */}
                    <View style={styles.section}>
                        {/* Cash Input */}
                        {(paymentMethod === 'cash' || paymentMethod === 'split') && (
                            <TextInput
                                label={isLayaway && paymentMethod === 'cash' ? "Deposit Amount" : "Cash Received"}
                                value={cashReceived}
                                onChangeText={setCashReceived}
                                keyboardType="numeric"
                                mode="outlined"
                                disabled={isProcessing}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {/* M-Pesa Input */}
                        {/* For straight M-Pesa, we usually autofill total, but for Layaway we might need partial.
                            For Split, we definitely need input. */}
                        {(paymentMethod === 'split' || (isLayaway && paymentMethod === 'mpesa')) && (
                            <TextInput
                                label={isLayaway ? "M-Pesa Deposit" : "M-Pesa Amount"}
                                value={mpesaReceived}
                                onChangeText={setMpesaReceived}
                                keyboardType="numeric"
                                mode="outlined"
                                disabled={isProcessing}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {/* Summary of Payment (vs Total) */}
                        {!isLayaway && (
                            <View style={styles.row}>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                                    {paymentMethod === 'split' ? 'Total Paid:' : 'Cash Received:'}
                                </Text>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                    {formatCurrency(totalPaid)}
                                </Text>
                            </View>
                        )}

                        {!isLayaway && change >= 0 && (
                            <View style={styles.row}>
                                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                                    Change:
                                </Text>
                                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    {formatCurrency(change)}
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
                            // Disable if Paying Cash/Split and amount < total (unless layaway)
                            disabled={
                                isProcessing ||
                                (!isLayaway && totalPaid < totals.total)
                            }
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
