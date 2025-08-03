'use client'

import { useState, useRef, useEffect } from 'react'
import { Home as HomeIcon, FileText, ImageIcon, Users, AlertTriangle, Save, BarChart3, Menu, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import BillingForm from './components/BillingForm'
import ReceiptPreview from './components/ReceiptPreview'
import ManagementPanel from './components/ManagementPanel'
import TransactionHistory from './components/TransactionHistory'
import Dashboard from './components/Dashboard'
import PasswordProtection from './components/PasswordProtection'
import SharedStorage, { Site, Tenant, BillingRecord } from './lib/sharedStorage'

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing' | 'management' | 'history'>('dashboard')
  
  // Shared storage instance
  const sharedStorage = SharedStorage.getInstance()
  
  // Management state with shared storage
  const [sites, setSites] = useState<Site[]>(() => sharedStorage.getSites())
  const [tenants, setTenants] = useState<Tenant[]>(() => sharedStorage.getTenants())
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(() => sharedStorage.getBillingRecords())
  
  // Toast notification state
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    action?: {
      label: string
      onClick: () => void
    }
  } | null>(null)
  
  // Sync state for shared data
  const [lastSync, setLastSync] = useState<string>('')
  
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
      waterPrevious: 0,
      waterCurrent: 0,
      waterRates: {
        first10: 150,
        next10: 25,
        next10_2: 30,
        above30: 35
      },
      baseRent: 0,
      parkingFee: 500,
      parkingEnabled: false,
      damageDescription: '',
      otherFeeDescription: '',
      otherFeeAmount: 0
    }
  })

  const receiptRef = useRef<HTMLDivElement>(null)

  // Auto-save billing data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage('billingData', billingData)
    }, 30000)
    return () => clearInterval(interval)
  }, [billingData])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        saveBillingRecord()
      }
      // Ctrl/Cmd + E to export PDF
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault()
        exportAsPDF()
      }
      // Ctrl/Cmd + I to export image
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault()
        exportAsImage()
      }
      // Ctrl/Cmd + K to clear all
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        clearAllFields()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle authentication
  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  // Sync shared data every 5 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const sharedData = localStorage.getItem('sharedData')
      if (sharedData) {
        const parsed = JSON.parse(sharedData)
        setSites(parsed.sites || [])
        setTenants(parsed.tenants || [])
        setBillingRecords(parsed.billingRecords || [])
        setLastSync(parsed.lastUpdated || '')
      }
    }, 5000)

    return () => clearInterval(syncInterval)
  }, [])

  // Save management data when it changes
  useEffect(() => {
    sharedStorage.saveSites(sites)
  }, [sites])

  useEffect(() => {
    sharedStorage.saveTenants(tenants)
  }, [tenants])

  useEffect(() => {
    sharedStorage.saveBillingRecords(billingRecords)
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
  const showToast = (
    type: 'success' | 'error' | 'info', 
    message: string, 
    action?: { label: string; onClick: () => void }
  ) => {
    setToast({ type, message, action })
    setTimeout(() => setToast(null), 5000)
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

  // Export functions
  const exportAsPDF = async () => {
    try {
      if (!receiptRef.current) {
        console.error('Receipt ref is null')
        showToast('error', 'Receipt element not found')
        return
      }
      
      console.log('Starting PDF export...')
      
      // Wait a bit for any pending renders
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Create receipt canvas
      const receiptCanvas = await html2canvas(receiptRef.current, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        removeContainer: true
      })
      
      console.log('Receipt canvas created, dimensions:', receiptCanvas.width, 'x', receiptCanvas.height)
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate dimensions for receipt
      const receiptAspectRatio = receiptCanvas.width / receiptCanvas.height
      const receiptWidth = pageWidth - 20 // 10mm margin on each side
      const receiptHeight = receiptWidth / receiptAspectRatio
      
      // Convert canvas to image
      const receiptImgData = receiptCanvas.toDataURL('image/jpeg', 0.8)
      
      // Add receipt to PDF
      pdf.addImage(receiptImgData, 'JPEG', 10, 10, receiptWidth, receiptHeight)

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
      
      // Wait a bit for any pending renders
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        removeContainer: true
      })
      
      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height)
      
      const fileName = `cinco-apartments-bill-${billingData.siteName || 'unknown'}-${billingData.doorNumber || 'unknown'}-${billingData.billingMonth || 'unknown'}-${billingData.billingYear || 'unknown'}.png`
      
      const link = document.createElement('a')
      link.download = fileName
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
      
      showToast('success', 'Image exported successfully!')
    } catch (error) {
      console.error('Image export error:', error)
      showToast('error', 'Failed to export image: ' + (error as Error).message)
    }
  }

  const clearAllFields = () => {
    if (window.confirm('Are you sure you want to clear all fields? This will reset the entire form.')) {
      setBillingData({
        siteName: '',
        doorNumber: '',
        tenantName: '',
        billingMonth: months[new Date().getMonth()],
        billingYear: new Date().getFullYear().toString(),
        electricityPrevious: 0,
        electricityCurrent: 0,
        electricityPricePerKwh: 12.5,
        waterPrevious: 0,
        waterCurrent: 0,
        waterRates: {
          first10: 150,
          next10: 25,
          next10_2: 30,
          above30: 35
        },
        baseRent: 0,
        parkingFee: 500,
        parkingEnabled: false,
        damageDescription: '',
        otherFeeDescription: '',
        otherFeeAmount: 0
      })
      showToast('success', 'All fields cleared successfully!')
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

  // Show password protection if not authenticated
  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cinco Apartments</h1>
                <p className="text-xs sm:text-sm text-gray-600">Billing Management System</p>
                {lastSync && (
                  <p className="text-xs text-green-600 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Shared Data • Last sync: {new Date(lastSync).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop header actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={saveBillingRecord}
                className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Save to History</span>
              </button>
              <button
                onClick={clearAllFields}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
              <button
                onClick={exportAsImage}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export Image</span>
              </button>
              <button
                onClick={exportAsPDF}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
              <button
                onClick={saveBillingRecord}
                className="flex items-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save to History
              </button>
              <button
                onClick={clearAllFields}
                className="flex items-center w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Clear All
              </button>
              <button
                onClick={exportAsImage}
                className="flex items-center w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Export Image
              </button>
              <button
                onClick={exportAsPDF}
                className="flex items-center w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>History</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            billingRecords={billingRecords}
            sites={sites}
            tenants={tenants}
            getSiteById={getSiteById}
            getTenantById={getTenantById}
          />
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4 sm:space-y-8">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Bill</h2>
                  <p className="text-gray-600 mt-1">Fill in the billing information below to generate a receipt</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={clearAllFields}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Clear All
                  </button>
                  <button
                    onClick={exportAsImage}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Export Image
                  </button>
                  <button
                    onClick={exportAsPDF}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
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
                onClearAll={clearAllFields}
                onSaveToHistory={saveBillingRecord}
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
              {/* MeterPhotos component was removed, so this div is now empty */}
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
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {toast.type === 'success' ? (
              <Users className="w-4 h-4" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
} 