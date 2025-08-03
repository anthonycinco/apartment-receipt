'use client'

import { useState, useRef, useEffect } from 'react'
import { Home as HomeIcon, FileText, Settings, History, Plus, Save, Download, Image as ImageIcon, AlertTriangle } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import BillingForm from './components/BillingForm'
import ReceiptPreview from './components/ReceiptPreview'
import ManagementPanel from './components/ManagementPanel'
import TransactionHistory from './components/TransactionHistory'
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
  billingData?: BillingData // Full billing data for the record
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
  const [activeTab, setActiveTab] = useState<'billing' | 'management' | 'history'>('billing')
  
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
      date: new Date().toISOString(),
      billingData: { ...billingData } // Save full billing data including photos
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
    try {
      console.log(`Uploading ${type} photo:`, file.name, file.size, 'bytes')
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoData = e.target?.result as string
        console.log(`${type} photo uploaded successfully, data length:`, photoData.length)
        updateBillingData(type === 'electricity' ? 'electricityPhoto' : 'waterPhoto', photoData)
        showToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} photo uploaded successfully!`)
      }
      reader.onerror = (error) => {
        console.error(`Error reading ${type} photo:`, error)
        showToast('error', `Failed to upload ${type} photo`)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error(`Error in handlePhotoUpload for ${type}:`, error)
      showToast('error', `Failed to upload ${type} photo: ${(error as Error).message}`)
    }
  }

  // Export functions
  const exportAsPDF = async () => {
    try {
      if (!receiptRef.current) {
        console.error('Receipt ref is null')
        showToast('error', 'Receipt element not found')
        return
      }
      
      console.log('Starting PDF export...')
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true
      })
      
      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height)
      
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
        console.log('Adding meter photos page...')
        const photosCanvas = await html2canvas(meterPhotosRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true
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

      const fileName = `cinco-apartments-bill-${billingData.siteName || 'unknown'}-${billingData.doorNumber || 'unknown'}-${billingData.billingMonth || 'unknown'}-${billingData.billingYear || 'unknown'}.pdf`
      console.log('Saving PDF as:', fileName)
      
      pdf.save(fileName)
      showToast('success', 'PDF exported successfully!')
    } catch (error) {
      console.error('PDF export error:', error)
      showToast('error', 'Failed to export PDF: ' + (error as Error).message)
    }
  }

  const exportAsImage = async () => {
    try {
      if (!receiptRef.current) {
        console.error('Receipt ref is null')
        showToast('error', 'Receipt element not found')
        return
      }
      
      console.log('Starting image export...')
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true
      })
      
      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height)
      
      const fileName = `cinco-apartments-bill-${billingData.siteName || 'unknown'}-${billingData.doorNumber || 'unknown'}-${billingData.billingMonth || 'unknown'}-${billingData.billingYear || 'unknown'}.png`
      
      const link = document.createElement('a')
      link.download = fileName
      link.href = canvas.toDataURL()
      link.click()
      
      // Export meter photos as separate image if they exist
      if ((billingData.electricityPhoto || billingData.waterPhoto) && meterPhotosRef.current) {
        console.log('Exporting meter photos as separate image...')
        const photosCanvas = await html2canvas(meterPhotosRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true
        })
        
        const photosFileName = `cinco-apartments-meter-photos-${billingData.siteName || 'unknown'}-${billingData.doorNumber || 'unknown'}-${billingData.billingMonth || 'unknown'}-${billingData.billingYear || 'unknown'}.png`
        const photosLink = document.createElement('a')
        photosLink.download = photosFileName
        photosLink.href = photosCanvas.toDataURL()
        photosLink.click()
      }
      
      showToast('success', 'Image exported successfully!')
    } catch (error) {
      console.error('Image export error:', error)
      showToast('error', 'Failed to export image: ' + (error as Error).message)
    }
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cinco Apartments</h1>
                <p className="text-sm text-gray-600">Billing Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => saveBillingRecord()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Receipt
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Billing</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Bill</h2>
                  <p className="text-gray-600 mt-1">Fill in the billing information below to generate a receipt</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={exportAsImage}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Export Image
                  </button>
                  <button
                    onClick={exportAsPDF}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
            </div>

            {/* Receipt Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <ReceiptPreview
                receiptRef={receiptRef}
                billingData={billingData}
                electricityTotal={electricityTotal}
                waterTotal={waterTotal}
                parkingTotal={parkingTotal}
                grandTotal={grandTotal}
              />
            </div>

            {/* Hidden Meter Photos for Export */}
            <div className="hidden">
              <MeterPhotos
                photosRef={meterPhotosRef}
                billingData={billingData}
              />
            </div>
          </div>
        )}

        {activeTab === 'management' && (
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

        {activeTab === 'history' && (
          <TransactionHistory
            billingRecords={billingRecords}
            sites={sites}
            tenants={tenants}
            getSiteById={getSiteById}
            getTenantById={getTenantById}
          />
        )}
      </main>

      {/* Toast Notifications */}
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
    </div>
  )
} 