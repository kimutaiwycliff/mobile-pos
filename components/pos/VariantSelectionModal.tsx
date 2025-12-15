import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, ActivityIndicator, useTheme, RadioButton, Divider } from 'react-native-paper';
import { Product, ProductVariant } from '@/types/database.types';
import { getProductVariants } from '@/lib/api/products';
import { formatCurrency } from '@/utils/formatters';

interface VariantSelectionModalProps {
    visible: boolean;
    onDismiss: () => void;
    product: Product | null;
    onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantSelectionModal({ visible, onDismiss, product, onSelectVariant }: VariantSelectionModalProps) {
    const theme = useTheme();
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && product) {
            fetchVariants();
        } else {
            setVariants([]);
            setError(null);
        }
    }, [visible, product]);

    const fetchVariants = async () => {
        if (!product) return;
        try {
            setLoading(true);
            setError(null);
            const data = await getProductVariants(product.id);
            setVariants(data);
        } catch (err: any) {
            setError('Failed to load variants');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (variant: ProductVariant) => {
        onSelectVariant(variant);
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.background }]}
            >
                <View style={styles.header}>
                    <Text variant="titleMedium">{product?.name} - Select Variant</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Choose an option to add to cart
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : error ? (
                    <View style={styles.center}>
                        <Text style={{ color: theme.colors.error }}>{error}</Text>
                        <Button onPress={fetchVariants} style={{ marginTop: 8 }}>Retry</Button>
                    </View>
                ) : variants.length === 0 ? (
                    <View style={styles.center}>
                        <Text>No variants available.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={variants}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelect(item)}>
                                <View style={styles.variantItem}>
                                    <View>
                                        <Text variant="bodyLarge">{item.name}</Text>
                                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                            SKU: {item.sku}
                                        </Text>
                                    </View>
                                    <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                        {formatCurrency(item.selling_price || 0)}
                                    </Text>
                                </View>
                                <Divider />
                            </TouchableOpacity>
                        )}
                        style={styles.list}
                    />
                )}

                <View style={styles.actions}>
                    <Button onPress={onDismiss}>Cancel</Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        margin: 20,
        borderRadius: 8,
        padding: 20,
        maxHeight: '80%',
    },
    header: {
        marginBottom: 16,
    },
    center: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        flexGrow: 0,
    },
    variantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    actions: {
        marginTop: 16,
        alignItems: 'flex-end',
    },
});
