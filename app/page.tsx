'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, Image as ImageIcon, Calculator, Building2, Save, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import BillingForm from './components/BillingForm'
import ReceiptPreview from './components/ReceiptPreview'
import ManagementPanel from './components/ManagementPanel'
import MeterPhotos from './components/MeterPhotos'

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

// Data persistence utilities
const saveToLocalStorage = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    }
    return defaultValue
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return defaultValue
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'billing' | 'management'>('billing')
  
  // Management state with persistence
  const [sites, setSites] = useState<Site[]>(() => loadFromLocalStorage('sites', []))
  const [tenants, setTenants] = useState<Tenant[]>(() => loadFromLocalStorage('tenants', []))
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(() => loadFromLocalStorage('billingRecords', []))
  
  // Toast notification state
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const [billingData, setBillingData] = useState<BillingData>(() => {
    const saved = loadFromLocalStorage('billingData', null)
    if (saved) return saved
    
    return {
      siteName: '',
      doorNumber: '',
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
    }
  })

  const receiptRef = useRef<HTMLDivElement>(null)
  const meterPhotosRef = useRef<HTMLDivElement>(null)

  // Auto-save billing data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage('billingData', billingData)
    }, 30000)
    return () => clearInterval(interval)
  }, [billingData])

  // Save management data when it changes
  useEffect(() => {
    saveToLocalStorage('sites', sites)
  }, [sites])

  useEffect(() => {
    saveToLocalStorage('tenants', tenants)
  }, [tenants])

  useEffect(() => {
    saveToLocalStorage('billingRecords', billingRecords)
  }, [billingRecords])

  const updateBillingData = (field: keyof BillingData, value: any) => {
    setBillingData(prev => ({ ...prev, [field]: value }))
  }

  const updateWaterRates = (field: keyof BillingData['waterRates'], value: number) => {
    setBillingData(prev => ({
      ...prev,
      waterRates: { ...prev.waterRates, [field]: value }
    }))
  }

  // Toast notification utility
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Management functions with confirmation dialogs
  const addSite = (site: Omit<Site, 'id'>) => {
    const newSite = { ...site, id: Date.now().toString() }
    setSites(prev => [...prev, newSite])
    showToast('success', 'Site added successfully!')
  }

  const updateSite = (id: string, updates: Partial<Site>) => {
    setSites(prev => prev.map(site => site.id === id ? { ...site, ...updates } : site))
    showToast('success', 'Site updated successfully!')
  }

  const deleteSite = (id: string) => {
    // Check if site has tenants
    const siteTenants = tenants.filter(tenant => tenant.siteId === id)
    if (siteTenants.length > 0) {
      if (window.confirm(`This site has ${siteTenants.length} tenant(s). Deleting it will also remove all associated tenants. Are you sure?`)) {
        setSites(prev => prev.filter(site => site.id !== id))
        setTenants(prev => prev.filter(tenant => tenant.siteId !== id))
        showToast('success', 'Site and associated tenants deleted successfully!')
      }
    } else {
      if (window.confirm('Are you sure you want to delete this site?')) {
        setSites(prev => prev.filter(site => site.id !== id))
        showToast('success', 'Site deleted successfully!')
      }
    }
  }

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant = { ...tenant, id: Date.now().toString() }
    setTenants(prev => [...prev, newTenant])
    showToast('success', 'Tenant added successfully!')
  }

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(tenant => tenant.id === id ? { ...tenant, ...updates } : tenant))
    showToast('success', 'Tenant updated successfully!')
  }

  const deleteTenant = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      setTenants(prev => prev.filter(tenant => tenant.id !== id))
      showToast('success', 'Tenant deleted successfully!')
    }
  }

  const getSiteById = (id: string) => sites.find(site => site.id === id)
  const getTenantById = (id: string) => tenants.find(tenant => tenant.id === id)

  // Save billing record to history
  const saveBillingRecord = () => {
    const tenant = tenants.find(t => t.name === billingData.tenantName)
    const site = sites.find(s => s.name === billingData.siteName)
    
    if (!tenant || !site) {
      showToast('error', 'Please select a valid tenant and site')
      return
    }

    const newRecord: BillingRecord = {
      id: Date.now().toString(),
      tenantId: tenant.id,
      siteId: site.id,
      month: billingData.billingMonth,
      year: billingData.billingYear,
      electricityConsumption: electricityConsumption,
      waterConsumption: waterConsumption,
      totalAmount: grandTotal,
      date: new Date().toISOString()
    }
    
    setBillingRecords(prev => [...prev, newRecord])
    showToast('success', 'Billing record saved to history!')
  }

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

    // Add meter photos page if photos exist
    if ((billingData.electricityPhoto || billingData.waterPhoto) && meterPhotosRef.current) {
      const photosCanvas = await html2canvas(meterPhotosRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const photosImgData = photosCanvas.toDataURL('image/png')
      const photosImgHeight = (photosCanvas.height * imgWidth) / photosCanvas.width
      let photosHeightLeft = photosImgHeight

      pdf.addPage()
      pdf.addImage(photosImgData, 'PNG', 0, 0, imgWidth, photosImgHeight)
      photosHeightLeft -= pageHeight

      while (photosHeightLeft >= 0) {
        const position = photosHeightLeft - photosImgHeight
        pdf.addPage()
        pdf.addImage(photosImgData, 'PNG', 0, position, imgWidth, photosImgHeight)
        photosHeightLeft -= pageHeight
      }
    }

    pdf.save(`cinco-apartments-bill-${billingData.siteName}-${billingData.doorNumber}-${billingData.billingMonth}-${billingData.billingYear}.pdf`)
    showToast('success', 'PDF exported successfully!')
  }

  const exportAsImage = async () => {
    if (!receiptRef.current) return
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    const link = document.createElement('a')
    link.download = `cinco-apartments-bill-${billingData.siteName}-${billingData.doorNumber}-${billingData.billingMonth}-${billingData.billingYear}.png`
    link.href = canvas.toDataURL()
    link.click()
    
    // Export meter photos as separate image if they exist
    if ((billingData.electricityPhoto || billingData.waterPhoto) && meterPhotosRef.current) {
      const photosCanvas = await html2canvas(meterPhotosRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const photosLink = document.createElement('a')
      photosLink.download = `cinco-apartments-meter-photos-${billingData.siteName}-${billingData.doorNumber}-${billingData.billingMonth}-${billingData.billingYear}.png`
      photosLink.href = photosCanvas.toDataURL()
      photosLink.click()
    }
    
    showToast('success', 'Image exported successfully!')
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <Save className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

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
                    onClick={saveBillingRecord}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Bill
                  </button>
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
            {/* Hidden meter photos component for PDF/image export */}
            <div className="hidden">
              <MeterPhotos
                photosRef={meterPhotosRef}
                billingData={billingData}
              />
            </div>
          </div>
        ) : (
          <ManagementPanel
            sites={sites}
            tenants={tenants}
            billingRecords={billingRecords}
            getSiteById={getSiteById}
            getTenantById={getTenantById}
            addSite={addSite}
            updateSite={updateSite}
            deleteSite={deleteSite}
            addTenant={addTenant}
            updateTenant={updateTenant}
            deleteTenant={deleteTenant}
          />
        )}
      </div>
    </div>
  )
} 