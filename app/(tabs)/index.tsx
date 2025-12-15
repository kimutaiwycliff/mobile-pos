// POS Screen (Home)

import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, Searchbar, FAB, Portal, Modal, Divider } from 'react-native-paper';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useCartStore } from '@/stores/useCartStore';
import { ProductCard } from '@/components/pos/ProductCard';
import { CartItem } from '@/components/pos/CartItem';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { VariantSelectionModal } from '@/components/pos/VariantSelectionModal';
import { Product, ProductVariant } from '@/types/database.types';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'expo-router';

export default function POSScreen() {
    const theme = useTheme();
    const { products, isLoading, error, search, clearSearch } = useProductSearch();
    const { items, totals, itemCount, addItem, updateQuantity, removeItem, clearCart, applyItemDiscount } = useCartStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    // Variant Selection State
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
    const [showVariantModal, setShowVariantModal] = useState(false);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        search(query);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        clearSearch();
    };

    const handleAddToCart = (product: Product) => {
        if (product.has_variants) {
            setSelectedProductForVariant(product);
            setShowVariantModal(true);
        } else {
            addItem(product);
        }
    };

    const handleVariantSelect = (variant: ProductVariant) => {
        addItem(variant, 1, true);
        setShowVariantModal(false);
        setSelectedProductForVariant(null);
    };

    const handleCheckoutSuccess = (orderId: string) => {
        setShowCheckout(false);
        clearCart();
        // TODO: Show success message or navigate to order details
        console.log('Order created:', orderId);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    onClearIconPress={handleClearSearch}
                    style={styles.searchBar}
                />
            </View>


            {/* Error Banner - Restored for Debugging */}
            {error && (
                <View style={{ padding: 10, backgroundColor: theme.colors.errorContainer, margin: 10, borderRadius: 8 }}>
                    <Text style={{ color: theme.colors.error, textAlign: 'center' }}>Error: {error}</Text>
                </View>
            )}

            {/* Product Grid */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={[styles.productGrid, { flexGrow: 1 }]}
                columnWrapperStyle={{ justifyContent: 'space-between', gap: 8 }}
                style={{ flex: 1 }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 8 }}>
                            {isLoading ? 'Loading...' : (searchQuery ? 'No products found' : 'No products loaded')}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                            {error ? 'An error occurred.' : 'Please try searching again.'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onPress={() => { }}
                        onAddToCart={() => handleAddToCart(item)}
                    />
                )}
            />

            {/* Cart FAB */}
            {itemCount > 0 && (
                <FAB
                    icon="cart"
                    label={`${itemCount} items - ${formatCurrency(totals.total)}`}
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setShowCart(true)}
                />
            )}

            {/* Cart Modal */}
            <Portal>
                <Modal
                    visible={showCart}
                    onDismiss={() => setShowCart(false)}
                    contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
                >
                    <View style={styles.modalHeader}>
                        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                            Cart ({itemCount} items)
                        </Text>
                    </View>

                    <Divider />

                    {/* Cart Items */}
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.cartList}
                        renderItem={({ item }) => (
                            <CartItem
                                item={item}
                                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                                onRemove={() => removeItem(item.id)}
                                onApplyDiscount={(id, discount) => applyItemDiscount(id, discount)}
                            />
                        )}
                    />

                    <Divider />

                    {/* Cart Summary */}
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                                Subtotal:
                            </Text>
                            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                                {formatCurrency(totals.subtotal)}
                            </Text>
                        </View>

                        {totals.totalDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
                                    Discount:
                                </Text>
                                <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
                                    -{formatCurrency(totals.totalDiscount)}
                                </Text>
                            </View>
                        )}

                        {totals.taxAmount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Tax:
                                </Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    {formatCurrency(totals.taxAmount)}
                                </Text>
                            </View>
                        )}

                        <Divider style={{ marginVertical: 12 }} />

                        <View style={styles.summaryRow}>
                            <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                                Total:
                            </Text>
                            <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                {formatCurrency(totals.total)}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <FAB
                            mode="flat"
                            icon="delete"
                            label="Clear Cart"
                            onPress={() => {
                                clearCart();
                                setShowCart(false);
                            }}
                            style={[styles.actionButton, { backgroundColor: theme.colors.errorContainer }]}
                            color={theme.colors.error}
                        />
                        <FAB
                            icon="cash-register"
                            label="Checkout"
                            onPress={() => {
                                setShowCart(false);
                                setShowCheckout(true);
                            }}
                            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                        />
                    </View>
                </Modal>
            </Portal>

            {/* Checkout Modal */}
            <CheckoutModal
                visible={showCheckout}
                onDismiss={() => setShowCheckout(false)}
                onSuccess={handleCheckoutSuccess}
            />

            {/* Variant Selection Modal */}
            <VariantSelectionModal
                visible={showVariantModal}
                product={selectedProductForVariant}
                onDismiss={() => setShowVariantModal(false)}
                onSelectVariant={handleVariantSelect}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
    },
    searchBar: {
        elevation: 2,
    },
    productGrid: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    fab: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        left: 16,
    },
    modal: {
        margin: 20,
        borderRadius: 12,
        maxHeight: '90%',
    },
    modalHeader: {
        padding: 20,
    },
    cartList: {
        padding: 16,
    },
    summary: {
        padding: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
});
