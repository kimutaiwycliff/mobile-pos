// Order API - Create Order

import { supabase } from '@/lib/supabase/client';
import { Order, OrderItem, Payment } from '@/types/database.types';
import { CartItem } from '@/types/cart.types';
import { processSaleStockReduction } from '@/lib/api/inventory';

interface CreateOrderInput {
    customerId: string | null;
    locationId: string;
    items: CartItem[];
    subtotal: number;
    totalDiscount: number;
    taxAmount: number;
    total: number;
    payments: { paymentMethod: string; amount: number }[];
    notes: string | null;
    // Layaway specific fields
    isLayaway?: boolean;
    layawayCustomerName?: string;
    layawayCustomerPhone?: string;
    layawayDueDate?: Date;
    layawayDepositPercent?: number;
}

interface CreateOrderResponse {
    order: Order;
    orderItems: OrderItem[];
    payments: Payment[];
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    // Never create an order with no line items. This is what produced the
    // historical "0 items sold" orders: the order row was committed and then
    // the order_items insert failed (RLS / dropped mobile connection) with no
    // rollback, leaving an orphaned order.
    if (!input.items || input.items.length === 0) {
        throw new Error('Cannot create an order with no items.');
    }

    // order_items.sku is NOT NULL. A missing sku means the cart item came from
    // an incomplete source (e.g. a stale Algolia record). Fail early with a
    // clear message instead of letting Postgres reject the insert.
    const itemMissingSku = input.items.find((item) => !item.sku);
    if (itemMissingSku) {
        throw new Error(
            `"${itemMissingSku.name}" is missing a SKU. Remove it and re-add it from search, then try again.`
        );
    }

    // Track the created order id so we can roll it back if items never get saved.
    let createdOrderId: string | null = null;
    let itemsCreated = false;

    try {
        const isLayaway = input.isLayaway || false;
        const status = isLayaway ? 'layaway' : 'completed';
        const paymentStatus = isLayaway ? 'partial' : 'completed';

        // Calculate total paid from payments array
        const amountPaid = input.payments.reduce((sum, p) => sum + p.amount, 0);

        // 1. Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: input.customerId,
                location_id: input.locationId,
                order_number: `ORD-${Date.now()}`, // Simple order number generation
                status: status,
                payment_status: paymentStatus,
                subtotal: input.subtotal,
                discount_amount: input.totalDiscount,
                tax_amount: input.taxAmount,
                total_amount: input.total,
                paid_amount: amountPaid,
                notes: input.notes,
                // Layaway fields
                layaway_customer_name: input.layawayCustomerName || null,
                layaway_customer_phone: input.layawayCustomerPhone || null,
                layaway_due_date: input.layawayDueDate ? input.layawayDueDate.toISOString() : null,
                layaway_deposit_percent: input.layawayDepositPercent || null,
            })
            .select()
            .single();

        if (orderError) throw orderError;
        if (!order) throw new Error('Failed to create order');

        createdOrderId = order.id;

        // 2. Create order items
        const orderItemsData = input.items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            product_name: item.name,
            variant_name: item.variantName || null,
            sku: item.sku,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            cost_price: item.costPrice,
            discount_amount: item.itemDiscount,
            tax_amount: (item.unitPrice * item.quantity - item.itemDiscount) * (item.taxRate / 100),
            total_amount: item.unitPrice * item.quantity - item.itemDiscount,
        }));

        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData)
            .select();

        if (itemsError) throw itemsError;
        if (!orderItems || orderItems.length === 0) throw new Error('Failed to create order items');

        itemsCreated = true;

        // 3. Create payments (Multiple)
        const paymentsData = input.payments.map(p => ({
            order_id: order.id,
            payment_method: p.paymentMethod,
            amount: p.amount,
            status: 'completed',
        }));

        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .insert(paymentsData)
            .select();

        if (paymentsError) throw paymentsError;
        if (!payments) throw new Error('Failed to create payments');

        // 4. Update inventory (reduce stock)
        await processSaleStockReduction(
            order.id,
            input.locationId,
            input.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            }))
        );

        return {
            order,
            orderItems,
            payments,
        };
    } catch (error) {
        console.error('Create order error:', error);
        // Roll back the order only if its items were never saved, so it can
        // never appear with 0 items. Once items exist the order is valid and a
        // later (payment / inventory) failure must not delete a real sale.
        if (createdOrderId && !itemsCreated) {
            const { error: rollbackError } = await supabase
                .from('orders')
                .delete()
                .eq('id', createdOrderId);
            if (rollbackError) {
                console.error('Failed to roll back order', createdOrderId, rollbackError);
            }
        }
        throw error;
    }
}

export async function getOrders(statusFilter?: string): Promise<Order[]> {
    try {
        let query = supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*),
                customer:customers(*)
            `)
            .order('created_at', { ascending: false });

        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Get orders error:', error);
        throw error;
    }
}

export async function addOrderPayment(orderId: string, amount: number, paymentMethod: string): Promise<Payment> {
    try {
        // 1. Get current order to check balance
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) throw new Error('Order not found');

        const newPaidAmount = (order.paid_amount || 0) + amount;
        const isFullyPaid = newPaidAmount >= order.total_amount;

        // 2. Create Payment
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: orderId,
                payment_method: paymentMethod,
                amount: amount,
                status: 'completed'
            })
            .select()
            .single();

        if (paymentError) throw paymentError;

        // 3. Update Order
        const updates: any = {
            paid_amount: newPaidAmount,
            updated_at: new Date().toISOString()
        };

        if (isFullyPaid) {
            updates.payment_status = 'completed';
            updates.status = 'completed'; // Move from layaway to completed
            updates.completed_at = new Date().toISOString();
        } else {
            // Still partial
            updates.payment_status = 'partial';
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId);

        if (updateError) throw updateError;

        return payment;
    } catch (error) {
        console.error('Add payment error:', error);
        throw error;
    }
}
