// Analytics API

import { supabase } from '@/lib/supabase/client';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface SalesMetrics {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscount: number;
    totalTax: number;
    period: string;
}

export interface InventoryMetrics {
    totalItems: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
}

export interface SalesTrendData {
    label: string;
    amount: number;
    date: string;
}

export interface TopProduct {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
}

export async function getSalesMetrics(
    locationId?: string,
    period: 'today' | 'week' | 'month' = 'today'
): Promise<SalesMetrics> {
    try {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (period === 'today') {
            startDate = startOfDay(now);
            endDate = endOfDay(now);
        } else if (period === 'week') {
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            endDate = endOfWeek(now, { weekStartsOn: 1 });
        } else {
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        }

        let query = supabase
            .from('orders')
            .select('total_amount, subtotal, discount_amount, tax_amount')
            .eq('status', 'completed')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (locationId && locationId !== 'all') {
            query = query.eq('location_id', locationId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const metrics = (data || []).reduce(
            (acc, order) => ({
                totalSales: acc.totalSales + order.total_amount,
                totalOrders: acc.totalOrders + 1,
                totalDiscount: acc.totalDiscount + order.discount_amount,
                totalTax: acc.totalTax + order.tax_amount,
            }),
            { totalSales: 0, totalOrders: 0, totalDiscount: 0, totalTax: 0 }
        );

        return {
            ...metrics,
            averageOrderValue: metrics.totalOrders > 0 ? metrics.totalSales / metrics.totalOrders : 0,
            period,
        };
    } catch (error) {
        console.error('Error fetching sales metrics:', error);
        throw error;
    }
}

export async function getSalesTrend(
    locationId?: string,
    period: 'week' | 'month' = 'week'
): Promise<SalesTrendData[]> {
    try {
        const now = new Date();
        const days = period === 'week' ? 7 : 30;
        const startDate = subDays(now, days);

        // Fetch all completed orders in range
        let query = supabase
            .from('orders')
            .select('created_at, total_amount')
            .eq('status', 'completed')
            .gte('created_at', startDate.toISOString());

        if (locationId && locationId !== 'all') {
            query = query.eq('location_id', locationId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Group by day
        const dailySales: Record<string, number> = {};

        // Initialize all days with 0
        for (let i = 0; i < days; i++) {
            const dateStr = format(subDays(now, i), 'yyyy-MM-dd');
            dailySales[dateStr] = 0;
        }

        (data || []).forEach(order => {
            const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
            if (dailySales[dateStr] !== undefined) {
                dailySales[dateStr] += order.total_amount;
            }
        });

        // Convert to array
        return Object.entries(dailySales)
            .map(([date, amount]) => ({
                date,
                amount,
                label: format(new Date(date), 'MMM dd'),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

    } catch (error) {
        console.error('Error fetching sales trend:', error);
        throw error;
    }
}

export async function getInventoryMetrics(locationId?: string): Promise<InventoryMetrics> {
    try {
        // Fetch inventory with related product details for separate cost/price
        // Note: This matches the structure we used in getInventory, but getting ALL items for calculation
        // might be heavy. For MVP we'll do it. Ideally use a SQL view or RPC.

        const selectQuery = `
            quantity,
            reorder_point,
            product:products(cost_price, selling_price),
            variant:product_variants(cost_price, selling_price)
        `;

        let query = supabase
            .from('inventory')
            .select(selectQuery);

        if (locationId && locationId !== 'all') {
            query = query.eq('location_id', locationId);
        }

        const { data, error } = await query;
        if (error) throw error;

        let totalItems = 0;
        let totalStockValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        (data || []).forEach((item: any) => {
            const qty = item.quantity;
            totalItems += qty;

            const cost = item.variant?.cost_price ?? item.product?.cost_price ?? 0;
            totalStockValue += qty * cost;

            if (qty <= 0) outOfStockCount++;
            else if (qty <= (item.reorder_point || 0)) lowStockCount++;
        });

        return {
            totalItems,
            totalStockValue,
            lowStockCount,
            outOfStockCount
        };
    } catch (error) {
        console.error('Error fetching inventory metrics:', error);
        throw error;
    }
}
