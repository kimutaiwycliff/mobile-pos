// React Query Configuration

import { QueryClient } from '@tanstack/react-query';
import { CACHE_TIME, STALE_TIME } from '@/utils/constants';

// Create Query Client with default options
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Default cache time: 5 minutes
            gcTime: CACHE_TIME.PRODUCTS,
            // Default stale time: 2 minutes
            staleTime: STALE_TIME.PRODUCTS,
            // Retry failed requests
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Refetch on mount
            refetchOnMount: true,
        },
        mutations: {
            // Retry failed mutations
            retry: 1,
            retryDelay: 1000,
        },
    },
});

// Query keys factory
export const queryKeys = {
    // Products
    products: {
        all: ['products'] as const,
        lists: () => [...queryKeys.products.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.products.details(), id] as const,
    },

    // Inventory
    inventory: {
        all: ['inventory'] as const,
        lists: () => [...queryKeys.inventory.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.inventory.lists(), filters] as const,
        details: () => [...queryKeys.inventory.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.inventory.details(), id] as const,
    },

    // Orders
    orders: {
        all: ['orders'] as const,
        lists: () => [...queryKeys.orders.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.orders.lists(), filters] as const,
        details: () => [...queryKeys.orders.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    },

    // Customers
    customers: {
        all: ['customers'] as const,
        lists: () => [...queryKeys.customers.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.customers.lists(), filters] as const,
        details: () => [...queryKeys.customers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    },

    // Suppliers
    suppliers: {
        all: ['suppliers'] as const,
        lists: () => [...queryKeys.suppliers.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.suppliers.lists(), filters] as const,
        details: () => [...queryKeys.suppliers.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.suppliers.details(), id] as const,
    },

    // Categories
    categories: {
        all: ['categories'] as const,
        lists: () => [...queryKeys.categories.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.categories.lists(), filters] as const,
    },

    // Purchase Orders
    purchaseOrders: {
        all: ['purchase-orders'] as const,
        lists: () => [...queryKeys.purchaseOrders.all, 'list'] as const,
        list: (filters: any) => [...queryKeys.purchaseOrders.lists(), filters] as const,
        details: () => [...queryKeys.purchaseOrders.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.purchaseOrders.details(), id] as const,
    },

    // Analytics
    analytics: {
        all: ['analytics'] as const,
        dashboard: (dateRange: any) => [...queryKeys.analytics.all, 'dashboard', dateRange] as const,
        sales: (dateRange: any) => [...queryKeys.analytics.all, 'sales', dateRange] as const,
    },

    // Locations
    locations: {
        all: ['locations'] as const,
        active: () => [...queryKeys.locations.all, 'active'] as const,
    },

    // Discounts
    discounts: {
        all: ['discounts'] as const,
        validate: (code: string) => [...queryKeys.discounts.all, 'validate', code] as const,
    },
};
