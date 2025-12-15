// Product Card Component

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { Product, ProductVariant } from '@/types/database.types';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
    product: Product | ProductVariant;
    onPress: () => void;
    onAddToCart: () => void;
}

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
    const theme = useTheme();

    const isLowStock = false; // TODO: Check inventory
    const isOutOfStock = false; // TODO: Check inventory

    return (
        <Card style={styles.card} onPress={onPress}>
            <View style={styles.innerContainer}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {product.image_url ? (
                        <Image
                            source={{ uri: product.image_url }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text style={{ color: theme.colors.onSurfaceVariant }}>No Image</Text>
                        </View>
                    )}

                    {/* Stock Badge */}
                    {isOutOfStock && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.onError }]}>
                                Out of Stock
                            </Text>
                        </View>
                    )}
                    {isLowStock && !isOutOfStock && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.tertiary }]}>
                            <Text style={[styles.badgeText, { color: theme.colors.onTertiary }]}>
                                Low Stock
                            </Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <Card.Content style={styles.content}>
                    <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface }}>
                        {product.name}
                    </Text>

                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        SKU: {product.sku}
                    </Text>

                    <View style={styles.priceRow}>
                        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {formatCurrency(product.selling_price || 0)}
                        </Text>

                        <IconButton
                            icon="plus-circle"
                            size={28}
                            iconColor={theme.colors.primary}
                            onPress={(e) => {
                                e.stopPropagation();
                                onAddToCart();
                            }}
                            disabled={isOutOfStock}
                        />
                    </View>
                </Card.Content>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 4,
        marginVertical: 8,
        elevation: 2,
        borderRadius: 12,
    },
    innerContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 160,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        paddingTop: 12,
        paddingHorizontal: 8, // Override default 16
        paddingBottom: 12,    // Override default 16
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
});
