// Database Schema TypeScript Interfaces
// This file contains all database table interfaces matching the Supabase backend

// ============================================================================
// 1. CATEGORIES
// ============================================================================
export interface Category {
    id: string;                    // UUID, primary key
    name: string;                  // Category name
    slug: string;                  // URL-friendly slug (unique)
    description: string | null;    // Optional description
    parent_id: string | null;      // Self-referencing FK for subcategories
    image_path: string | null;     // Category image path in storage
    sort_order: number;            // Display order
    is_active: boolean;            // Active status
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp
}

// ============================================================================
// 2. SUPPLIERS
// ============================================================================
export interface Supplier {
    id: string;                    // UUID, primary key
    name: string;                  // Supplier name
    contact_person: string | null; // Contact person name
    email: string | null;          // Email address
    phone: string | null;          // Phone number
    address: string | null;        // Physical address
    city: string | null;           // City
    country: string | null;        // Country
    payment_terms: string | null;  // Payment terms description
    lead_time_days: number | null; // Lead time in days
    is_active: boolean;            // Active status
    notes: string | null;          // Additional notes
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp
}

// ============================================================================
// 3. PRODUCTS
// ============================================================================
export interface Product {
    id: string;                    // UUID, primary key
    name: string;                  // Product name
    slug: string;                  // URL-friendly slug (unique)
    description: string | null;    // Product description
    sku: string;                   // Stock Keeping Unit (unique)
    barcode: string;               // Barcode (unique)
    category_id: string | null;    // FK to categories
    supplier_id: string | null;    // FK to suppliers
    brand: string | null;          // Brand name
    cost_price: number;            // Cost price (decimal)
    selling_price: number;         // Selling price (decimal)
    compare_at_price: number | null; // Original price for showing discounts
    tax_rate: number;              // Tax rate as percentage (e.g., 16 for 16%)
    weight: number | null;         // Product weight
    weight_unit: string | null;    // Weight unit (kg, g, lb, oz)
    is_active: boolean;            // Active status
    is_featured: boolean;          // Featured product flag
    has_variants: boolean;         // Has variants flag
    track_inventory: boolean;      // Track inventory flag
    allow_backorder: boolean;      // Allow backorder flag
    low_stock_threshold: number;   // Low stock alert threshold
    image_url: string | null;      // Main product image URL
    images: string[];              // Array of image URLs
    tags: string[];                // Array of tags for filtering
    meta_title: string | null;     // SEO title
    meta_description: string | null; // SEO description
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp

    // Relations (populated via joins)
    category?: Category;
    supplier?: Supplier;
}

// ============================================================================
// 4. PRODUCT VARIANTS
// ============================================================================
export interface ProductVariant {
    id: string;                    // UUID, primary key
    product_id: string;            // FK to products
    sku: string;                   // Variant SKU (unique)
    barcode: string;               // Variant barcode (unique)
    option_values: Record<string, string>; // JSON object: {size: "L", color: "Red"}
    cost_price: number;     // Override cost price
    selling_price: number;  // Override selling price
    compare_at_price: number; // Override compare price
    weight: number | null;         // Override weight
    image_url: string | null;      // Variant-specific image
    is_active: boolean;            // Active status
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp
    name: string;                  // Generated variant name (e.g., "Red / L")
    tax_rate: number;              // Tax rate (inherited or override)
}

// ============================================================================
// 5. LOCATIONS
// ============================================================================
export interface Location {
    id: string;                    // UUID, primary key
    name: string;                  // Location/Store name
    address: string | null;        // Physical address
    city: string | null;           // City
    country: string | null;        // Country
    phone: string | null;          // Phone number
    is_active: boolean;            // Active status
    is_default: boolean;           // Default location flag
    created_at: string;            // ISO timestamp
}

