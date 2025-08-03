'use client'

import { useState } from 'react'
import { Calculator, Zap, Droplets, Home, User, Calendar, CreditCard, AlertTriangle, Save } from 'lucide-react'

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
  waterPrevious: number
  waterCurrent: number
  waterRates: {
    first10: number
    next10: number
    next10_2: number
    above30: number
  }
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
  onClearAll?: () => void
  onSaveToHistory?: () => void
}

export default function BillingForm({
  billingData,
  updateBillingData,
  updateWaterRates,
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
  getTenantById,
  onClearAll,
  onSaveToHistory
}: BillingFormProps) {
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!billingData.siteName) errors.siteName = 'Site is required'
    if (!billingData.doorNumber) errors.doorNumber = 'Door number is required'
    if (!billingData.tenantName) errors.tenantName = 'Tenant is required'
    if (billingData.electricityCurrent < billingData.electricityPrevious) {
      errors.electricityCurrent = 'Current reading cannot be less than previous reading'
    }
    if (billingData.waterCurrent < billingData.waterPrevious) {
      errors.waterCurrent = 'Current reading cannot be less than previous reading'
    }
    if (billingData.baseRent < 0) errors.baseRent = 'Base rent cannot be negative'
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

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
    <div className="p-8">
      {/* Basic Information */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Home className="w-5 h-5 mr-2 text-blue-600" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
            <select
              value={billingData.siteName}
              onChange={(e) => updateBillingData('siteName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 ${
                validationErrors.siteName 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select a site</option>
              {sites.map(site => (
                <option key={site.id} value={site.name}>{site.name}</option>
              ))}
            </select>
            {validationErrors.siteName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.siteName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Door Number</label>
            <select
              value={billingData.doorNumber}
              onChange={(e) => updateBillingData('doorNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Select a tenant</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Month</label>
            <select
              value={billingData.billingMonth}
              onChange={(e) => updateBillingData('billingMonth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Billing Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Electricity Billing */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Electricity Billing
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Reading (kWh)</label>
              <input
                type="number"
                value={billingData.electricityPrevious}
                onChange={(e) => updateBillingData('electricityPrevious', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Reading (kWh)</label>
              <input
                type="number"
                value={billingData.electricityCurrent}
                onChange={(e) => updateBillingData('electricityCurrent', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price per kWh (₱)</label>
              <input
                type="number"
                step="0.01"
                value={billingData.electricityPricePerKwh}
                onChange={(e) => updateBillingData('electricityPricePerKwh', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Consumption (kWh)</span>
                <span className="text-lg font-bold text-blue-600">{electricityConsumption}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Electricity Bill (₱)</span>
                <span className="text-lg font-bold text-green-600">₱{electricityTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Water Billing */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-600" />
            Water Billing (Tiered)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Reading (m³)</label>
              <input
                type="number"
                value={billingData.waterPrevious}
                onChange={(e) => updateBillingData('waterPrevious', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Reading (m³)</label>
              <input
                type="number"
                value={billingData.waterCurrent}
                onChange={(e) => updateBillingData('waterCurrent', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First 10 m³ (₱) - Flat Fee</label>
                <input
                  type="number"
                  value={billingData.waterRates.first10}
                  onChange={(e) => updateWaterRates('first10', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">11–20 m³ (₱ per m³)</label>
                <input
                  type="number"
                  value={billingData.waterRates.next10}
                  onChange={(e) => updateWaterRates('next10', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">21–30 m³ (₱ per m³)</label>
                <input
                  type="number"
                  value={billingData.waterRates.next10_2}
                  onChange={(e) => updateWaterRates('next10_2', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Above 30 m³ (₱ per m³)</label>
                <input
                  type="number"
                  value={billingData.waterRates.above30}
                  onChange={(e) => updateWaterRates('above30', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Consumption (m³)</span>
                <span className="text-lg font-bold text-blue-600">{waterConsumption}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Water Bill (₱)</span>
                <span className="text-lg font-bold text-green-600">₱{waterTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rent and Other Fees */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-green-600" />
            Rent and Other Fees
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Base Rent (₱)</label>
              <input
                type="number"
                value={billingData.baseRent}
                onChange={(e) => updateBillingData('baseRent', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parking Fee (₱)</label>
              <input
                type="number"
                value={billingData.parkingFee}
                onChange={(e) => updateBillingData('parkingFee', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={billingData.parkingEnabled}
                onChange={(e) => updateBillingData('parkingEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-semibold text-gray-700">Include Parking Fee</label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Damage Description (Optional)</label>
              <input
                type="text"
                value={billingData.damageDescription}
                onChange={(e) => updateBillingData('damageDescription', e.target.value)}
                placeholder="Describe any damages..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Other Fee Description (Optional)</label>
              <input
                type="text"
                value={billingData.otherFeeDescription}
                onChange={(e) => updateBillingData('otherFeeDescription', e.target.value)}
                placeholder="Describe other fees..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Other Fee Amount (₱)</label>
              <input
                type="number"
                value={billingData.otherFeeAmount}
                onChange={(e) => updateBillingData('otherFeeAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Parking Total (₱)</span>
                <span className="text-lg font-bold text-green-600">₱{parkingTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Summary */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-blue-600" />
          Bill Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Base Rent</p>
            <p className="text-lg font-bold text-gray-900">₱{billingData.baseRent.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Electricity</p>
            <p className="text-lg font-bold text-yellow-600">₱{electricityTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Water</p>
            <p className="text-lg font-bold text-blue-600">₱{waterTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Parking</p>
            <p className="text-lg font-bold text-green-600">₱{parkingTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Other Fees</p>
            <p className="text-lg font-bold text-purple-600">₱{billingData.otherFeeAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-blue-600 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-100">Grand Total</p>
          <p className="text-2xl font-bold text-white">₱{grandTotal.toFixed(2)}</p>
        </div>
        
        {/* Clear Button */}
        {onClearAll && (
          <div className="mt-4 text-center">
            <button
              onClick={onClearAll}
              className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Clear All Fields
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {onSaveToHistory && (
            <button
              onClick={onSaveToHistory}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Bill to History
            </button>
          )}
          
          {/* Quick Fill Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                updateBillingData('electricityPricePerKwh', 12.5)
                updateBillingData('waterRates', {
                  first10: 150,
                  next10: 25,
                  next10_2: 30,
                  above30: 35
                })
              }}
              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              Default Rates
            </button>
            <button
              onClick={() => {
                updateBillingData('parkingEnabled', true)
                updateBillingData('parkingFee', 500)
              }}
              className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              Add Parking
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 