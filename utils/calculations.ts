// Utility Functions for Calculations

import { CartItem, CartTotals } from '@/types/cart.types';
import { LOYALTY_POINTS_PER_CURRENCY } from './constants';

// ============================================================================
// TAX CALCULATIONS
// ============================================================================

/**
 * Calculate tax for a single cart item
 */
export const calculateItemTax = (
    unitPrice: number,
    quantity: number,
    taxRate: number,
    itemDiscount: number,
    orderDiscountPerItem: number = 0
): number => {
    const itemTotal = unitPrice * quantity;
    const taxableAmount = itemTotal - itemDiscount - orderDiscountPerItem;
    return (taxableAmount * taxRate) / 100;
};

/**
 * Calculate total tax for all cart items
 */
export const calculateTotalTax = (
    items: CartItem[],
    orderDiscount: number,
    subtotal: number
): number => {
    return items.reduce((total, item) => {
        const itemTotal = item.unitPrice * item.quantity;
        const orderDiscountPerItem = subtotal > 0 ? (orderDiscount / subtotal) * itemTotal : 0;
        const itemTax = calculateItemTax(
            item.unitPrice,
            item.quantity,
            item.taxRate,
            item.itemDiscount,
            orderDiscountPerItem
        );
        return total + itemTax;
    }, 0);
};

// ============================================================================
// CART TOTALS CALCULATIONS
// ============================================================================

/**
 * Calculate all cart totals
 */
export const calculateCartTotals = (
    items: CartItem[],
    orderDiscountAmount: number = 0
): CartTotals => {
    // Subtotal: sum of (unitPrice * quantity)
    const subtotal = items.reduce((sum, item) => {
        return sum + item.unitPrice * item.quantity;
    }, 0);

    // Item-level discounts total
    const itemDiscountTotal = items.reduce((sum, item) => {
        return sum + item.itemDiscount;
    }, 0);

    // Total discount
    const totalDiscount = itemDiscountTotal + orderDiscountAmount;

    // Tax amount (calculated after discounts)
    const taxAmount = calculateTotalTax(items, orderDiscountAmount, subtotal);

    // Final total
    const total = subtotal - totalDiscount + taxAmount;

    return {
        subtotal,
        itemDiscountTotal,
        orderDiscount: orderDiscountAmount,
        totalDiscount,
        taxAmount,
        total,
    };
};

// ============================================================================
// DISCOUNT CALCULATIONS
// ============================================================================

/**
 * Calculate discount amount based on discount type
 */
export const calculateDiscountAmount = (
    subtotal: number,
    discountType: 'percentage' | 'fixed_amount',
    discountValue: number,
    maxDiscountAmount?: number | null
): number => {
    let amount = 0;

    if (discountType === 'percentage') {
        amount = (subtotal * discountValue) / 100;
    } else {
        amount = discountValue;
    }

    // Cap at max discount amount
    if (maxDiscountAmount && amount > maxDiscountAmount) {
        amount = maxDiscountAmount;
    }

    // Don't exceed subtotal
    if (amount > subtotal) {
        amount = subtotal;
    }

    return amount;
};

// ============================================================================
// LOYALTY POINTS CALCULATIONS
// ============================================================================

/**
 * Calculate loyalty points earned for an order
 */
export const calculateLoyaltyPoints = (totalAmount: number): number => {
    return Math.floor(totalAmount / LOYALTY_POINTS_PER_CURRENCY);
};

/**
 * Calculate proportional loyalty points for layaway orders
 */
export const calculateLayawayLoyaltyPoints = (
    totalAmount: number,
    paidAmount: number
): number => {
    const paymentRatio = paidAmount / totalAmount;
    const totalPoints = calculateLoyaltyPoints(totalAmount);
    return Math.floor(totalPoints * paymentRatio);
};

// ============================================================================
// LAYAWAY CALCULATIONS
// ============================================================================

/**
 * Calculate layaway deposit amount
 */
export const calculateLayawayDeposit = (
    totalAmount: number,
    depositPercent: number
): number => {
    return (totalAmount * depositPercent) / 100;
};

/**
 * Calculate remaining balance for layaway
 */
export const calculateLayawayBalance = (
    totalAmount: number,
    paidAmount: number
): number => {
    return totalAmount - paidAmount;
};

/**
 * Calculate proportional revenue for layaway
 */
export const calculateLayawayProportionalRevenue = (
    totalAmount: number,
    paidAmount: number
): number => {
    const paymentRatio = paidAmount / totalAmount;
    return totalAmount * paymentRatio;
};

/**
 * Calculate proportional profit for layaway
 */
export const calculateLayawayProportionalProfit = (
    totalAmount: number,
    totalCost: number,
    paidAmount: number
): number => {
    const paymentRatio = paidAmount / totalAmount;
    const proportionalRevenue = totalAmount * paymentRatio;
    const proportionalCost = totalCost * paymentRatio;
    return proportionalRevenue - proportionalCost;
};

// ============================================================================
// PROFIT CALCULATIONS
// ============================================================================

/**
 * Calculate profit for an order
 */
export const calculateOrderProfit = (
    totalAmount: number,
    items: CartItem[]
): number => {
    const totalCost = items.reduce((sum, item) => {
        return sum + item.costPrice * item.quantity;
    }, 0);
    return totalAmount - totalCost;
};

/**
 * Calculate profit margin percentage
 */
export const calculateProfitMargin = (
    revenue: number,
    cost: number
): number => {
    if (revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
};

// ============================================================================
// CHANGE CALCULATION
// ============================================================================

/**
 * Calculate change for cash payment
 */
export const calculateChange = (
    totalAmount: number,
    cashReceived: number
): number => {
    return Math.max(0, cashReceived - totalAmount);
};
