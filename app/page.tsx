'use client'

import { useState, useRef } from 'react'
import { Download, FileText, Image as ImageIcon, Calculator, Zap, Droplets, Home as HomeIcon, User, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface BillingData {
  // Basic Information
  siteName: string
  unit: string
  tenantName: string
  billingMonth: string
  billingYear: string
  
  // Electricity
  electricityPrevious: number
  electricityCurrent: number
  electricityPricePerKwh: number
  electricityPhoto: string | null
  
  // Water
  waterPrevious: number
  waterCurrent: number
  waterRates: {
    first10: number
    next10: number
    next10_2: number
    above30: number
  }
  waterPhoto: string | null
  
  // Rent and Fees
  baseRent: number
  parkingFee: number
  parkingEnabled: boolean
  damageDescription: string
  otherFeeDescription: string
  otherFeeAmount: number
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())

export default function Home() {
  const [billingData, setBillingData] = useState<BillingData>({
    siteName: '',
    unit: '',
    tenantName: '',
    billingMonth: months[new Date().getMonth()],
    billingYear: new Date().getFullYear().toString(),
    electricityPrevious: 0,
    electricityCurrent: 0,
    electricityPricePerKwh: 12.5,
    electricityPhoto: null,
    waterPrevious: 0,
    waterCurrent: 0,
    waterRates: {
      first10: 150,
      next10: 25,
      next10_2: 30,
      above30: 35
    },
    waterPhoto: null,
    baseRent: 0,
    parkingFee: 500,
    parkingEnabled: false,
    damageDescription: '',
    otherFeeDescription: '',
    otherFeeAmount: 0
  })

  const receiptRef = useRef<HTMLDivElement>(null)

  const updateBillingData = (field: keyof BillingData, value: any) => {
    setBillingData(prev => ({ ...prev, [field]: value }))
  }

  const updateWaterRates = (field: keyof BillingData['waterRates'], value: number) => {
    setBillingData(prev => ({
      ...prev,
      waterRates: { ...prev.waterRates, [field]: value }
    }))
  }

  // Calculations
  const electricityConsumption = billingData.electricityCurrent - billingData.electricityPrevious
  const electricityTotal = electricityConsumption * billingData.electricityPricePerKwh

  const waterConsumption = billingData.waterCurrent - billingData.waterPrevious
  const calculateWaterBill = () => {
    let total = 0
    let remaining = waterConsumption

    if (remaining <= 10) {
      total = remaining * billingData.waterRates.first10
    } else {
      total += 10 * billingData.waterRates.first10
      remaining -= 10

              if (remaining <= 10) {
          total += remaining * billingData.waterRates.next10
        } else {
          total += 10 * billingData.waterRates.next10
          remaining -= 10

          if (remaining <= 10) {
            total += remaining * billingData.waterRates.next10_2
          } else {
            total += 10 * billingData.waterRates.next10_2
            remaining -= 10
            total += remaining * billingData.waterRates.above30
          }
        }
    }
    return total
  }

  const waterTotal = calculateWaterBill()
  const parkingTotal = billingData.parkingEnabled ? billingData.parkingFee : 0
  const grandTotal = billingData.baseRent + electricityTotal + waterTotal + parkingTotal + billingData.otherFeeAmount

  // File upload handlers
  const handlePhotoUpload = (type: 'electricity' | 'water', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const photoData = e.target?.result as string
      updateBillingData(type === 'electricity' ? 'electricityPhoto' : 'waterPhoto', photoData)
    }
    reader.readAsDataURL(file)
  }

  // Export functions
  const exportAsPDF = async () => {
    if (!receiptRef.current) return
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`cinco-apartments-bill-${billingData.siteName}-${billingData.unit}-${billingData.billingMonth}-${billingData.billingYear}.pdf`)
  }

  const exportAsImage = async () => {
    if (!receiptRef.current) return
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    const link = document.createElement('a')
    link.download = `cinco-apartments-bill-${billingData.siteName}-${billingData.unit}-${billingData.billingMonth}-${billingData.billingYear}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // Sample analytics data
  const electricityData = [
    { month: 'Jan', consumption: 450 },
    { month: 'Feb', consumption: 380 },
    { month: 'Mar', consumption: 520 },
    { month: 'Apr', consumption: 410 },
    { month: 'May', consumption: 480 },
    { month: 'Jun', consumption: 390 }
  ]

  const waterData = [
    { month: 'Jan', usage: 25 },
    { month: 'Feb', usage: 22 },
    { month: 'Mar', usage: 28 },
    { month: 'Apr', usage: 24 },
    { month: 'May', usage: 26 },
    { month: 'Jun', usage: 23 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cinco Apartments</h1>
              <p className="text-gray-600">Billing System</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportAsPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={exportAsImage}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Export Image
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Sections */}
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

          {/* Receipt Preview */}
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
        </div>

        {/* Analytics Panel */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Electricity Consumption</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={electricityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Water Usage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 