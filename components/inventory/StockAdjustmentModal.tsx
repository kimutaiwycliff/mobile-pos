// Stock Adjustment Modal

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, TextInput, SegmentedButtons, HelperText } from 'react-native-paper';

interface StockAdjustmentModalProps {
    visible: boolean;
    itemName: string;
    currentQuantity: number;
    onDismiss: () => void;
    onConfirm: (adjustmentData: { reason: string; quantityChange: number; notes: string }) => void;
    isProcessing: boolean;
}

export function StockAdjustmentModal({
    visible,
    itemName,
    currentQuantity,
    onDismiss,
    onConfirm,
    isProcessing
}: StockAdjustmentModalProps) {
    const theme = useTheme();
    const [reason, setReason] = useState('receive'); // receive, damage, correction
    const [quantityStr, setQuantityStr] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = () => {
        const qty = parseInt(quantityStr, 10);
        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid positive quantity');
            return;
        }

        // Determine sign based on reason
        let finalQuantityChange = qty;
        if (reason === 'damage' || reason === 'loss') {
            finalQuantityChange = -qty;
        } else if (reason === 'correction') {
            // Correction is tricky. Usually implies setting to an exact amount or explicit +/-.
            // For MVP simplicity, let's assume correction replaces "currentQuantity" implies a delta?
            // Actually, usually adjustments is "I found 5 more" (positive) or "I lost 5" (negative).
            // Let's assume 'correction' relies on the user inputting the difference or we add a "Set To" mode?
            // Let's implement as "Add/Remove" logic for now. 
            // If they select 'correction', maybe we treat it as is (user must handle sign? No, input is absolute qty).
            // Let's stick to "Add Stock" (Receive) vs "Remove Stock" (Damage/Loss).

            // To prevent confusion, let's just interpret based on action.
        }

        onConfirm({
            reason,
            quantityChange: finalQuantityChange,
            notes
        });

        // Reset form
        setQuantityStr('');
        setNotes('');
        setError(null);
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                <Text variant="headlineSmall" style={{ marginBottom: 8 }}>Adjust Stock</Text>
                <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
                    {itemName} (Current: {currentQuantity})
                </Text>

                <SegmentedButtons
                    value={reason}
                    onValueChange={setReason}
                    style={{ marginBottom: 16 }}
                    buttons={[
                        { value: 'receive', label: 'Receive' },
                        { value: 'damage', label: 'Damage' },
                        { value: 'correction', label: 'Correction' },
                    ]}
                />

                <TextInput
                    label="Quantity"
                    value={quantityStr}
                    onChangeText={(text) => {
                        setQuantityStr(text);
                        setError(null);
                    }}
                    keyboardType="number-pad"
                    mode="outlined"
                    style={{ marginBottom: 8 }}
                />

                {error && (
                    <HelperText type="error" visible={!!error}>
                        {error}
                    </HelperText>
                )}

                <TextInput
                    label="Notes (Optional)"
                    value={notes}
                    onChangeText={setNotes}
                    mode="outlined"
                    multiline
                    numberOfLines={2}
                    style={{ marginBottom: 24 }}
                />

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
                        buttonColor={reason === 'damage' ? theme.colors.error : theme.colors.primary}
                    >
                        Confirm
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
    }
});
