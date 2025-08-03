// Shared storage for multi-user data
export interface SharedData {
  sites: Site[]
  tenants: Tenant[]
  billingRecords: BillingRecord[]
  lastUpdated: string
}

export interface Site {
  id: string
  name: string
  address: string
  totalUnits: number
}

export interface Tenant {
  id: string
  name: string
  siteId: string
  doorNumber: string
  phone: string
  email: string
  baseRent: number
  status: 'active' | 'inactive'
}

export interface BillingRecord {
  id: string
  tenantId: string
  siteId: string
  month: string
  year: string
  electricityConsumption: number
  waterConsumption: number
  totalAmount: number
  date: string
  billingData?: any
}

// Shared data storage using API and localStorage
class SharedStorage {
  private static instance: SharedStorage
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncTime: number = 0
  private readonly SYNC_INTERVAL = 3000 // 3 seconds

  private constructor() {
    this.startSync()
  }

  static getInstance(): SharedStorage {
    if (!SharedStorage.instance) {
      SharedStorage.instance = new SharedStorage()
    }
    return SharedStorage.instance
  }

  private startSync() {
    this.syncInterval = setInterval(() => {
      this.syncData()
    }, this.SYNC_INTERVAL)
  }

  private async syncData() {
    try {
      // Get current local data
      const currentData = this.getCurrentData()
      
      // Try to fetch from API first
      try {
        const response = await fetch('/api/shared-data')
        if (response.ok) {
          const serverData = await response.json()
          
          // Merge server data with local data
          const mergedData = this.mergeData(serverData, currentData)
          
          // Update local storage with merged data
          this.updateLocalStorage(mergedData)
          
          // Send merged data back to server
          await fetch('/api/shared-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mergedData)
          })
        }
      } catch (error) {
        console.log('API not available, using localStorage sync')
        // Fallback to localStorage sync
        this.syncWithLocalStorage()
      }
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  private mergeData(shared: SharedData, current: any) {
    const merged = {
      sites: [...current.sites],
      tenants: [...current.tenants],
      billingRecords: [...current.billingRecords]
    }

    // Merge sites
    const siteIds = new Set(current.sites.map((s: Site) => s.id))
    shared.sites.forEach(site => {
      if (!siteIds.has(site.id)) {
        merged.sites.push(site)
      }
    })

    // Merge tenants
    const tenantIds = new Set(current.tenants.map((t: Tenant) => t.id))
    shared.tenants.forEach(tenant => {
      if (!tenantIds.has(tenant.id)) {
        merged.tenants.push(tenant)
      }
    })

    // Merge billing records
    const recordIds = new Set(current.billingRecords.map((r: BillingRecord) => r.id))
    shared.billingRecords.forEach(record => {
      if (!recordIds.has(record.id)) {
        merged.billingRecords.push(record)
      }
    })

    return merged
  }

  private updateLocalStorage(data: any) {
    if (typeof window === 'undefined') return
    localStorage.setItem('sites', JSON.stringify(data.sites))
    localStorage.setItem('tenants', JSON.stringify(data.tenants))
    localStorage.setItem('billingRecords', JSON.stringify(data.billingRecords))
  }

  private syncWithLocalStorage() {
    if (typeof window === 'undefined') return
    const currentData = this.getCurrentData()
    const lastSync = localStorage.getItem('lastSyncTime')
    
    if (lastSync && parseInt(lastSync) > this.lastSyncTime) {
      // Another user updated data, merge it
      const sharedData = localStorage.getItem('sharedData')
      if (sharedData) {
        const parsed = JSON.parse(sharedData)
        const mergedData = this.mergeData(parsed, currentData)
        this.updateLocalStorage(mergedData)
      }
    }
    
    // Update shared data
    const sharedData: SharedData = {
      sites: currentData.sites,
      tenants: currentData.tenants,
      billingRecords: currentData.billingRecords,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('sharedData', JSON.stringify(sharedData))
    localStorage.setItem('lastSyncTime', Date.now().toString())
    this.lastSyncTime = Date.now()
  }

  private getCurrentData() {
    if (typeof window === 'undefined') {
      return {
        sites: [],
        tenants: [],
        billingRecords: []
      }
    }
    return {
      sites: JSON.parse(localStorage.getItem('sites') || '[]'),
      tenants: JSON.parse(localStorage.getItem('tenants') || '[]'),
      billingRecords: JSON.parse(localStorage.getItem('billingRecords') || '[]')
    }
  }

  // Public methods
  getSites(): Site[] {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('sites') || '[]')
  }

  getTenants(): Tenant[] {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('tenants') || '[]')
  }

  getBillingRecords(): BillingRecord[] {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('billingRecords') || '[]')
  }

  saveSites(sites: Site[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem('sites', JSON.stringify(sites))
    this.syncData()
  }

  saveTenants(tenants: Tenant[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem('tenants', JSON.stringify(tenants))
    this.syncData()
  }

  saveBillingRecords(records: BillingRecord[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem('billingRecords', JSON.stringify(records))
    this.syncData()
  }

  addBillingRecord(record: BillingRecord) {
    if (typeof window === 'undefined') return
    const records = this.getBillingRecords()
    records.push(record)
    this.saveBillingRecords(records)
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export default SharedStorage 