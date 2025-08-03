'use client'

import { HomeIcon, Zap, Droplets, Calculator } from 'lucide-react'

interface BillingData {
  siteName: string
  unit: string
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
  years
}: BillingFormProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <HomeIcon className="w-5 h-5 mr-2" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={billingData.siteName}
              onChange={(e) => updateBillingData('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Laguna, Pidanna"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              value={billingData.unit}
              onChange={(e) => updateBillingData('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A-101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
            <input
              type="text"
              value={billingData.tenantName}
              onChange={(e) => updateBillingData('tenantName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tenant's full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={billingData.billingMonth}
                onChange={(e) => updateBillingData('billingMonth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={billingData.billingYear}
                onChange={(e) => updateBillingData('billingYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Electricity Billing */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Electricity Billing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reading (kWh)</label>
            <input
              type="number"
              value={billingData.electricityPrevious}
              onChange={(e) => updateBillingData('electricityPrevious', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Reading (kWh)</label>
            <input
              type="number"
              value={billingData.electricityCurrent}
              onChange={(e) => updateBillingData('electricityCurrent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per kWh (₱)</label>
            <input
              type="number"
              step="0.01"
              value={billingData.electricityPricePerKwh}
              onChange={(e) => updateBillingData('electricityPricePerKwh', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Consumption (kWh)</p>
            <p className="text-2xl font-bold text-blue-600">{electricityConsumption.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Electricity Bill</p>
            <p className="text-2xl font-bold text-green-600">₱{electricityTotal.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Meter Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handlePhotoUpload('electricity', file)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {billingData.electricityPhoto && (
            <div className="mt-2">
              <img src={billingData.electricityPhoto} alt="Electricity meter" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Water Billing */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Droplets className="w-5 h-5 mr-2" />
          Water Billing (Tiered)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reading (m³)</label>
            <input
              type="number"
              value={billingData.waterPrevious}
              onChange={(e) => updateBillingData('waterPrevious', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Reading (m³)</label>
            <input
              type="number"
              value={billingData.waterCurrent}
              onChange={(e) => updateBillingData('waterCurrent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Water Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First 10 m³ (₱)</label>
              <input
                type="number"
                value={billingData.waterRates.first10}
                onChange={(e) => updateWaterRates('first10', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">11-20 m³ (₱/m³)</label>
              <input
                type="number"
                value={billingData.waterRates.next10}
                onChange={(e) => updateWaterRates('next10', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">21-30 m³ (₱/m³)</label>
              <input
                type="number"
                value={billingData.waterRates.next10_2}
                onChange={(e) => updateWaterRates('next10_2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Above 30 m³ (₱/m³)</label>
              <input
                type="number"
                value={billingData.waterRates.above30}
                onChange={(e) => updateWaterRates('above30', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Consumption (m³)</p>
            <p className="text-2xl font-bold text-blue-600">{waterConsumption.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Water Bill</p>
            <p className="text-2xl font-bold text-green-600">₱{waterTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Meter Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handlePhotoUpload('water', file)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {billingData.waterPhoto && (
            <div className="mt-2">
              <img src={billingData.waterPhoto} alt="Water meter" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Rent and Other Fees */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Rent and Other Fees
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Rent (₱)</label>
            <input
              type="number"
              value={billingData.baseRent}
              onChange={(e) => updateBillingData('baseRent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={billingData.parkingEnabled}
              onChange={(e) => updateBillingData('parkingEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Include Parking Fee</label>
          </div>
          {billingData.parkingEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking Fee (₱)</label>
              <input
                type="number"
                value={billingData.parkingFee}
                onChange={(e) => updateBillingData('parkingFee', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Damage Description (Optional)</label>
            <textarea
              value={billingData.damageDescription}
              onChange={(e) => updateBillingData('damageDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Describe any damages..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Fee Description</label>
              <input
                type="text"
                value={billingData.otherFeeDescription}
                onChange={(e) => updateBillingData('otherFeeDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Late payment fee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Fee Amount (₱)</label>
              <input
                type="number"
                value={billingData.otherFeeAmount}
                onChange={(e) => updateBillingData('otherFeeAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 