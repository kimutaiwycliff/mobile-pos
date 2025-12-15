// Inventory Screen

import React, { useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, useTheme, Searchbar, FAB, Card, Chip, IconButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { getInventory, adjustStock, InventoryItem } from '@/lib/api/inventory';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { useCartStore } from '@/stores/useCartStore'; // For accessing default location ID

export default function InventoryScreen() {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const { locationId } = useCartStore(); // Using location from cart store as global location context

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isAdjusting, setIsAdjusting] = useState(false);

    // Fetch Inventory
    const { data: inventory = [], isLoading, refetch } = useQuery({
        queryKey: ['inventory', locationId, searchQuery],
        queryFn: () => getInventory(locationId, searchQuery),
    });

    // Adjust Stock Mutation
    const adjustMutation = useMutation({
        mutationFn: async (data: { reason: string; quantityChange: number; notes: string }) => {
            if (!selectedItem) throw new Error('No item selected');
            return adjustStock({
                inventoryId: selectedItem.id,
                productId: selectedItem.product_id!,
                variantId: selectedItem.variant_id,
                locationId: selectedItem.location_id,
                quantityChange: data.quantityChange,
                reason: data.reason as any,
                notes: data.notes
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            setModalVisible(false);
            setSelectedItem(null);
        },
        onError: (error) => {
            console.error('Adjustment failed', error);
            // Could add toast here
        }
    });

    const handleAdjustment = (data: { reason: string; quantityChange: number; notes: string }) => {
        setIsAdjusting(true);
        adjustMutation.mutate(data, {
            onSettled: () => setIsAdjusting(false)
        });
    };

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const product = item.product;
        const variant = item.variant;
        const name = product ? product.name : 'Unknown Product';
        const variantName = variant ? ` - ${variant.name}` : '';
        const sku = variant ? variant.sku : (product ? product.sku : 'N/A');
        const imageUrl = variant?.image_url || product?.image_url;

        const isLowStock = item.quantity <= item.reorder_point;
        const isOutOfStock = item.quantity <= 0;

        return (
            <Card
                style={styles.card}
                onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(true);
                }}
            >
                <Card.Content style={styles.cardContent}>
                    <View style={styles.info}>
                        <Text variant="titleMedium">{name}{variantName}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            SKU: {sku}
                        </Text>
                        <View style={styles.badges}>
                            {isOutOfStock && (
                                <Chip
                                    icon="alert"
                                    style={{ backgroundColor: theme.colors.errorContainer }}
                                    textStyle={{ color: theme.colors.error }}
                                    compact
                                >
                                    Out of Stock
                                </Chip>
                            )}
                            {isLowStock && !isOutOfStock && (
                                <Chip
                                    icon="alert-circle"
                                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                                    textStyle={{ color: theme.colors.onTertiaryContainer }}
                                    compact
                                >
                                    Low Stock
                                </Chip>
                            )}
                        </View>
                    </View>
                    <View style={styles.stock}>
                        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {item.quantity}
                        </Text>
                        <Text variant="labelSmall">In Stock</Text>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search inventory..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <FlashList
                data={inventory}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text>No inventory items found</Text>
                    </View>
                }
            />

            {selectedItem && (
                <StockAdjustmentModal
                    visible={modalVisible}
                    itemName={`${selectedItem.product?.name}${selectedItem.variant ? ' - ' + selectedItem.variant.name : ''}`}
                    currentQuantity={selectedItem.quantity}
                    onDismiss={() => {
                        setModalVisible(false);
                        setSelectedItem(null);
                    }}
                    onConfirm={handleAdjustment}
                    isProcessing={isAdjusting}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
    },
    searchBar: {
        elevation: 2,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    stock: {
        alignItems: 'center',
        paddingLeft: 16,
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
    },
    badges: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    empty: {
        padding: 24,
        alignItems: 'center',
        marginTop: 40,
    },
});
