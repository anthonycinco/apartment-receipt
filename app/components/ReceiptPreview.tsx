'use client'

import { RefObject } from 'react'

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

interface ReceiptPreviewProps {
  receiptRef: RefObject<HTMLDivElement>
  billingData: BillingData
  electricityTotal: number
  waterTotal: number
  parkingTotal: number
  grandTotal: number
}

export default function ReceiptPreview({
  receiptRef,
  billingData,
  electricityTotal,
  waterTotal,
  parkingTotal,
  grandTotal
}: ReceiptPreviewProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Receipt Preview</h2>
        <div ref={receiptRef} className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Cinco Apartments</h1>
            <p className="text-gray-600">Billing Statement</p>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Site:</span>
              <span>{billingData.siteName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Unit:</span>
              <span>{billingData.unit || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tenant:</span>
              <span>{billingData.tenantName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Period:</span>
              <span>{billingData.billingMonth} {billingData.billingYear}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Base Rent:</span>
              <span>₱{billingData.baseRent.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span>Electricity:</span>
                <span>₱{electricityTotal.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-600 ml-4">
                {billingData.electricityPrevious} → {billingData.electricityCurrent} kWh
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span>Water:</span>
                <span>₱{waterTotal.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-600 ml-4">
                {billingData.waterPrevious} → {billingData.waterCurrent} m³
              </div>
            </div>
            
            {billingData.parkingEnabled && (
              <div className="flex justify-between">
                <span>Parking Fee:</span>
                <span>₱{parkingTotal.toFixed(2)}</span>
              </div>
            )}
            
            {billingData.otherFeeAmount > 0 && (
              <div className="flex justify-between">
                <span>{billingData.otherFeeDescription || 'Other Fee'}:</span>
                <span>₱{billingData.otherFeeAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>₱{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Meter Photos */}
          {(billingData.electricityPhoto || billingData.waterPhoto) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Meter Readings:</h4>
              <div className="flex space-x-2">
                {billingData.electricityPhoto && (
                  <img src={billingData.electricityPhoto} alt="Electricity meter" className="w-16 h-16 object-cover rounded" />
                )}
                {billingData.waterPhoto && (
                  <img src={billingData.waterPhoto} alt="Water meter" className="w-16 h-16 object-cover rounded" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 