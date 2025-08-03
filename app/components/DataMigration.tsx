'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SharedStorage } from '../lib/sharedStorage'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface MigrationStatus {
  sites: 'pending' | 'migrating' | 'completed' | 'error'
  tenants: 'pending' | 'migrating' | 'completed' | 'error'
  billingRecords: 'pending' | 'migrating' | 'completed' | 'error'
}

export default function DataMigration() {
  const [showMigration, setShowMigration] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    sites: 'pending',
    tenants: 'pending',
    billingRecords: 'pending'
  })
  const [error, setError] = useState<string>('')
  const [isMigrating, setIsMigrating] = useState(false)

  // Check if there's data to migrate
  const [hasLocalData, setHasLocalData] = useState(false)

  useEffect(() => {
    const checkLocalData = () => {
      const sharedStorage = SharedStorage.getInstance()
      const sites = sharedStorage.getSites()
      const tenants = sharedStorage.getTenants()
      const billingRecords = sharedStorage.getBillingRecords()
      
      setHasLocalData(sites.length > 0 || tenants.length > 0 || billingRecords.length > 0)
    }

    checkLocalData()
  }, [])

  const migrateData = async () => {
    if (isMigrating) return

    setIsMigrating(true)
    setError('')
    const sharedStorage = SharedStorage.getInstance()

    try {
      // Migrate sites
      setMigrationStatus(prev => ({ ...prev, sites: 'migrating' }))
      const sites = sharedStorage.getSites()
      if (sites.length > 0) {
        const { error: sitesError } = await supabase
          .from('sites')
          .upsert(sites.map(site => ({
            id: site.id,
            name: site.name,
            address: site.address,
            created_at: new Date().toISOString()
          })))
        
        if (sitesError) throw new Error(`Sites migration failed: ${sitesError.message}`)
        setMigrationStatus(prev => ({ ...prev, sites: 'completed' }))
      } else {
        setMigrationStatus(prev => ({ ...prev, sites: 'completed' }))
      }

      // Migrate tenants
      setMigrationStatus(prev => ({ ...prev, tenants: 'migrating' }))
      const tenants = sharedStorage.getTenants()
      if (tenants.length > 0) {
        const { error: tenantsError } = await supabase
          .from('tenants')
          .upsert(tenants.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            site_id: tenant.siteId,
            door_number: tenant.doorNumber,
            phone: tenant.phone,
            base_rent: tenant.baseRent,
            created_at: new Date().toISOString()
          })))
        
        if (tenantsError) throw new Error(`Tenants migration failed: ${tenantsError.message}`)
        setMigrationStatus(prev => ({ ...prev, tenants: 'completed' }))
      } else {
        setMigrationStatus(prev => ({ ...prev, tenants: 'completed' }))
      }

      // Migrate billing records
      setMigrationStatus(prev => ({ ...prev, billingRecords: 'migrating' }))
      const billingRecords = sharedStorage.getBillingRecords()
      if (billingRecords.length > 0) {
        const { error: billingError } = await supabase
          .from('billing_records')
          .upsert(billingRecords.map(record => ({
            id: record.id,
            site_id: record.siteId,
            tenant_id: record.tenantId,
            billing_month: record.billingMonth,
            billing_year: record.billingYear,
            electricity_previous: record.electricityPrevious,
            electricity_current: record.electricityCurrent,
            electricity_price_per_kwh: record.electricityPricePerKwh,
            water_previous: record.waterPrevious,
            water_current: record.waterCurrent,
            water_rates: record.waterRates,
            base_rent: record.baseRent,
            parking_fee: record.parkingFee,
            parking_enabled: record.parkingEnabled,
            damage_description: record.damageDescription,
            other_fee_description: record.otherFeeDescription,
            other_fee_amount: record.otherFeeAmount,
            created_at: new Date().toISOString()
          })))
        
        if (billingError) throw new Error(`Billing records migration failed: ${billingError.message}`)
        setMigrationStatus(prev => ({ ...prev, billingRecords: 'completed' }))
      } else {
        setMigrationStatus(prev => ({ ...prev, billingRecords: 'completed' }))
      }

      // Clear local data after successful migration
      localStorage.removeItem('sharedData')
      setHasLocalData(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed')
      setMigrationStatus({
        sites: 'error',
        tenants: 'error',
        billingRecords: 'error'
      })
    } finally {
      setIsMigrating(false)
    }
  }

  if (!hasLocalData) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showMigration ? (
        <button
          onClick={() => setShowMigration(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          📊 Migrate to Supabase
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Migration</h3>
            <button
              onClick={() => setShowMigration(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sites</span>
              <div className="flex items-center">
                {migrationStatus.sites === 'pending' && <div className="w-4 h-4" />}
                {migrationStatus.sites === 'migrating' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                {migrationStatus.sites === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {migrationStatus.sites === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tenants</span>
              <div className="flex items-center">
                {migrationStatus.tenants === 'pending' && <div className="w-4 h-4" />}
                {migrationStatus.tenants === 'migrating' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                {migrationStatus.tenants === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {migrationStatus.tenants === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Billing Records</span>
              <div className="flex items-center">
                {migrationStatus.billingRecords === 'pending' && <div className="w-4 h-4" />}
                {migrationStatus.billingRecords === 'migrating' && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                {migrationStatus.billingRecords === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {migrationStatus.billingRecords === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={migrateData}
              disabled={isMigrating}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMigrating ? 'Migrating...' : 'Start Migration'}
            </button>
            <button
              onClick={() => setShowMigration(false)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 