// ============================================================================
// 6. INVENTORY
// ============================================================================
export interface Inventory {
    id: string;                    // UUID, primary key
    product_id: string | null;     // FK to products (null if variant)
    variant_id: string | null;     // FK to product_variants
    location_id: string;           // FK to locations
    quantity: number;              // Current available quantity
    reserved_quantity: number;     // Reserved for layaway/holds
    reorder_point: number;         // Reorder threshold
    reorder_quantity: number;      // Suggested reorder quantity
    bin_location: string | null;   // Physical bin/shelf location
    updated_at: string;            // ISO timestamp

    // Relations
    product?: Product;
    variant?: ProductVariant;
    location?: Location;
}

// ============================================================================
// 7. CUSTOMERS
// ============================================================================
export interface Customer {
    id: string;                    // UUID, primary key
    first_name: string;            // First name
    last_name: string;             // Last name
    email: string | null;          // Email address (optional)
    phone: string | null;          // Phone number (optional)
    address: string | null;        // Physical address
    city: string | null;           // City
    country: string | null;        // Country
    notes: string | null;          // Customer notes
    loyalty_points: number;        // Loyalty points balance
    total_spent: number;           // Total amount spent (lifetime)
    total_orders: number;          // Total number of orders
    is_active: boolean;            // Active status
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp
}

// ============================================================================
// 8. ORDERS
// ============================================================================
export interface Order {
    id: string;                    // UUID, primary key
    order_number: string;          // Auto-generated order number (unique)
    customer_id: string | null;    // FK to customers (optional - walk-in sales)
    location_id: string;           // FK to locations
    status: "pending" | "processing" | "completed" | "cancelled" | "refunded" | "layaway";
    payment_status: "pending" | "partial" | "refunded" | "completed";
    subtotal: number;              // Subtotal before tax and discounts
    discount_amount: number;       // Total discount applied
    tax_amount: number;            // Total tax amount
    total_amount: number;          // Final total (subtotal - discount + tax)
    paid_amount: number;           // Amount paid (for partial/layaway)
    change_amount: number;         // Change given to customer
    notes: string | null;          // Order notes
    staff_id: string | null;       // FK to auth.users (staff member)
    discount_id: string | null;    // FK to discounts
    completed_at: string | null;   // Order completion timestamp
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp

    // Layaway-specific fields
    layaway_customer_name: string | null;    // Customer name for layaway
    layaway_customer_phone: string | null;   // Customer phone for layaway
    layaway_due_date: string | null;         // Due date for full payment
    layaway_deposit_percent: number | null;  // Deposit percentage (e.g., 20)

    // Relations
    items?: OrderItem[];
    payments?: Payment[];
    customer?: Customer;
}

// ============================================================================
// 9. ORDER ITEMS
// ============================================================================
export interface OrderItem {
    id: string;                    // UUID, primary key
    order_id: string;              // FK to orders
    product_id: string | null;     // FK to products
    variant_id: string | null;     // FK to product_variants
    product_name: string;          // Product name snapshot
    variant_name: string | null;   // Variant name snapshot
    sku: string;                   // SKU snapshot
    quantity: number;              // Quantity ordered
    unit_price: number;            // Unit price at time of order
    cost_price: number;            // Cost price at time of order
    discount_amount: number;       // Discount amount per item
    tax_amount: number;            // Tax amount per item
    total_amount: number;          // Total for this line item
}

// ============================================================================
// 10. PAYMENTS
// ============================================================================
export interface Payment {
    id: string;                    // UUID, primary key
    order_id: string;              // FK to orders
    payment_method: "cash" | "mpesa" | "card" | "bank_transfer" | "credit";
    amount: number;                // Payment amount
    reference_number: string | null; // Payment reference/transaction ID
    mpesa_receipt: string | null;  // M-Pesa receipt number
    mpesa_phone: string | null;    // M-Pesa phone number
    status: "pending" | "completed" | "failed" | "refunded";
    processed_at: string | null;   // Processing timestamp
    created_at: string;            // ISO timestamp
}

