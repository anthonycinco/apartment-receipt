import { supabase } from './supabase'
import type { Database } from './supabase'

type Site = Database['public']['Tables']['sites']['Row']
type Tenant = Database['public']['Tables']['tenants']['Row']
type BillingRecord = Database['public']['Tables']['billing_records']['Row']

// Sites
export const sitesService = {
  async getAll(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async create(site: Omit<Site, 'id' | 'created_at'>): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .insert(site)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Site>): Promise<Site> {
    const { data, error } = await supabase
      .from('sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Tenants
export const tenantsService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async getBySite(siteId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('site_id', siteId)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async create(tenant: Omit<Tenant, 'id' | 'created_at'>): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Billing Records
export const billingRecordsService = {
  async getAll(): Promise<BillingRecord[]> {
    const { data, error } = await supabase
      .from('billing_records')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getBySite(siteId: string): Promise<BillingRecord[]> {
    const { data, error } = await supabase
      .from('billing_records')
      .select('*')
      .eq('site_id', siteId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByTenant(tenantId: string): Promise<BillingRecord[]> {
    const { data, error } = await supabase
      .from('billing_records')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(record: Omit<BillingRecord, 'id' | 'created_at'>): Promise<BillingRecord> {
    const { data, error } = await supabase
      .from('billing_records')
      .insert(record)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<BillingRecord>): Promise<BillingRecord> {
    const { data, error } = await supabase
      .from('billing_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('billing_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Real-time subscriptions
export const subscribeToChanges = (callback: () => void) => {
  const sitesSubscription = supabase
    .channel('sites-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, callback)
    .subscribe()

  const tenantsSubscription = supabase
    .channel('tenants-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, callback)
    .subscribe()

  const billingSubscription = supabase
    .channel('billing-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'billing_records' }, callback)
    .subscribe()

  return () => {
    sitesSubscription.unsubscribe()
    tenantsSubscription.unsubscribe()
    billingSubscription.unsubscribe()
  }
} 