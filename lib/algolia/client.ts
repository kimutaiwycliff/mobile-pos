// Algolia Client Configuration

import {algoliasearch} from 'algoliasearch';

// Algolia configuration
const algoliaAppId = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID!;
const algoliaSearchKey = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY!;

if (!algoliaAppId || !algoliaSearchKey) {
    throw new Error('Missing Algolia environment variables');
}

// Create Algolia client
export const algoliaClient = algoliasearch(algoliaAppId, algoliaSearchKey);

// Index names
export const PRODUCTS_INDEX = process.env.EXPO_PUBLIC_ALGOLIA_PRODUCTS_INDEX || 'products';
export const INVENTORY_INDEX = process.env.EXPO_PUBLIC_ALGOLIA_INVENTORY_INDEX || 'inventory';
