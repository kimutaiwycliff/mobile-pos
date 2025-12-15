// App Constants

export const APP_NAME = 'POS Mobile';

// Currency
export const CURRENCY_SYMBOL = process.env.EXPO_PUBLIC_CURRENCY_SYMBOL || 'KSh';
export const CURRENCY_CODE = process.env.EXPO_PUBLIC_CURRENCY_CODE || 'KES';

// Tax
export const DEFAULT_TAX_RATE = parseFloat(process.env.EXPO_PUBLIC_TAX_RATE || '0');

// Loyalty
export const LOYALTY_POINTS_PER_CURRENCY = parseFloat(
    process.env.EXPO_PUBLIC_LOYALTY_POINTS_PER_CURRENCY || '100'
);

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Search
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

// Cache Times (in milliseconds)
export const CACHE_TIME = {
    PRODUCTS: 5 * 60 * 1000,       // 5 minutes
    INVENTORY: 1 * 60 * 1000,      // 1 minute
    ORDERS: 30 * 1000,             // 30 seconds
    CUSTOMERS: 5 * 60 * 1000,      // 5 minutes
    ANALYTICS: 5 * 60 * 1000,      // 5 minutes
    SUPPLIERS: 10 * 60 * 1000,     // 10 minutes
    CATEGORIES: 10 * 60 * 1000,    // 10 minutes
};

// Stale Times (in milliseconds)
export const STALE_TIME = {
    PRODUCTS: 2 * 60 * 1000,       // 2 minutes
    INVENTORY: 30 * 1000,          // 30 seconds
    ORDERS: 10 * 1000,             // 10 seconds
    CUSTOMERS: 2 * 60 * 1000,      // 2 minutes
    ANALYTICS: 2 * 60 * 1000,      // 2 minutes
    SUPPLIERS: 5 * 60 * 1000,      // 5 minutes
    CATEGORIES: 5 * 60 * 1000,     // 5 minutes
};

// Image Upload
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const IMAGE_QUALITY = 0.8;
export const MAX_IMAGE_WIDTH = 1200;
export const MAX_IMAGE_HEIGHT = 1200;
export const THUMBNAIL_SIZE = 300;

// Order Status
export const ORDER_STATUSES = [
    'pending',
    'processing',
    'completed',
    'cancelled',
    'refunded',
    'layaway',
] as const;

export const PAYMENT_STATUSES = [
    'pending',
    'partial',
    'paid',
    'refunded',
    'completed',
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'mpesa', label: 'M-Pesa' },
] as const;

// Stock Movement Types
export const MOVEMENT_TYPES = [
    'sale',
    'purchase',
    'adjustment',
    'damage',
    'return',
    'reservation',
    'transfer',
] as const;

// Adjustment Types
export const ADJUSTMENT_TYPES = [
    { value: 'damage', label: 'Damage' },
    { value: 'return', label: 'Return' },
    { value: 'loss', label: 'Loss/Theft' },
    { value: 'found', label: 'Found' },
    { value: 'adjustment', label: 'Manual Adjustment' },
] as const;

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Layaway
export const DEFAULT_LAYAWAY_DEPOSIT_PERCENT = 20;
export const MIN_LAYAWAY_DEPOSIT_PERCENT = 10;
export const MAX_LAYAWAY_DEPOSIT_PERCENT = 90;
