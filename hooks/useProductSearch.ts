// Product Search Hook - Algolia

import { useState, useEffect } from 'react';
import { algoliaClient, PRODUCTS_INDEX } from '@/lib/algolia/client';
import { Product } from '@/types/database.types';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/stores/useCartStore';

interface UseProductSearchResult {
    products: (Product & { quantity?: number })[];
    isLoading: boolean;
    error: string | null;
    search: (query: string) => void;
    clearSearch: () => void;
}

export function useProductSearch(): UseProductSearchResult {
    const [products, setProducts] = useState<(Product & { quantity?: number })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { locationId } = useCartStore();

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            try {
                // If query is empty, maybe don't search or search all? 
                // Currently existing code searches even if empty (Algolia handles it).

                setIsLoading(true);
                setError(null);

                // 1. Search Algolia
                const { results } = await algoliaClient.search({
                    requests: [
                        {
                            indexName: PRODUCTS_INDEX,
                            query: searchQuery,
                            filters: 'is_active:true',
                            hitsPerPage: 50,
                        },
                    ],
                });

                const searchResult = results[0];
                if (searchResult && 'hits' in searchResult) {
                    const hits = searchResult.hits;

                    if (hits.length === 0) {
                        setProducts([]);
                        return;
                    }

                    // 2. Map basic products
                    const mappedProducts = hits.map((hit: any) => ({
                        ...hit,
                        id: hit.id || hit.objectID
                    }));

                    // 3. Fetch Inventory for these products
                    const productIds = mappedProducts.map((p: any) => p.id);

                    // Fetch inventory for the current location
                    const { data: inventoryData, error: inventoryError } = await supabase
                        .from('inventory')
                        .select('product_id, quantity')
                        .in('product_id', productIds)
                        .eq('location_id', locationId);

                    if (inventoryError) {
                        console.error('Error fetching inventory:', inventoryError);
                        // Fallback: don't block display, just assume no stock info
                    }

                    const inventoryMap = new Map<string, number>();
                    if (inventoryData) {
                        inventoryData.forEach((item: any) => {
                            // If product has variants, stock is distributed.
                            // We should sum it up for the parent product display.
                            const existing = inventoryMap.get(item.product_id) || 0;
                            inventoryMap.set(item.product_id, existing + item.quantity);
                        });
                    }

                    // 4. Merge Inventory
                    const productsWithStock = mappedProducts.map((p: any) => {
                        const stock = inventoryMap.get(p.id);
                        // If tracking inventory, use actual stock (default 0 if missing). 
                        // If not tracking, assume explicitly high number.
                        const trackInventory = p.track_inventory ?? true; // Default to true if missing
                        const quantity = trackInventory ? (stock ?? 0) : 10000;

                        return {
                            ...p,
                            quantity
                        };
                    });

                    setProducts(productsWithStock as (Product & { quantity?: number })[]);
                } else {
                    setProducts([]);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to search products');
                console.error('Product search error:', err);
            } finally {
                setIsLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, locationId]);

    const search = (query: string) => {
        setSearchQuery(query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setProducts([]);
    };

    return {
        products,
        isLoading,
        error,
        search,
        clearSearch,
    };
}
