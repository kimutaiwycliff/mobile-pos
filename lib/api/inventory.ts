// Inventory API

import { supabase } from '@/lib/supabase/client';
import { Inventory, StockMovement } from '@/types/database.types';

export interface InventoryItem extends Omit<Inventory, 'product' | 'variant'> {
    product?: {
        name: string;
        sku: string;
        image_url: string | null;
        barcode: string;
        selling_price: number;
        cost_price: number;
    };
    variant?: {
        name: string;
        sku: string;
        image_url: string | null;
        barcode: string;
        selling_price: number;
        cost_price: number;
    };
}

export interface StockAdjustmentInput {
    inventoryId: string;
    productId: string;
    variantId: string | null;
    locationId: string;
    quantityChange: number;
    reason: 'receive' | 'damage' | 'loss' | 'correction' | 'transfer';
    notes?: string;
}

export async function getInventory(
    locationId?: string,
    searchQuery?: string
): Promise<InventoryItem[]> {
    try {
        const selectQuery = `
            *,
            product:products(name, sku, barcode, image_url, selling_price, cost_price),
            variant:product_variants(name, sku, barcode, image_path, selling_price, cost_price)
        `;

        let query = supabase
            .from('inventory')
            .select(selectQuery)
            .order('updated_at', { ascending: false });

        // Filter by location if provided and valid (not default placeholder if that's what's passed)
        if (locationId && locationId !== 'default-location-id' && locationId !== 'all') {
            query = query.eq('location_id', locationId);
        }

        const { data, error } = await query;

        if (error) throw error;

        let inventory = data as InventoryItem[];

        // Client-side search filtering (as fallback for now, similar to web)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            inventory = inventory.filter(item =>
                (item.product?.name?.toLowerCase().includes(lowerQuery)) ||
                (item.product?.sku?.toLowerCase().includes(lowerQuery)) ||
                (item.variant?.name?.toLowerCase().includes(lowerQuery)) ||
                (item.variant?.sku?.toLowerCase().includes(lowerQuery))
            );
        }

        return inventory;
    } catch (error) {
        console.error('Get inventory error:', error);
        throw error;
    }
}

export async function adjustStock(input: StockAdjustmentInput): Promise<void> {
    try {
        // 1. Create Stock Movement Record
        const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
                product_id: input.productId,
                variant_id: input.variantId,
                location_id: input.locationId,
                movement_type: mapReasonToMovementType(input.reason),
                quantity: input.quantityChange,
                reference_type: 'adjustment',
                notes: input.notes
            });

        if (movementError) throw movementError;

        // 2. Update Inventory Count
        // We can use an RPC function if available for atomicity, or simple update.
        // For atomic updates, supabase `.rpc('increment', ...)` is best.
        // If not using RPC, we risk race conditions, but for MVP:

        // Fetch current to be safe? Or just use Postgres increment syntax if Supabase supports it easily via .rpc
        // Let's assume we don't have a specific RPC yet, so we'll do read-modify-write or assume single user for a moment.
        // Actually, let's use a custom RPC if we can, or just standard update. 
        // Better yet, usually `inventory` triggers update on `stock_movements` insert if set up that way.
        // If we assume no triggers, we must update manually.

        const { data: currentInventory, error: fetchError } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('id', input.inventoryId)
            .single();

        if (fetchError) throw fetchError;

        const newQuantity = (currentInventory?.quantity || 0) + input.quantityChange;

        const { error: updateError } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq('id', input.inventoryId);

        if (updateError) throw updateError;

    } catch (error) {
        console.error('Adjust stock error:', error);
        throw error;
    }
}

function mapReasonToMovementType(reason: string): string {
    switch (reason) {
        case 'receive': return 'purchase';
        case 'damage': return 'damage';
        case 'loss': return 'adjustment'; // 'adjustment' is a catch-all or specific type
        case 'correction': return 'adjustment';
        case 'transfer': return 'transfer';
        default: return 'adjustment';
    }
}
