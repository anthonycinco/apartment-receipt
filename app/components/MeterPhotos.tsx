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

interface MeterPhotosProps {
  photosRef: RefObject<HTMLDivElement>
  billingData: BillingData
}

export default function MeterPhotos({
  photosRef,
  billingData
}: MeterPhotosProps) {
  if (!billingData.electricityPhoto && !billingData.waterPhoto) {
    return null
  }

  return (
    <div ref={photosRef} className="bg-white border-2 border-gray-200 rounded-lg p-8 space-y-6" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cinco Apartments</h1>
        <p className="text-gray-600 text-lg">Meter Readings</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Site:</span>
            <span>{billingData.siteName || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Door Number:</span>
            <span>{billingData.doorNumber || 'N/A'}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Tenant:</span>
            <span>{billingData.tenantName || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Period:</span>
            <span>{billingData.billingMonth} {billingData.billingYear}</span>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="space-y-8">
        {billingData.electricityPhoto && (
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Electricity Meter</h3>
            <div className="text-center space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                Previous: {billingData.electricityPrevious} kWh → Current: {billingData.electricityCurrent} kWh
              </p>
              <p className="text-sm text-gray-600">
                Consumption: {billingData.electricityCurrent - billingData.electricityPrevious} kWh
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={billingData.electricityPhoto} 
                alt="Electricity meter" 
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg" 
              />
            </div>
          </div>
        )}

        {billingData.waterPhoto && (
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Water Meter</h3>
            <div className="text-center space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                Previous: {billingData.waterPrevious} m³ → Current: {billingData.waterCurrent} m³
              </p>
              <p className="text-sm text-gray-600">
                Consumption: {billingData.waterCurrent - billingData.waterPrevious} m³
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={billingData.waterPhoto} 
                alt="Water meter" 
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t pt-6 text-center">
        <p className="text-sm text-gray-600">
          These meter readings support the billing statement for {billingData.billingMonth} {billingData.billingYear}
        </p>
      </div>
    </div>
  )
} 