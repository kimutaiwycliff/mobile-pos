// Utility Functions for Formatting

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { CURRENCY_SYMBOL, DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from './constants';

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format number as currency
 */
export const formatCurrency = (amount: number): string => {
    return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Format currency without symbol
 */
export const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format ISO date string to readable date
 */
export const formatDate = (dateString: string): string => {
    try {
        return format(parseISO(dateString), DATE_FORMAT);
    } catch {
        return dateString;
    }
};

/**
 * Format ISO date string to readable date and time
 */
export const formatDateTime = (dateString: string): string => {
    try {
        return format(parseISO(dateString), DATE_TIME_FORMAT);
    } catch {
        return dateString;
    }
};

/**
 * Format ISO date string to time only
 */
export const formatTime = (dateString: string): string => {
    try {
        return format(parseISO(dateString), TIME_FORMAT);
    } catch {
        return dateString;
    }
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
    try {
        return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
        return dateString;
    }
};

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as: +254 712 345 678
    if (cleaned.startsWith('254')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }

    // Format as: 0712 345 678
    if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
};

// ============================================================================
// STATUS FORMATTING
// ============================================================================

/**
 * Get color for order status
 */
export const getOrderStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        pending: '#FFA500',      // Orange
        processing: '#2196F3',   // Blue
        completed: '#4CAF50',    // Green
        cancelled: '#9E9E9E',    // Gray
        refunded: '#F44336',     // Red
        layaway: '#9C27B0',      // Purple
    };
    return colors[status] || '#9E9E9E';
};

/**
 * Get color for payment status
 */
export const getPaymentStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        pending: '#FFA500',      // Orange
        partial: '#2196F3',      // Blue
        paid: '#4CAF50',         // Green
        refunded: '#F44336',     // Red
        completed: '#4CAF50',    // Green
    };
    return colors[status] || '#9E9E9E';
};

/**
 * Get label for order status
 */
export const getOrderStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
        layaway: 'Layaway',
    };
    return labels[status] || capitalizeWords(status);
};

/**
 * Get label for payment status
 */
export const getPaymentStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        pending: 'Pending',
        partial: 'Partial',
        paid: 'Paid',
        refunded: 'Refunded',
        completed: 'Completed',
    };
    return labels[status] || capitalizeWords(status);
};
