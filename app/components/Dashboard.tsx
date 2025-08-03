'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Droplets, Calendar, BarChart3 } from 'lucide-react'

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
  billingData?: any
}

interface DashboardProps {
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

export default function Dashboard({
  billingRecords,
  sites,
  tenants,
  getSiteById,
  getTenantById
}: DashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedSite, setSelectedSite] = useState<string>('all')

  // Filter records by year and site
  const filteredRecords = billingRecords.filter(record => {
    const site = getSiteById(record.siteId)
    const matchesYear = record.year === selectedYear
    const matchesSite = selectedSite === 'all' || site?.id === selectedSite
    return matchesYear && matchesSite
  })

  // Calculate monthly data
  const monthlyData = months.map(month => {
    const monthRecords = filteredRecords.filter(record => record.month === month)
    return {
      month,
      revenue: monthRecords.reduce((sum, record) => sum + record.totalAmount, 0),
      electricity: monthRecords.reduce((sum, record) => sum + record.electricityConsumption, 0),
      water: monthRecords.reduce((sum, record) => sum + record.waterConsumption, 0),
      count: monthRecords.length
    }
  })

  // Calculate key metrics
  const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  const totalElectricity = filteredRecords.reduce((sum, record) => sum + record.electricityConsumption, 0)
  const totalWater = filteredRecords.reduce((sum, record) => sum + record.waterConsumption, 0)
  const avgRevenuePerRecord = filteredRecords.length > 0 ? totalRevenue / filteredRecords.length : 0

  // Calculate occupancy rate
  const activeTenants = tenants.filter(tenant => tenant.status === 'active')
  const totalUnits = sites.reduce((sum, site) => sum + site.totalUnits, 0)
  const occupancyRate = totalUnits > 0 ? (activeTenants.length / totalUnits) * 100 : 0

  // Calculate revenue growth (compare with previous year)
  const previousYearRecords = billingRecords.filter(record => 
    record.year === (parseInt(selectedYear) - 1).toString() &&
    (selectedSite === 'all' || getSiteById(record.siteId)?.id === selectedSite)
  )
  const previousYearRevenue = previousYearRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  const revenueGrowth = previousYearRevenue > 0 ? ((totalRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0

  // Top performing sites
  const sitePerformance = sites.map(site => {
    const siteRecords = filteredRecords.filter(record => record.siteId === site.id)
    return {
      name: site.name,
      revenue: siteRecords.reduce((sum, record) => sum + record.totalAmount, 0),
      count: siteRecords.length,
      avgRevenue: siteRecords.length > 0 ? siteRecords.reduce((sum, record) => sum + record.totalAmount, 0) / siteRecords.length : 0
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // Top tenants by revenue
  const tenantPerformance = tenants.map(tenant => {
    const tenantRecords = filteredRecords.filter(record => record.tenantId === tenant.id)
    return {
      name: tenant.name,
      doorNumber: tenant.doorNumber,
      site: getSiteById(tenant.siteId)?.name || '',
      revenue: tenantRecords.reduce((sum, record) => sum + record.totalAmount, 0),
      count: tenantRecords.length
    }
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
            <p className="text-gray-600">Business insights and performance metrics</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year.toString()} className="bg-white text-gray-900">{year}</option>
              ))}
            </select>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all" className="bg-white text-gray-900">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id} className="bg-white text-gray-900">{site.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300 mr-1" />
                  )}
                  <span className="text-sm">{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% vs last year</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Records</p>
                <p className="text-2xl font-bold">{filteredRecords.length}</p>
                <p className="text-sm text-green-200">Avg: ₱{avgRevenuePerRecord.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Electricity Usage</p>
                <p className="text-2xl font-bold">{totalElectricity.toLocaleString()} kWh</p>
                <p className="text-sm text-yellow-200">Avg: {(totalElectricity / filteredRecords.length || 0).toFixed(1)} kWh/record</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Water Usage</p>
                <p className="text-2xl font-bold">{totalWater.toLocaleString()} m³</p>
                <p className="text-sm text-purple-200">Avg: {(totalWater / filteredRecords.length || 0).toFixed(1)} m³/record</p>
              </div>
              <Droplets className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-20">{data.month.slice(0, 3)}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max((data.revenue / Math.max(...monthlyData.map(d => d.revenue))) * 100, 2)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-20 text-right">
                  ₱{data.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Site Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Site Performance</h3>
          <div className="space-y-3">
            {sitePerformance.slice(0, 5).map((site, index) => (
              <div key={site.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{site.name}</p>
                  <p className="text-sm text-gray-600">{site.count} records</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₱{site.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">₱{site.avgRevenue.toLocaleString()}/record</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Tenants and Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tenants */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Tenants by Revenue</h3>
          <div className="space-y-3">
            {tenantPerformance.map((tenant, index) => (
              <div key={tenant.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-600">{tenant.site} - {tenant.doorNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₱{tenant.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{tenant.count} records</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy and Units */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Property Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Total Units</p>
                  <p className="text-sm text-gray-600">Across all sites</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{totalUnits}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Active Tenants</p>
                  <p className="text-sm text-gray-600">Currently occupied</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{activeTenants.length}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Occupancy Rate</p>
                  <p className="text-sm text-gray-600">Current utilization</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{occupancyRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 