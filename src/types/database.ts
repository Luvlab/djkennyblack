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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type Event = Database['public']['Tables']['events']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Service = Database['public']['Tables']['services']['Row']
