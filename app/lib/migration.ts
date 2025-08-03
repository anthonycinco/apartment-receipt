import { sitesService, tenantsService, billingRecordsService } from './database'
import { SharedStorage } from './sharedStorage'

export const migrateFromLocalStorage = async () => {
  try {
    const sharedStorage = new SharedStorage()
    const localData = sharedStorage.getData()

    console.log('Starting migration from localStorage to Supabase...')

    // Migrate sites
    if (localData.sites.length > 0) {
      console.log(`Migrating ${localData.sites.length} sites...`)
      for (const site of localData.sites) {
        try {
          await sitesService.create({
            name: site.name,
            address: site.address,
            total_units: site.totalUnits
          })
        } catch (error) {
          console.error(`Failed to migrate site ${site.name}:`, error)
        }
      }
    }

    // Migrate tenants
    if (localData.tenants.length > 0) {
      console.log(`Migrating ${localData.tenants.length} tenants...`)
      for (const tenant of localData.tenants) {
        try {
          // Find the corresponding site in Supabase
          const sites = await sitesService.getAll()
          const site = sites.find(s => s.name === tenant.siteName)
          
          if (site) {
            await tenantsService.create({
              name: tenant.name,
              site_id: site.id,
              door_number: tenant.doorNumber,
              phone: tenant.phone,
              base_rent: tenant.baseRent,
              status: tenant.status
            })
          }
        } catch (error) {
          console.error(`Failed to migrate tenant ${tenant.name}:`, error)
        }
      }
    }

    // Migrate billing records
    if (localData.billingRecords.length > 0) {
      console.log(`Migrating ${localData.billingRecords.length} billing records...`)
      for (const record of localData.billingRecords) {
        try {
          // Find the corresponding site and tenant in Supabase
          const sites = await sitesService.getAll()
          const tenants = await tenantsService.getAll()
          
          const site = sites.find(s => s.name === record.siteName)
          const tenant = tenants.find(t => t.name === record.tenantName && t.door_number === record.doorNumber)
          
          if (site && tenant) {
            await billingRecordsService.create({
              site_id: site.id,
              tenant_id: tenant.id,
              date: record.date,
              electricity_consumption: record.electricityConsumption,
              water_consumption: record.waterConsumption,
              total_amount: record.totalAmount,
              electricity_rate: record.electricityRate,
              water_rate: record.waterRate,
              base_rent: record.baseRent,
              parking_fee: record.parkingFee,
              other_charges: record.otherCharges,
              damage_description: record.damageDescription || ''
            })
          }
        } catch (error) {
          console.error(`Failed to migrate billing record for ${record.tenantName}:`, error)
        }
      }
    }

    console.log('Migration completed successfully!')
    return { success: true, message: 'Migration completed successfully!' }
  } catch (error) {
    console.error('Migration failed:', error)
    return { success: false, message: 'Migration failed: ' + error.message }
  }
}

export const checkMigrationStatus = () => {
  const sharedStorage = new SharedStorage()
  const localData = sharedStorage.getData()
  
  return {
    hasLocalData: localData.sites.length > 0 || localData.tenants.length > 0 || localData.billingRecords.length > 0,
    sitesCount: localData.sites.length,
    tenantsCount: localData.tenants.length,
    billingRecordsCount: localData.billingRecords.length
  }
} 