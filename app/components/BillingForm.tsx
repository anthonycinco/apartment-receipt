'use client'

import { useState } from 'react'
import { Calculator, Zap, Droplets, Home, User, Calendar, CreditCard, Upload, Camera } from 'lucide-react'

interface Site {
  id: string
  name: string
  address: string
  totalUnits: number
}

interface Tenant {
  id: string
  name: string
  siteId: string
  doorNumber: string
  phone: string
  email: string
  baseRent: number
  status: 'active' | 'inactive'
}

interface BillingData {
  siteName: string
  doorNumber: string
  tenantName: string
  billingMonth: string
  billingYear: string
  electricityPrevious: number
  electricityCurrent: number
  electricityPricePerKwh: number
  electricityPhoto: string | null
  waterPrevious: number
  waterCurrent: number
  waterRates: {
    first10: number
    next10: number
    next10_2: number
    above30: number
  }
  waterPhoto: string | null
  baseRent: number
  parkingFee: number
  parkingEnabled: boolean
  damageDescription: string
  otherFeeDescription: string
  otherFeeAmount: number
}

interface BillingFormProps {
  billingData: BillingData
  updateBillingData: (field: keyof BillingData, value: any) => void
  updateWaterRates: (field: keyof BillingData['waterRates'], value: number) => void
  handlePhotoUpload: (type: 'electricity' | 'water', file: File) => void
  electricityConsumption: number
  electricityTotal: number
  waterConsumption: number
  waterTotal: number
  parkingTotal: number
  grandTotal: number
  months: string[]
  years: string[]
  sites: Site[]
  tenants: Tenant[]
  getSiteById: (id: string) => Site | undefined
  getTenantById: (id: string) => Tenant | undefined
}

