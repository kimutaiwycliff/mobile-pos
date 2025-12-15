import { supabase } from '@/lib/supabase/client';
import { ProductVariant } from '@/types/database.types';

export const getProductVariants = async (productId: string): Promise<ProductVariant[]> => {
    const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching variants:', error);
        throw error;
    }

    return data || [];
};
