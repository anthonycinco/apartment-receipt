'use client'

import { RefObject } from 'react'
import { FileText } from 'lucide-react'

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
  const electricityConsumption = billingData.electricityCurrent - billingData.electricityPrevious
  const waterConsumption = billingData.waterCurrent - billingData.waterPrevious

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-blue-600" />
        Receipt Preview
      </h3>
      
      <div ref={receiptRef} className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto print:p-4 print:border-0 print:shadow-none">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cinco Apartments</h1>
          <p className="text-gray-600">Billing Receipt</p>
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

        {/* Billing Breakdown */}
        <div className="space-y-6 mb-8">
          {/* Base Rent */}
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Base Rent</p>
            </div>
            <p className="font-semibold text-gray-900">₱{billingData.baseRent.toFixed(2)}</p>
          </div>

          {/* Electricity */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-900">Electricity</p>
              <p className="font-semibold text-gray-900">₱{electricityTotal.toFixed(2)}</p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Previous Reading: {billingData.electricityPrevious} kWh</p>
              <p>Current Reading: {billingData.electricityCurrent} kWh</p>
              <p>Consumption: {electricityConsumption} kWh</p>
              <p>Rate: ₱{billingData.electricityPricePerKwh}/kWh</p>
            </div>
          </div>

          {/* Water */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-900">Water</p>
              <p className="font-semibold text-gray-900">₱{waterTotal.toFixed(2)}</p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Previous Reading: {billingData.waterPrevious} m³</p>
              <p>Current Reading: {billingData.waterCurrent} m³</p>
              <p>Consumption: {waterConsumption} m³</p>
              <p>Tiered Rate Structure Applied</p>
            </div>
          </div>

          {/* Parking */}
          {billingData.parkingEnabled && (
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">Parking Fee</p>
              </div>
              <p className="font-semibold text-gray-900">₱{parkingTotal.toFixed(2)}</p>
            </div>
          )}

          {/* Other Fees */}
          {billingData.otherFeeAmount > 0 && (
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-900">Other Fees</p>
                <p className="font-semibold text-gray-900">₱{billingData.otherFeeAmount.toFixed(2)}</p>
              </div>
              {billingData.otherFeeDescription && (
                <p className="text-sm text-gray-600">{billingData.otherFeeDescription}</p>
              )}
            </div>
          )}

          {/* Damage Description */}
          {billingData.damageDescription && (
            <div className="border-b border-gray-200 pb-4">
              <p className="font-semibold text-gray-900 mb-2">Damage Description</p>
              <p className="text-sm text-gray-600">{billingData.damageDescription}</p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-gray-900">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600">₱{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Note about meter photos */}
        {false && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Meter photos are included on a separate page in the exported PDF/Image.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 