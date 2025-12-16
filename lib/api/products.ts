import { supabase } from '@/lib/supabase/client';
import { ProductVariant } from '@/types/database.types';

export const getProductVariants = async (productId: string, locationId?: string): Promise<(ProductVariant & { quantity?: number })[]> => {
    try {
        const { data: variants, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .eq('is_active', true);

        if (error) throw error;

        if (!variants) return [];

        // If location provided, fetch inventory
        if (locationId) {
            const variantIds = variants.map(v => v.id);
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('variant_id, quantity')
                .in('variant_id', variantIds)
                .eq('location_id', locationId);

            if (inventoryError) {
                console.error('Error fetching variant inventory:', inventoryError);
                // Return variants without quantity or default 0?
                // Let's return as is, UI handles undefined
            }

            const inventoryMap = new Map();
            if (inventoryData) {
                inventoryData.forEach((item: any) => {
                    inventoryMap.set(item.variant_id, item.quantity);
                });
            }

            return variants.map(v => ({
                ...v,
                quantity: inventoryMap.get(v.id) ?? 0 // Default to 0 if no record found
            }));
        }

        return variants;
    } catch (error) {
        console.error('Error fetching variants:', error);
        throw error;
    }
};
