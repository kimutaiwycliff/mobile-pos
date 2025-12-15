// Cart Item Component

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, useTheme, IconButton, Card } from 'react-native-paper';
import { CartItem as CartItemType } from '@/types/cart.types';
import { formatCurrency } from '@/utils/formatters';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    const theme = useTheme();

    const itemTotal = item.unitPrice * item.quantity - item.itemDiscount;

    return (
        <Card style={styles.card}>
            <View style={styles.container}>
                {/* Product Image */}
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>No Image</Text>
                    </View>
                )}

                {/* Product Info */}
                <View style={styles.info}>
                    <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface }}>
                        {item.name}
                    </Text>
                    {item.variantName && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {item.variantName}
                        </Text>
                    )}
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        {formatCurrency(item.unitPrice)} each
                    </Text>

                    {/* Quantity Controls */}
                    <View style={styles.quantityRow}>
                        <IconButton
                            icon="minus"
                            size={20}
                            onPress={() => onUpdateQuantity(item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        />
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                        </Text>
                        <IconButton
                            icon="plus"
                            size={20}
                            onPress={() => onUpdateQuantity(item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                        />
                    </View>
                </View>

                {/* Price & Remove */}
                <View style={styles.rightColumn}>
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={onRemove}
                        iconColor={theme.colors.error}
                    />
                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 8 }}>
                        {formatCurrency(itemTotal)}
                    </Text>
                    {item.itemDiscount > 0 && (
                        <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                            -{formatCurrency(item.itemDiscount)}
                        </Text>
                    )}
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 8,
    },
    container: {
        flexDirection: 'row',
        padding: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    rightColumn: {
        alignItems: 'flex-end',
    },
});
