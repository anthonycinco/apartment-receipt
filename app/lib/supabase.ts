import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only throw error on server side, not client side
if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create a dummy client if environment variables are missing (for client-side)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://dummy.supabase.co', 'dummy-key')

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string
          name: string
          address: string
          total_units: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          total_units: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          total_units?: number
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          site_id: string
          door_number: string
          phone: string
          base_rent: number
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          site_id: string
          door_number: string
          phone: string
          base_rent: number
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          site_id?: string
          door_number?: string
          phone?: string
          base_rent?: number
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      billing_records: {
        Row: {
          id: string
          site_id: string
          tenant_id: string
          date: string
          electricity_consumption: number
          water_consumption: number
          total_amount: number
          electricity_rate: number
          water_rate: number
          base_rent: number
          parking_fee: number
          other_charges: number
          damage_description: string
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          tenant_id: string
          date: string
          electricity_consumption: number
          water_consumption: number
          total_amount: number
          electricity_rate: number
          water_rate: number
          base_rent: number
          parking_fee: number
          other_charges: number
          damage_description: string
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          tenant_id?: string
          date?: string
          electricity_consumption?: number
          water_consumption?: number
          total_amount?: number
          electricity_rate?: number
          water_rate?: number
          base_rent?: number
          parking_fee?: number
          other_charges?: number
          damage_description?: string
          created_at?: string
        }
      }
    }
  }
} 