// ============================================================================
// 11. DISCOUNTS
// ============================================================================
export interface Discount {
    id: string;                    // UUID, primary key
    code: string;                  // Discount code (unique)
    name: string;                  // Discount name/description
    description: string | null;    // Detailed description
    discount_type: "percentage" | "fixed_amount" | "buy_x_get_y";
    discount_value: number;        // Discount value (percentage or amount)
    min_purchase_amount: number | null; // Minimum purchase requirement
    max_discount_amount: number | null; // Maximum discount cap
    usage_limit: number | null;    // Total usage limit (null = unlimited)
    usage_count: number;           // Current usage count
    per_customer_limit: number | null; // Per customer usage limit
    start_date: string | null;     // Start date (ISO)
    end_date: string | null;       // End date (ISO)
    is_active: boolean;            // Active status
    applies_to: "all" | "specific_products" | "specific_categories";
    product_ids: string[];         // Array of product UUIDs
    category_ids: string[];        // Array of category UUIDs
    created_at: string;            // ISO timestamp
}

// ============================================================================
// 12. PURCHASE ORDERS
// ============================================================================
export interface PurchaseOrder {
    id: string;                    // UUID, primary key
    po_number: string;             // Auto-generated PO number (unique)
    supplier_id: string;           // FK to suppliers
    location_id: string;           // FK to locations
    status: "draft" | "sent" | "partial" | "received" | "cancelled";
    subtotal: number;              // Subtotal
    tax_amount: number;            // Tax amount
    shipping_cost: number;         // Shipping cost
    total: number;                 // Total amount
    expected_date: string | null;  // Expected delivery date (ISO)
    received_date: string | null;  // Actual received date (ISO)
    notes: string | null;          // PO notes
    created_at: string;            // ISO timestamp
    updated_at: string;            // ISO timestamp

    // Relations
    supplier?: Supplier;
    items?: PurchaseOrderItem[];
}

// ============================================================================
// 13. PURCHASE ORDER ITEMS
// ============================================================================
export interface PurchaseOrderItem {
    id: string;                    // UUID, primary key
    purchase_order_id: string;     // FK to purchase_orders
    product_id: string | null;     // FK to products
    variant_id: string | null;     // FK to product_variants
    quantity_ordered: number;      // Quantity ordered
    quantity_received: number;     // Quantity received so far
    unit_cost: number;             // Unit cost
    total: number;                 // Total cost (quantity_ordered * unit_cost)
}

// ============================================================================
// 14. STOCK MOVEMENTS
// ============================================================================
export interface StockMovement {
    id: string;                    // UUID, primary key
    product_id: string | null;     // FK to products
    variant_id: string | null;     // FK to product_variants
    location_id: string;           // FK to locations
    movement_type: "sale" | "purchase" | "adjustment" | "damage" | "return" | "reservation" | "transfer";
    quantity: number;              // Quantity moved (negative for outbound)
    reference_type: string | null; // "order", "purchase_order", "adjustment"
    reference_id: string | null;   // FK to reference entity
    notes: string | null;          // Movement notes
    created_at: string;            // ISO timestamp
}

// ============================================================================
// 15. REORDER ALERTS
// ============================================================================
export interface ReorderAlert {
    id: string;                    // UUID, primary key
    product_id: string | null;     // FK to products
    variant_id: string | null;     // FK to product_variants
    location_id: string;           // FK to locations
    current_quantity: number;      // Current stock level
    reorder_point: number;         // Reorder threshold
    suggested_quantity: number;    // Suggested reorder quantity
    status: "pending" | "ordered" | "dismissed";
    purchase_order_id: string | null; // FK to purchase_orders (if ordered)
    created_at: string;            // ISO timestamp
    resolved_at: string | null;    // Resolution timestamp
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// User type from Supabase Auth
export interface User {
    id: string;
    email: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
    created_at: string;
}

// Session type from Supabase Auth
export interface Session {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: User;
}

// API Response wrapper
export interface ApiResponse<T> {
    data: T | null;
    error: Error | null;
}

// Pagination metadata
export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// Paginated response
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
