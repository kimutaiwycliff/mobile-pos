import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, useTheme, TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { Order } from '@/types/database.types';
import { formatCurrency } from '@/utils/formatters';

interface PaymentModalProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: (amount: number, method: 'cash' | 'mpesa') => void;
    order: Order | null;
    isProcessing: boolean;
}

export function PaymentModal({ visible, onDismiss, onConfirm, order, isProcessing }: PaymentModalProps) {
    const theme = useTheme();
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setAmount('');
            setPaymentMethod('cash');
            setError('');
        }
    }, [visible]);

    const balance = order ? order.total_amount - (order.paid_amount || 0) : 0;

    const handleConfirm = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        if (value > balance + 0.01) { // Floating point tolerance
            setError('Amount cannot exceed balance');
            return;
        }

        onConfirm(value, paymentMethod);
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Take Payment</Text>

                {order && (
                    <View style={{ marginBottom: 16 }}>
                        <Text variant="bodyMedium" style={{ marginBottom: 4 }}>
                            Order #{order.order_number}
                        </Text>
                        <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                            Balance Due: <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>{formatCurrency(balance)}</Text>
                        </Text>

                        <Text variant="titleMedium" style={{ marginBottom: 8, marginTop: 8 }}>Payment Method</Text>

                        <SegmentedButtons
                            value={paymentMethod}
                            onValueChange={value => setPaymentMethod(value as 'cash' | 'mpesa')}
                            buttons={[
                                {
                                    value: 'cash',
                                    label: 'Cash',
                                    icon: 'cash',
                                },
                                {
                                    value: 'mpesa',
                                    label: 'M-Pesa',
                                    icon: 'phone',
                                },
                            ]}
                            style={{ marginBottom: 12 }}
                        />

                        <TextInput
                            label="Payment Amount"
                            value={amount}
                            onChangeText={(text) => {
                                setAmount(text);
                                setError('');
                            }}
                            keyboardType="numeric"
                            mode="outlined"
                            style={{ marginBottom: 4 }}
                            error={!!error}
                            left={<TextInput.Affix text="KSh " />}
                        />
                        {!!error && <HelperText type="error">{error}</HelperText>}
                    </View>
                )}

                <View style={styles.actions}>
                    <Button onPress={onDismiss} disabled={isProcessing} style={{ flex: 1 }}>
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleConfirm}
                        loading={isProcessing}
                        disabled={isProcessing}
                        style={{ flex: 1 }}
                    >
                        Confirm Payment
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        padding: 24,
        borderRadius: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    }
});
