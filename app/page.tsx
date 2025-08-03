'use client'

import { useState, useRef } from 'react'
import { FileText, Image as ImageIcon, Calculator, Building2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import BillingForm from './components/BillingForm'
import ReceiptPreview from './components/ReceiptPreview'
import ManagementPanel from './components/ManagementPanel'

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

interface Site {
  id: string
  name: string
  address: string
  totalUnits: number
  occupiedUnits: number
}

interface Tenant {
  id: string
  name: string
  siteId: string
  unit: string
  phone: string
  email: string
  moveInDate: string
  baseRent: number
  status: 'active' | 'inactive'
}

interface BillingRecord {
  id: string
  tenantId: string
  siteId: string
  month: string
  year: string
  electricityConsumption: number
  waterConsumption: number
  totalAmount: number
  date: string
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 2 + i).toString())

export default function Home() {
  const [activeTab, setActiveTab] = useState<'billing' | 'management'>('billing')
  
  // Management state
  const [sites, setSites] = useState<Site[]>([
    { id: '1', name: 'Laguna', address: 'Laguna, Philippines', totalUnits: 20, occupiedUnits: 15 },
    { id: '2', name: 'Pidanna', address: 'Pidanna, Philippines', totalUnits: 15, occupiedUnits: 12 }
  ])
  
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Juan Dela Cruz', siteId: '1', unit: 'A-101', phone: '+63 912 345 6789', email: 'juan@email.com', moveInDate: '2024-01-01', baseRent: 15000, status: 'active' },
    { id: '2', name: 'Maria Santos', siteId: '1', unit: 'A-102', phone: '+63 912 345 6790', email: 'maria@email.com', moveInDate: '2024-02-01', baseRent: 15000, status: 'active' },
    { id: '3', name: 'Pedro Reyes', siteId: '2', unit: 'B-201', phone: '+63 912 345 6791', email: 'pedro@email.com', moveInDate: '2024-01-15', baseRent: 18000, status: 'active' }
  ])
  
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([
    { id: '1', tenantId: '1', siteId: '1', month: 'January', year: '2024', electricityConsumption: 450, waterConsumption: 25, totalAmount: 18500, date: '2024-01-31' },
    { id: '2', tenantId: '1', siteId: '1', month: 'February', year: '2024', electricityConsumption: 380, waterConsumption: 22, totalAmount: 17200, date: '2024-02-29' },
    { id: '3', tenantId: '2', siteId: '1', month: 'February', year: '2024', electricityConsumption: 520, waterConsumption: 28, totalAmount: 19800, date: '2024-02-29' },
    { id: '4', tenantId: '3', siteId: '2', month: 'February', year: '2024', electricityConsumption: 410, waterConsumption: 24, totalAmount: 22100, date: '2024-02-29' }
  ])
  
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

  // Management functions
  const addSite = (site: Omit<Site, 'id'>) => {
    const newSite = { ...site, id: Date.now().toString() }
    setSites(prev => [...prev, newSite])
  }

  const updateSite = (id: string, updates: Partial<Site>) => {
    setSites(prev => prev.map(site => site.id === id ? { ...site, ...updates } : site))
  }

  const deleteSite = (id: string) => {
    setSites(prev => prev.filter(site => site.id !== id))
  }

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant = { ...tenant, id: Date.now().toString() }
    setTenants(prev => [...prev, newTenant])
  }

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(tenant => tenant.id === id ? { ...tenant, ...updates } : tenant))
  }

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(tenant => tenant.id !== id))
  }

  const getSiteById = (id: string) => sites.find(site => site.id === id)
  const getTenantById = (id: string) => tenants.find(tenant => tenant.id === id)

  // Calculations
  const electricityConsumption = billingData.electricityCurrent - billingData.electricityPrevious
  const electricityTotal = electricityConsumption * billingData.electricityPricePerKwh

  const waterConsumption = billingData.waterCurrent - billingData.waterPrevious
  const calculateWaterBill = () => {
    let total = 0
    let remaining = waterConsumption

    if (remaining <= 10) {
      total = billingData.waterRates.first10 // Flat fee for first 10 m³
    } else {
      total = billingData.waterRates.first10 // Flat fee for first 10 m³
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
              {activeTab === 'billing' && (
                <>
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
                </>
              )}
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b">
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              Billing
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              Management
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'billing' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <BillingForm
              billingData={billingData}
              updateBillingData={updateBillingData}
              updateWaterRates={updateWaterRates}
              handlePhotoUpload={handlePhotoUpload}
              electricityConsumption={electricityConsumption}
              electricityTotal={electricityTotal}
              waterConsumption={waterConsumption}
              waterTotal={waterTotal}
              parkingTotal={parkingTotal}
              grandTotal={grandTotal}
              months={months}
              years={years}
              sites={sites}
              tenants={tenants}
              getSiteById={getSiteById}
              getTenantById={getTenantById}
            />
            <ReceiptPreview
              receiptRef={receiptRef}
              billingData={billingData}
              electricityTotal={electricityTotal}
              waterTotal={waterTotal}
              parkingTotal={parkingTotal}
              grandTotal={grandTotal}
            />
          </div>
        ) : (
          <ManagementPanel
            sites={sites}
            tenants={tenants}
            billingRecords={billingRecords}
            getSiteById={getSiteById}
            getTenantById={getTenantById}
          />
        )}
      </div>
    </div>
  )
} 