export default function BillingForm({
  billingData,
  updateBillingData,
  updateWaterRates,
  handlePhotoUpload,
  electricityConsumption,
  electricityTotal,
  waterConsumption,
  waterTotal,
  parkingTotal,
  grandTotal,
  months,
  years,
  sites,
  tenants,
  getSiteById,
  getTenantById
}: BillingFormProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')

  // Quick fill from tenant
  const handleTenantSelect = (tenantId: string) => {
    const tenant = getTenantById(tenantId)
    if (tenant) {
      const site = getSiteById(tenant.siteId)
      updateBillingData('tenantName', tenant.name)
      updateBillingData('doorNumber', tenant.doorNumber)
      updateBillingData('siteName', site?.name || '')
      updateBillingData('baseRent', tenant.baseRent)
      setSelectedTenantId(tenantId)
    }
  }

  // Get available door numbers for selected site
  const getDoorNumbersForSite = (siteName: string) => {
    const site = sites.find(s => s.name === siteName)
    if (!site) return []
    
    return tenants
      .filter(tenant => tenant.siteId === site.id)
      .map(tenant => tenant.doorNumber)
      .filter((doorNumber, index, arr) => arr.indexOf(doorNumber) === index) // Remove duplicates
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Home className="w-6 h-6 mr-3 text-blue-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
            <select
              value={billingData.siteName}
              onChange={(e) => updateBillingData('siteName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            >
              <option value="">Select a site</option>
              {sites.map(site => (
                <option key={site.id} value={site.name}>{site.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Door Number</label>
            <select
              value={billingData.doorNumber}
              onChange={(e) => updateBillingData('doorNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            >
              <option value="">Select a door number</option>
              {getDoorNumbersForSite(billingData.siteName).map(doorNumber => (
                <option key={doorNumber} value={doorNumber}>{doorNumber}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tenant Name</label>
            <select
              value={selectedTenantId}
              onChange={(e) => handleTenantSelect(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            >
              <option value="">Select a tenant</option>
              {tenants
                .filter(tenant => !billingData.siteName || getSiteById(tenant.siteId)?.name === billingData.siteName)
                .map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.doorNumber}
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Month</label>
            <select
              value={billingData.billingMonth}
              onChange={(e) => updateBillingData('billingMonth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Year</label>
            <select
              value={billingData.billingYear}
              onChange={(e) => updateBillingData('billingYear', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Electricity Billing */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-yellow-500" />
          Electricity Billing
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Reading (kWh)</label>
            <input
              type="number"
              value={billingData.electricityPrevious}
              onChange={(e) => updateBillingData('electricityPrevious', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Reading (kWh)</label>
            <input
              type="number"
              value={billingData.electricityCurrent}
              onChange={(e) => updateBillingData('electricityCurrent', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price per kWh (₱)</label>
            <input
              type="number"
              step="0.01"
              value={billingData.electricityPricePerKwh}
              onChange={(e) => updateBillingData('electricityPricePerKwh', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Consumption (kWh)</label>
            <input
              type="number"
              value={electricityConsumption}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-base font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Electricity Bill (₱)</label>
            <input
              type="number"
              value={electricityTotal}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-base font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meter Photo</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoUpload('electricity', file)
                }}
                className="hidden"
                id="electricity-photo"
              />
              <label
                htmlFor="electricity-photo"
                className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white text-gray-900 text-base transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                Upload Photo
              </label>
              {billingData.electricityPhoto && (
                <span className="text-sm text-green-600 font-medium">✓ Uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Water Billing */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Droplets className="w-6 h-6 mr-3 text-blue-500" />
          Water Billing (Tiered)
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Reading (m³)</label>
            <input
              type="number"
              value={billingData.waterPrevious}
              onChange={(e) => updateBillingData('waterPrevious', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Reading (m³)</label>
            <input
              type="number"
              value={billingData.waterCurrent}
              onChange={(e) => updateBillingData('waterCurrent', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">First 10 m³ (₱) - Flat Fee</label>
            <input
              type="number"
              value={billingData.waterRates.first10}
              onChange={(e) => updateWaterRates('first10', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">11–20 m³ (₱ per m³)</label>
            <input
              type="number"
              value={billingData.waterRates.next10}
              onChange={(e) => updateWaterRates('next10', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">21–30 m³ (₱ per m³)</label>
            <input
              type="number"
              value={billingData.waterRates.next10_2}
              onChange={(e) => updateWaterRates('next10_2', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Above 30 m³ (₱ per m³)</label>
            <input
              type="number"
              value={billingData.waterRates.above30}
              onChange={(e) => updateWaterRates('above30', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Consumption (m³)</label>
            <input
              type="number"
              value={waterConsumption}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-base font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Water Bill (₱)</label>
            <input
              type="number"
              value={waterTotal}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-base font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meter Photo</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoUpload('water', file)
                }}
                className="hidden"
                id="water-photo"
              />
              <label
                htmlFor="water-photo"
                className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white text-gray-900 text-base transition-colors"
              >
                <Camera className="w-5 h-5 mr-2" />
                Upload Photo
              </label>
              {billingData.waterPhoto && (
                <span className="text-sm text-green-600 font-medium">✓ Uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rent and Other Fees */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <CreditCard className="w-6 h-6 mr-3 text-green-600" />
          Rent and Other Fees
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Base Rent (₱)</label>
            <input
              type="number"
              value={billingData.baseRent}
              onChange={(e) => updateBillingData('baseRent', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Parking Fee (₱)</label>
            <input
              type="number"
              value={billingData.parkingFee}
              onChange={(e) => updateBillingData('parkingFee', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div className="lg:col-span-2">
            <label className="flex items-center p-4 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="checkbox"
                checked={billingData.parkingEnabled}
                onChange={(e) => updateBillingData('parkingEnabled', e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base font-medium text-gray-700">Include Parking Fee</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Damage Description</label>
            <input
              type="text"
              value={billingData.damageDescription}
              onChange={(e) => updateBillingData('damageDescription', e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Other Fee Description</label>
            <input
              type="text"
              value={billingData.otherFeeDescription}
              onChange={(e) => updateBillingData('otherFeeDescription', e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Other Fee Amount (₱)</label>
            <input
              type="number"
              value={billingData.otherFeeAmount}
              onChange={(e) => updateBillingData('otherFeeAmount', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Parking Total (₱)</label>
            <input
              type="number"
              value={parkingTotal}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-base font-medium"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
          <Calculator className="w-6 h-6 mr-3" />
          Bill Summary
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Base Rent:</span>
            <span className="font-bold text-lg">₱{billingData.baseRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Electricity:</span>
            <span className="font-bold text-lg">₱{electricityTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Water:</span>
            <span className="font-bold text-lg">₱{waterTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Parking:</span>
            <span className="font-bold text-lg">₱{parkingTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Other Fees:</span>
            <span className="font-bold text-lg">₱{billingData.otherFeeAmount.toLocaleString()}</span>
          </div>
          <hr className="border-blue-300" />
          <div className="flex justify-between items-center py-2">
            <span className="text-xl font-bold text-blue-900">Grand Total:</span>
            <span className="text-2xl font-bold text-blue-900">₱{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 