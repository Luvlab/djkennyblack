export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          event_type: string
          event_date: string
          event_location: string | null
          guests: number | null
          message: string | null
          status: 'pending' | 'confirmed' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          event_type: string
          event_date: string
          event_location?: string | null
          guests?: number | null
          message?: string | null
          status?: 'pending' | 'confirmed' | 'declined'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          event_type?: string
          event_date?: string
          event_location?: string | null
          guests?: number | null
          message?: string | null
          status?: 'pending' | 'confirmed' | 'declined'
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          venue: string
          city: string
          event_date: string
          description: string | null
          image_url: string | null
          genres: string[] | null
          is_upcoming: boolean
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          venue: string
          city?: string
          event_date: string
          description?: string | null
          image_url?: string | null
          genres?: string[] | null
          is_upcoming?: boolean
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          venue?: string
          city?: string
          event_date?: string
          description?: string | null
          image_url?: string | null
          genres?: string[] | null
          is_upcoming?: boolean
          is_featured?: boolean
          created_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          client_name: string
          event_type: string | null
          message: string
          rating: number
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          event_type?: string | null
          message: string
          rating?: number
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          event_type?: string | null
          message?: string
          rating?: number
          is_featured?: boolean
          created_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          title: string
          description: string
          icon: string | null
          order_index: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string | null
          order_index?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: { key: string; value: string | null; label: string | null; type: string | null; group_name: string | null; updated_at: string | null }
        Insert: { key: string; value?: string | null; label?: string | null; type?: string | null; group_name?: string | null; updated_at?: string | null }
        Update: { key?: string; value?: string | null; label?: string | null; type?: string | null; group_name?: string | null; updated_at?: string | null }
        Relationships: []
      }
      admin_users: {
        Row: { id: string; email: string; role: string; created_at: string }
        Insert: { id?: string; email: string; role?: string; created_at?: string }
        Update: { id?: string; email?: string; role?: string; created_at?: string }
        Relationships: []
      }
      products: {
        Row: {
          id: string; slug: string; name: string; description: string | null
          price_sek: number; price_eur: number | null
          type: 'book' | 'ticket' | 'merch' | 'digital'
          fulfillment: 'printful' | 'manual' | 'digital' | 'ticket'
          images: string[]; printful_sync_id: string | null; printful_variant_ids: Record<string, string> | null
          event_id: string | null; ticket_quantity: number | null; tickets_sold: number
          digital_file_url: string | null; variants: ProductVariant[]
          is_active: boolean; is_featured: boolean; sort_order: number
          metadata: Record<string, unknown>; created_at: string
        }
        Insert: {
          id?: string; slug: string; name: string; description?: string | null
          price_sek: number; price_eur?: number | null
          type?: 'book' | 'ticket' | 'merch' | 'digital'
          fulfillment?: 'printful' | 'manual' | 'digital' | 'ticket'
          images?: string[]; printful_sync_id?: string | null; printful_variant_ids?: Record<string, string> | null
          event_id?: string | null; ticket_quantity?: number | null; tickets_sold?: number
          digital_file_url?: string | null; variants?: ProductVariant[]
          is_active?: boolean; is_featured?: boolean; sort_order?: number
          metadata?: Record<string, unknown>; created_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string; order_number: string
          customer_name: string; customer_email: string; customer_phone: string | null
          shipping_address: ShippingAddress | null; items: OrderItem[]
          subtotal: number; shipping: number; total: number; currency: string
          status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'cancelled'
          stripe_session_id: string | null; stripe_payment_intent: string | null
          printful_order_id: string | null; ticket_codes: TicketCode[]
          notes: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; order_number: string
          customer_name: string; customer_email: string; customer_phone?: string | null
          shipping_address?: ShippingAddress | null; items: OrderItem[]
          subtotal: number; shipping?: number; total: number; currency?: string
          status?: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'cancelled'
          stripe_session_id?: string | null; stripe_payment_intent?: string | null
          printful_order_id?: string | null; ticket_codes?: TicketCode[]
          notes?: string | null; created_at?: string; updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Booking = Database['public']['Tables']['bookings']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']

export interface ProductVariant { id: string; name: string; price_sek?: number; printful_id?: string; stock?: number }
export interface OrderItem { product_id: string; product_name: string; variant_id?: string; variant_name?: string; qty: number; price_sek: number; type: string; fulfillment?: string; printful_id?: string }
export interface ShippingAddress { name: string; line1: string; line2?: string; city: string; postal_code: string; country: string }
export interface TicketCode { code: string; product_id: string; product_name: string; event_id?: string; used: boolean; issued_at: string }

export type CartItem = { product: Product; variant_id?: string; variant_name?: string; qty: number; unit_price: number }
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type Event = Database['public']['Tables']['events']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Service = Database['public']['Tables']['services']['Row']
