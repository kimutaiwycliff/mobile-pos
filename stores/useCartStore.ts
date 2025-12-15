// Cart Store - Zustand

import { create } from 'zustand';
import { CartItem, CartState, CartTotals, CheckoutData, PaymentInput, LayawayData } from '@/types/cart.types';
import { Product, ProductVariant, Discount } from '@/types/database.types';
import { calculateCartTotals } from '@/utils/calculations';
import { cartStorage, STORAGE_KEYS } from '@/lib/storage/mmkv';

interface CartStore extends CartState {
    // Computed values
    totals: CartTotals;
    itemCount: number;

    // Actions
    addItem: (product: Product | ProductVariant, quantity?: number, isVariant?: boolean) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    applyItemDiscount: (cartItemId: string, discount: number) => void;
    setCustomer: (customerId: string | null) => void;
    setLocation: (locationId: string) => void;
    setNotes: (notes: string) => void;
    setDiscountCode: (code: string | null, discount: Discount | null) => void;
    clearCart: () => void;
    loadCart: () => void;
    saveCart: () => void;
}

// Helper to generate unique cart item ID
const generateCartItemId = () => {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to get default location (will be replaced with actual default location logic)
const getDefaultLocationId = (): string => {
    // TODO: Get from settings store or API
    return 'default-location-id';
};

export const useCartStore = create<CartStore>((set, get) => ({
    // Initial state
    items: [],
    customerId: null,
    locationId: getDefaultLocationId(),
    discountCode: null,
    appliedDiscount: null,
    notes: null,
    totals: {
        subtotal: 0,
        itemDiscountTotal: 0,
        orderDiscount: 0,
        totalDiscount: 0,
        taxAmount: 0,
        total: 0,
    },
    itemCount: 0,

    // Add item to cart
    addItem: (product: Product | ProductVariant, quantity = 1, isVariant = false) => {
        const state = get();
        const existingItemIndex = state.items.findIndex((item) => {
            if (isVariant) {
                return item.variantId === product.id;
            }
            return item.productId === product.id && !item.variantId;
        });

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = [...state.items];
            const existingItem = newItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;

            // Check max quantity (available stock)
            if (newQuantity > existingItem.maxQuantity) {
                console.warn('Cannot add more items than available stock');
                return;
            }

            newItems[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
            };
        } else {
            // Add new item
            const newItem: CartItem = {
                id: generateCartItemId(),
                productId: isVariant ? (product as ProductVariant).product_id : product.id,
                variantId: isVariant ? product.id : undefined,
                name: product.name,
                variantName: isVariant ? (product as ProductVariant).name : undefined,
                sku: product.sku,
                barcode: product.barcode,
                quantity,
                unitPrice: product.selling_price,
                costPrice: product.cost_price,
                taxRate: product.tax_rate,
                itemDiscount: 0,
                imageUrl: product.image_url || undefined,
                maxQuantity: 100, // TODO: Get from inventory
            };

            newItems = [...state.items, newItem];
        }

        // Recalculate totals
        const orderDiscountAmount = state.appliedDiscount
            ? calculateDiscountAmount(state.appliedDiscount, newItems)
            : 0;
        const totals = calculateCartTotals(newItems, orderDiscountAmount);

        set({
            items: newItems,
            totals,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });

        get().saveCart();
    },

    // Remove item from cart
    removeItem: (cartItemId: string) => {
        const state = get();
        const newItems = state.items.filter((item) => item.id !== cartItemId);

        const orderDiscountAmount = state.appliedDiscount
            ? calculateDiscountAmount(state.appliedDiscount, newItems)
            : 0;
        const totals = calculateCartTotals(newItems, orderDiscountAmount);

        set({
            items: newItems,
            totals,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });

        get().saveCart();
    },

    // Update item quantity
    updateQuantity: (cartItemId: string, quantity: number) => {
        const state = get();
        const itemIndex = state.items.findIndex((item) => item.id === cartItemId);

        if (itemIndex < 0) return;

        const item = state.items[itemIndex];

        // Validate quantity
        if (quantity < 1) {
            get().removeItem(cartItemId);
            return;
        }

        if (quantity > item.maxQuantity) {
            console.warn('Cannot exceed available stock');
            return;
        }

        const newItems = [...state.items];
        newItems[itemIndex] = { ...item, quantity };

        const orderDiscountAmount = state.appliedDiscount
            ? calculateDiscountAmount(state.appliedDiscount, newItems)
            : 0;
        const totals = calculateCartTotals(newItems, orderDiscountAmount);

        set({
            items: newItems,
            totals,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });

        get().saveCart();
    },

    // Apply item-level discount
    applyItemDiscount: (cartItemId: string, discount: number) => {
        const state = get();
        const itemIndex = state.items.findIndex((item) => item.id === cartItemId);

        if (itemIndex < 0) return;

        const item = state.items[itemIndex];
        const itemTotal = item.unitPrice * item.quantity;

        // Validate discount doesn't exceed item total
        const validDiscount = Math.min(Math.max(0, discount), itemTotal);

        const newItems = [...state.items];
        newItems[itemIndex] = { ...item, itemDiscount: validDiscount };

        const orderDiscountAmount = state.appliedDiscount
            ? calculateDiscountAmount(state.appliedDiscount, newItems)
            : 0;
        const totals = calculateCartTotals(newItems, orderDiscountAmount);

        set({
            items: newItems,
            totals,
        });

        get().saveCart();
    },

    // Set customer
    setCustomer: (customerId: string | null) => {
        set({ customerId });
        get().saveCart();
    },

    // Set location
    setLocation: (locationId: string) => {
        set({ locationId });
        get().saveCart();
    },

    // Set notes
    setNotes: (notes: string) => {
        set({ notes });
        get().saveCart();
    },

    // Set discount code and applied discount
    setDiscountCode: (code: string | null, discount: Discount | null) => {
        const state = get();
        const orderDiscountAmount = discount ? calculateDiscountAmount(discount, state.items) : 0;
        const totals = calculateCartTotals(state.items, orderDiscountAmount);

        set({
            discountCode: code,
            appliedDiscount: discount,
            totals,
        });

        get().saveCart();
    },

    // Clear cart
    clearCart: () => {
        set({
            items: [],
            customerId: null,
            discountCode: null,
            appliedDiscount: null,
            notes: null,
            totals: {
                subtotal: 0,
                itemDiscountTotal: 0,
                orderDiscount: 0,
                totalDiscount: 0,
                taxAmount: 0,
                total: 0,
            },
            itemCount: 0,
        });

        cartStorage.remove(STORAGE_KEYS.CART_ITEMS);
        cartStorage.remove(STORAGE_KEYS.CART_CUSTOMER);
        cartStorage.remove(STORAGE_KEYS.CART_NOTES);
    },

    // Load cart from storage
    loadCart: () => {
        try {
            const savedItems = cartStorage.getString(STORAGE_KEYS.CART_ITEMS);
            const savedCustomer = cartStorage.getString(STORAGE_KEYS.CART_CUSTOMER);
            const savedNotes = cartStorage.getString(STORAGE_KEYS.CART_NOTES);

            if (savedItems) {
                const items: CartItem[] = JSON.parse(savedItems);
                const customerId = savedCustomer || null;
                const notes = savedNotes || null;

                const totals = calculateCartTotals(items, 0);
                const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

                set({
                    items,
                    customerId,
                    notes,
                    totals,
                    itemCount,
                });
            }
        } catch (error) {
            console.error('Failed to load cart from storage:', error);
        }
    },

    // Save cart to storage
    saveCart: () => {
        try {
            const state = get();
            cartStorage.set(STORAGE_KEYS.CART_ITEMS, JSON.stringify(state.items));
            if (state.customerId) {
                cartStorage.set(STORAGE_KEYS.CART_CUSTOMER, state.customerId);
            } else {
                cartStorage.remove(STORAGE_KEYS.CART_CUSTOMER);
            }
            if (state.notes) {
                cartStorage.set(STORAGE_KEYS.CART_NOTES, state.notes);
            } else {
                cartStorage.remove(STORAGE_KEYS.CART_NOTES);
            }
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
        }
    },
}));

// Helper function to calculate discount amount
const calculateDiscountAmount = (discount: Discount, items: CartItem[]): number => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    let amount = 0;

    if (discount.discount_type === 'percentage') {
        amount = (subtotal * discount.discount_value) / 100;
    } else if (discount.discount_type === 'fixed_amount') {
        amount = discount.discount_value;
    }

    // Apply max discount cap
    if (discount.max_discount_amount && amount > discount.max_discount_amount) {
        amount = discount.max_discount_amount;
    }

    // Don't exceed subtotal
    if (amount > subtotal) {
        amount = subtotal;
    }

    return amount;
};
