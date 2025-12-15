// Cart-specific TypeScript interfaces

import { Product, ProductVariant, Discount } from './database.types';

// ============================================================================
// CART ITEM
// ============================================================================
export interface CartItem {
    id: string;                    // Unique cart item ID (generated)
    productId: string;             // Product ID
    variantId?: string;            // Variant ID (if applicable)
    name: string;                  // Product name
    variantName?: string;          // Variant name (if applicable)
    sku: string;                   // SKU
    barcode: string;               // Barcode
    quantity: number;              // Quantity in cart
    unitPrice: number;             // Current selling price
    costPrice: number;             // Cost price (for profit calculation)
    taxRate: number;               // Tax percentage
    itemDiscount: number;          // Item-level discount amount
    imageUrl?: string;             // Product/variant image
    maxQuantity: number;           // Available stock (for validation)
}

// ============================================================================
// CART STATE
// ============================================================================
export interface CartState {
    items: CartItem[];
    customerId: string | null;
    locationId: string;
    discountCode: string | null;
    appliedDiscount: Discount | null;
    notes: string | null;
}

// ============================================================================
// CART COMPUTED VALUES
// ============================================================================
export interface CartTotals {
    subtotal: number;              // Sum of (unitPrice * quantity) for all items
    itemDiscountTotal: number;     // Sum of item-level discounts
    orderDiscount: number;         // Order-level discount amount
    totalDiscount: number;         // Item + Order discounts
    taxAmount: number;             // Tax after discounts
    total: number;                 // Final total
}

// ============================================================================
// CHECKOUT DATA
// ============================================================================
export interface CheckoutData {
    cart: CartState;
    totals: CartTotals;
    payments: PaymentInput[];
    isLayaway: boolean;
    layawayData?: LayawayData;
}

export interface PaymentInput {
    id: string;                    // Unique payment ID (generated)
    method: "cash" | "mpesa" | "card" | "bank_transfer" | "credit";
    amount: number;
    referenceNumber?: string;
    mpesaReceipt?: string;
    mpesaPhone?: string;
}

export interface LayawayData {
    customerName: string;
    customerPhone: string;
    depositPercent: number;
    dueDate: string;               // ISO date string
}
