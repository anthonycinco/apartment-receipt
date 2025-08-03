'use client'

import { RefObject } from 'react'

interface BillingData {
  siteName: string
  doorNumber: string
  tenantName: string
  billingMonth: string
  billingYear: string
  electricityPrevious: number
  electricityCurrent: number
  electricityPhoto: string | null
  waterPrevious: number
  waterCurrent: number
  waterPhoto: string | null
}

interface MeterPhotosProps {
  photosRef: RefObject<HTMLDivElement>
  billingData: BillingData
}

export default function MeterPhotos({ photosRef, billingData }: MeterPhotosProps) {
  const electricityConsumption = billingData.electricityCurrent - billingData.electricityPrevious
  const waterConsumption = billingData.waterCurrent - billingData.waterPrevious

  return (
    <div 
      ref={photosRef} 
      className="bg-white p-8"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cinco Apartments</h1>
        <p className="text-gray-600">Meter Photos</p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-600">Site</p>
          <p className="font-semibold text-gray-900">{billingData.siteName || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Door Number</p>
          <p className="font-semibold text-gray-900">{billingData.doorNumber || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tenant</p>
          <p className="font-semibold text-gray-900">{billingData.tenantName || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Billing Period</p>
          <p className="font-semibold text-gray-900">{billingData.billingMonth} {billingData.billingYear}</p>
        </div>
      </div>

      {/* Electricity Meter Photo */}
      {billingData.electricityPhoto && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Electricity Meter</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <img 
              src={billingData.electricityPhoto} 
              alt="Electricity Meter" 
              className="w-full max-w-md mx-auto rounded border"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Consumption: {electricityConsumption} kWh</p>
            </div>
          </div>
        </div>
      )}

      {/* Water Meter Photo */}
      {billingData.waterPhoto && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Water Meter</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <img 
              src={billingData.waterPhoto} 
              alt="Water Meter" 
              className="w-full max-w-md mx-auto rounded border"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Consumption: {waterConsumption} m³</p>
            </div>
          </div>
        </div>
      )}

      {/* No Photos Message */}
      {!billingData.electricityPhoto && !billingData.waterPhoto && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No meter photos uploaded</p>
        </div>
      )}
    </div>
  )
} 