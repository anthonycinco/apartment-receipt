'use client'

import { Building2, Users, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

interface ManagementPanelProps {
  sites: Site[]
  tenants: Tenant[]
  billingRecords: BillingRecord[]
  getSiteById: (id: string) => Site | undefined
}

export default function ManagementPanel({
  sites,
  tenants,
  billingRecords,
  getSiteById
}: ManagementPanelProps) {
  return (
    <div className="space-y-8">
      {/* Sites Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Sites Management
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Site
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.map(site => (
                <tr key={site.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.totalUnits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.occupiedUnits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenants Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Tenants Management
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Tenant
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map(tenant => {
                const site = getSiteById(tenant.siteId)
                return (
                  <tr key={tenant.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₱{tenant.baseRent.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tenant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Analytics Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">₱{billingRecords.reduce((sum, record) => sum + record.totalAmount, 0).toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">All time</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Active Tenants</h3>
            <p className="text-3xl font-bold text-green-600">{tenants.filter(t => t.status === 'active').length}</p>
            <p className="text-sm text-green-600 mt-1">Current</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Occupancy Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{Math.round((sites.reduce((sum, site) => sum + site.occupiedUnits, 0) / sites.reduce((sum, site) => sum + site.totalUnits, 0)) * 100)}%</p>
            <p className="text-sm text-purple-600 mt-1">Average</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={billingRecords.map(record => ({
                month: record.month,
                revenue: record.totalAmount
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Site Performance</h3>
            <div className="space-y-4">
              {sites.map(site => {
                const siteRecords = billingRecords.filter(record => record.siteId === site.id)
                const totalRevenue = siteRecords.reduce((sum, record) => sum + record.totalAmount, 0)
                return (
                  <div key={site.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{site.name}</h4>
                      <p className="text-sm text-gray-500">{site.occupiedUnits}/{site.totalUnits} units occupied</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₱{totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Total revenue</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 