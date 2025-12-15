// Order API - Create Order

import { supabase } from '@/lib/supabase/client';
import { Order, OrderItem, Payment } from '@/types/database.types';
import { CartItem } from '@/types/cart.types';

interface CreateOrderInput {
    customerId: string | null;
    locationId: string;
    items: CartItem[];
    subtotal: number;
    totalDiscount: number;
    taxAmount: number;
    total: number;
    paymentMethod: string;
    amountPaid: number;
    notes: string | null;
}

interface CreateOrderResponse {
    order: Order;
    orderItems: OrderItem[];
    payment: Payment;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    try {
        // 1. Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: input.customerId,
                location_id: input.locationId,
                order_number: `ORD-${Date.now()}`, // Simple order number generation
                status: 'completed',
                payment_status: 'paid',
                subtotal: input.subtotal,
                discount_amount: input.totalDiscount,
                tax_amount: input.taxAmount,
                total_amount: input.total,
                notes: input.notes,
            })
            .select()
            .single();

        if (orderError) throw orderError;
        if (!order) throw new Error('Failed to create order');

        // 2. Create order items
        const orderItemsData = input.items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount_amount: item.itemDiscount,
            tax_amount: (item.unitPrice * item.quantity - item.itemDiscount) * (item.taxRate / 100),
            total_amount: item.unitPrice * item.quantity - item.itemDiscount,
        }));

        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData)
            .select();

        if (itemsError) throw itemsError;
        if (!orderItems) throw new Error('Failed to create order items');

        // 3. Create payment
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                order_id: order.id,
                payment_method: input.paymentMethod,
                amount: input.amountPaid,
                status: 'completed',
            })
            .select()
            .single();

        if (paymentError) throw paymentError;
        if (!payment) throw new Error('Failed to create payment');

        // 4. TODO: Update inventory (reduce stock)
        // This would be done via a Supabase function or trigger

        return {
            order,
            orderItems,
            payment,
        };
    } catch (error) {
        console.error('Create order error:', error);
        throw error;
    }
}
