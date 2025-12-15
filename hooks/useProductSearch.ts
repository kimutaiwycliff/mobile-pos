// Product Search Hook - Algolia

import { useState, useEffect } from 'react';
import { algoliaClient, PRODUCTS_INDEX } from '@/lib/algolia/client';
import { Product } from '@/types/database.types';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';

interface UseProductSearchResult {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    search: (query: string) => void;
    clearSearch: () => void;
}

export function useProductSearch(): UseProductSearchResult {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            try {
                setIsLoading(true);
                setError(null);

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
                    setProducts(searchResult.hits as unknown as Product[]);
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
    }, [searchQuery]);

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
