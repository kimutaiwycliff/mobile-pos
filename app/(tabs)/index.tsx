// POS Screen (Home)

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, useTheme, Searchbar, FAB, Portal, Modal, Divider, Snackbar, IconButton } from 'react-native-paper';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useCartStore } from '@/stores/useCartStore';
import { ProductCard } from '@/components/pos/ProductCard';
import { CartItem } from '@/components/pos/CartItem';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { VariantSelectionModal } from '@/components/pos/VariantSelectionModal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { BarcodeScannerModal } from '@/components/pos/BarcodeScannerModal';
import { Product, ProductVariant } from '@/types/database.types';
import { formatCurrency } from '@/utils/formatters';
import { supabase } from '@/lib/supabase/client';

export default function POSScreen() {
    const theme = useTheme();
    const { products, isLoading, error, search, clearSearch } = useProductSearch();
    const { items, totals, itemCount, addItem, updateQuantity, removeItem, clearCart, applyItemDiscount, error: cartError, setError, locationId } = useCartStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    // Variant Selection State
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
    const [showVariantModal, setShowVariantModal] = useState(false);

    // Receipt State
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

    // Scanner State
    const [showScanner, setShowScanner] = useState(false);

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
        setReceiptOrderId(orderId);
        setShowReceipt(true);
    };

    const handleBarcodeScanned = async (barcode: string) => {
        setShowScanner(false);

        try {
            // 1. Check Product Barcode
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('barcode', barcode)
                .eq('is_active', true)
                .maybeSingle(); // Use maybeSingle to avoid 406 or error on 0 rows if handled properly

            if (productData) {
                // Found a product
                if (!productData.has_variants) {
                    const { data: inventoryData } = await supabase
                        .from('inventory')
                        .select('quantity')
                        .eq('product_id', productData.id)
                        .eq('location_id', locationId)
                        .maybeSingle();

                    const trackInventory = productData.track_inventory ?? true;
                    // If tracking, use inventory quantity (default 0). If not, big number
                    const quantity = trackInventory ? (inventoryData?.quantity ?? 0) : 10000;
                    (productData as any).quantity = quantity;
                }
                // Check if it has variants. If so, we still might need to select a variant if the barcode belongs to the PARENT product?
                // Usually parent product barcode implies "default" or "select variant".
                // If the barcode is for the parent product, we should handle it like a click.
                handleAddToCart(productData as Product);
                return;
            }

            // 2. Check Variant Barcode
            const { data: variantData, error: variantError } = await supabase
                .from('product_variants')
                .select(`
                    *,
                    product:products(*)
                `)
                .eq('barcode', barcode)
                .eq('is_active', true)
                .maybeSingle();

            if (variantData) {
                // Found a variant
                // Fetch Inventory
                const { data: inventoryData } = await supabase
                    .from('inventory')
                    .select('quantity')
                    .eq('variant_id', variantData.id)
                    .eq('location_id', locationId)
                    .maybeSingle();

                const parent = (variantData as any).product;
                const trackInventory = parent?.track_inventory ?? true;

                const quantity = trackInventory ? (inventoryData?.quantity ?? 0) : 10000;
                (variantData as any).quantity = quantity;

                // We need to make sure the parent product is attached or at least pass correct data to addItem
                // addItem expects ProductVariant structure.
                handleVariantSelect(variantData as unknown as ProductVariant);
                return;
            }

            // Not found
            Alert.alert('Not Found', `No product found with barcode: ${barcode}`);

        } catch (err) {
            console.error('Scan Error:', err);
            Alert.alert('Error', 'Failed to lookup product.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Search Bar Row */}
            <View style={styles.searchContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Searchbar
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onClearIconPress={handleClearSearch}
                        style={[styles.searchBar, { flex: 1 }]}
                    />
                    <IconButton
                        icon="barcode-scan"
                        mode="contained"
                        onPress={() => setShowScanner(true)}
                        containerColor={theme.colors.secondaryContainer}
                        iconColor={theme.colors.onSecondaryContainer}
                        size={28}
                    />
                </View>
            </View>


            {/* Error Banner */}
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
                            {error ? 'An error occurred.' : 'Tap the scan button or search to find items.'}
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

            {/* Receipt Modal */}
            <ReceiptModal
                visible={showReceipt}
                onDismiss={() => setShowReceipt(false)}
                orderId={receiptOrderId}
            />

            {/* Variant Selection Modal */}
            <VariantSelectionModal
                visible={showVariantModal}
                product={selectedProductForVariant}
                onDismiss={() => setShowVariantModal(false)}
                onSelectVariant={handleVariantSelect}
            />

            {/* Barcode Scanner Modal */}
            <BarcodeScannerModal
                visible={showScanner}
                onDismiss={() => setShowScanner(false)}
                onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Error Snackbar */}
            <Snackbar
                visible={!!cartError}
                onDismiss={() => setError(null)}
                duration={3000}
                action={{
                    label: 'Dismiss',
                    onPress: () => setError(null),
                }}
                style={{ backgroundColor: theme.colors.errorContainer }}
            >
                <Text style={{ color: theme.colors.onErrorContainer }}>{cartError}</Text>
            </Snackbar>
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
