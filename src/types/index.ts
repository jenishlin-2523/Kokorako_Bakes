export interface Product {
    id: string
    name: string
    description: string
    prices: Record<string, number>
    image_url: string
    category: string
    dietary_tags: string[]
    created_at?: string
}

export interface Order {
    id: string
    customer_name: string
    customer_phone: string
    customer_email?: string
    address: string
    total: number
    status: 'Pending' | 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled'
    delivery_date?: string
    delivery_time?: string
    items: any[]
    created_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    customization?: {
        weight?: string
        flavor?: string
        message?: string
    }
    price_at_order: number
}

export interface UserProfile {
    id: string
    name: string
    phone: string
    email: string
    loyalty_points: number
    total_orders: number
}
