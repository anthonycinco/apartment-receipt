'use client'

import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, Download, FileText, ImageIcon, Eye, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ReceiptPreview from './ReceiptPreview'

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

interface TransactionHistoryProps {
  billingRecords: BillingRecord[]
  sites: Site[]
  tenants: Tenant[]
  getSiteById: (id: string) => Site | undefined
  getTenantById: (id: string) => Tenant | undefined
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface GroupedTransactions {
  [key: string]: BillingRecord[]
}

export default function TransactionHistory({
  billingRecords,
  sites,
  tenants,
  getSiteById,
  getTenantById
}: TransactionHistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [selectedTenant, setSelectedTenant] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  
  const receiptRef = useRef<HTMLDivElement>(null)

  // Filter records based on selections
  const filteredRecords = billingRecords.filter(record => {
    const tenant = getTenantById(record.tenantId)
    const site = getSiteById(record.siteId)
    
    if (!tenant || !site) return false
    
    const matchesMonth = selectedMonth === 'all' || record.month === selectedMonth
    const matchesYear = selectedYear === 'all' || record.year === selectedYear
    const matchesSite = selectedSite === 'all' || site.id === selectedSite
    const matchesTenant = selectedTenant === 'all' || tenant.id === selectedTenant
    const matchesSearch = searchTerm === '' || 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.doorNumber.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesMonth && matchesYear && matchesSite && matchesTenant && matchesSearch
  })

  // Group transactions by month and year
  const groupedTransactions: GroupedTransactions = filteredRecords.reduce((groups, record) => {
    const key = `${record.month} ${record.year}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(record)
    return groups
  }, {} as GroupedTransactions)

  // Sort groups by date (newest first)
  const sortedGroups = Object.entries(groupedTransactions).sort(([a], [b]) => {
    const [monthA, yearA] = a.split(' ')
    const [monthB, yearB] = b.split(' ')
    const yearDiff = parseInt(yearB) - parseInt(yearA)
    if (yearDiff !== 0) return yearDiff
    return months.indexOf(monthB) - months.indexOf(monthA)
  })

  // Get unique years and months from records
  const years = Array.from(new Set(billingRecords.map(r => r.year))).sort((a, b) => b.localeCompare(a))
  const monthsInRecords = Array.from(new Set(billingRecords.map(r => r.month))).sort((a, b) => 
    months.indexOf(a) - months.indexOf(b)
  )

  // Calculate totals
  const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  const totalElectricity = filteredRecords.reduce((sum, record) => sum + record.electricityConsumption, 0)
  const totalWater = filteredRecords.reduce((sum, record) => sum + record.waterConsumption, 0)

  const handleViewDetails = (record: BillingRecord) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedRecord(null)
  }

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const expandAllGroups = () => {
    const allGroups = new Set(sortedGroups.map(([key]) => key))
    setExpandedGroups(allGroups)
  }

  const collapseAllGroups = () => {
    setExpandedGroups(new Set())
  }

  // Export functions for selected record
  const exportRecordAsPDF = async () => {
    if (!selectedRecord || !receiptRef.current) return
    
    try {
      console.log('Starting PDF export for record...')
      
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

      const tenant = getTenantById(selectedRecord.tenantId)
      const site = getSiteById(selectedRecord.siteId)
      const fileName = `cinco-apartments-bill-${site?.name || 'unknown'}-${tenant?.doorNumber || 'unknown'}-${selectedRecord.month}-${selectedRecord.year}.pdf`
      
      console.log('Saving PDF as:', fileName)
      pdf.save(fileName)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF: ' + (error as Error).message)
    }
  }

  const exportRecordAsImage = async () => {
    if (!selectedRecord || !receiptRef.current) return
    
    try {
      console.log('Starting image export for record...')
      
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
      
      const tenant = getTenantById(selectedRecord.tenantId)
      const site = getSiteById(selectedRecord.siteId)
      const fileName = `cinco-apartments-bill-${site?.name || 'unknown'}-${tenant?.doorNumber || 'unknown'}-${selectedRecord.month}-${selectedRecord.year}.png`
      
      const link = document.createElement('a')
      link.download = fileName
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('Image export error:', error)
      alert('Failed to export image: ' + (error as Error).message)
    }
  }

  // Calculate billing data for selected record
  const getBillingDataForRecord = (record: BillingRecord): BillingData => {
    const tenant = getTenantById(record.tenantId)
    const site = getSiteById(record.siteId)
    
    return {
      siteName: site?.name || '',
      doorNumber: tenant?.doorNumber || '',
      tenantName: tenant?.name || '',
      billingMonth: record.month,
      billingYear: record.year,
      electricityPrevious: 0, // We don't store these in records
      electricityCurrent: record.electricityConsumption,
      electricityPricePerKwh: 12.5, // Default value
      waterPrevious: 0, // We don't store these in records
      waterCurrent: record.waterConsumption,
      waterRates: {
        first10: 150,
        next10: 25,
        next10_2: 30,
        above30: 35
      },
      baseRent: tenant?.baseRent || 0,
      parkingFee: 500,
      parkingEnabled: false,
      damageDescription: '',
      otherFeeDescription: '',
      otherFeeAmount: 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Months</option>
              {monthsInRecords.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Tenants</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, site, or door number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Total Records</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{filteredRecords.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-900">₱{totalRevenue.toLocaleString()}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Avg. per Record</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              ₱{filteredRecords.length > 0 ? (totalRevenue / filteredRecords.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
        </div>

        {/* Group Controls */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transactions by Month</h3>
          <div className="flex space-x-2">
            <button
              onClick={expandAllGroups}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllGroups}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Records */}
      <div className="space-y-4">
        {sortedGroups.map(([groupKey, records]) => {
          const [month, year] = groupKey.split(' ')
          const isExpanded = expandedGroups.has(groupKey)
          const groupTotal = records.reduce((sum, record) => sum + record.totalAmount, 0)
          
          return (
            <div key={groupKey} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Group Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleGroup(groupKey)}
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{month} {year}</h4>
                    <p className="text-sm text-gray-600">{records.length} transaction{records.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₱{groupTotal.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>

              {/* Group Content */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Site
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Door Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Electricity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Water
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {records.map((record) => {
                          const tenant = getTenantById(record.tenantId)
                          const site = getSiteById(record.siteId)
                          
                          if (!tenant || !site) return null
                          
                          return (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {site.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tenant.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tenant.doorNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.electricityConsumption} kWh
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.waterConsumption} m³
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₱{record.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <button
                                  onClick={() => handleViewDetails(record)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {sortedGroups.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={exportRecordAsPDF}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportRecordAsImage}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Export Image
                  </button>
                  <button
                    onClick={closeDetails}
                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReceiptPreview
                  receiptRef={receiptRef}
                  billingData={getBillingDataForRecord(selectedRecord)}
                  electricityTotal={selectedRecord.electricityConsumption * 12.5} // Default price
                  waterTotal={selectedRecord.waterConsumption * 25} // Default rate
                  parkingTotal={0}
                  grandTotal={selectedRecord.totalAmount}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 