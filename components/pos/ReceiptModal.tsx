// Receipt Modal Component

import React from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { Modal, Portal, Text, useTheme, Button, Divider } from 'react-native-paper';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { createOrder } from '@/lib/api/orders'; // Just for type reference if needed, ideally use type

interface ReceiptModalProps {
    visible: boolean;
    onDismiss: () => void;
    // We might pass order ID and fetch, or pass full order details. 
    // Passing minimal details for now to simulate the "Just Completed" receipt.
    // Ideally we fetch the full order to show invoice number etc.
    orderId: string | null;
}

export function ReceiptModal({ visible, onDismiss, orderId }: ReceiptModalProps) {
    const theme = useTheme();

    // TODO: Fetch order details using orderId
    // For now we just show a success message or minimal data? 
    // Without fetching, we can't show items.
    // Let's assume we can't fetch easily here without a hook.
    // But for a "Receipt" we really need the data.

    // We can add a "View Order" button which navigates to Order Details?
    // Or we assume the parent passed the data.
    // Let's just create a nice "Order Success" view for now.

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Receipt for Order #${orderId}. Thank you for your business!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Text style={{ fontSize: 64 }}>✅</Text>
                    </View>

                    <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 8, fontWeight: 'bold' }}>
                        Order Completed!
                    </Text>

                    <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
                        {orderId ? `Order ID: ${orderId.slice(0, 8)}...` : ''}
                    </Text>

                    <Divider style={{ marginBottom: 24 }} />

                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={handleShare}
                            icon="share-variant"
                            style={{ marginBottom: 12 }}
                        >
                            Share Receipt
                        </Button>

                        <Button
                            mode="contained"
                            onPress={onDismiss}
                            contentStyle={{ paddingVertical: 8 }}
                        >
                            Start New Order
                        </Button>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        borderRadius: 16,
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    actions: {
        width: '100%',
    }
});
