'use client'

import { useState } from 'react'
import { Building2, Users, BarChart3, Search, Filter } from 'lucide-react'
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
  getTenantById: (id: string) => Tenant | undefined
  addSite: (site: Omit<Site, 'id'>) => void
  updateSite: (id: string, updates: Partial<Site>) => void
  deleteSite: (id: string) => void
  addTenant: (tenant: Omit<Tenant, 'id'>) => void
  updateTenant: (id: string, updates: Partial<Tenant>) => void
  deleteTenant: (id: string) => void
}

export default function ManagementPanel({
  sites,
  tenants,
  billingRecords,
  getSiteById,
  getTenantById,
  addSite,
  updateSite,
  deleteSite,
  addTenant,
  updateTenant,
  deleteTenant
}: ManagementPanelProps) {
  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [selectedTenant, setSelectedTenant] = useState<string>('all')
  
  // Search states
  const [siteSearchTerm, setSiteSearchTerm] = useState('')
  const [tenantSearchTerm, setTenantSearchTerm] = useState('')
  
  // Edit states
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [showSiteModal, setShowSiteModal] = useState(false)
  const [showTenantModal, setShowTenantModal] = useState(false)
  
  // Form states
  const [siteForm, setSiteForm] = useState({
    name: '',
    address: '',
    totalUnits: 0,
    occupiedUnits: 0
  })
  
  const [tenantForm, setTenantForm] = useState({
    name: '',
    siteId: '',
    unit: '',
    phone: '',
    email: '',
    moveInDate: '',
    baseRent: 0,
    status: 'active' as 'active' | 'inactive'
  })

  // Filtered data
  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(siteSearchTerm.toLowerCase()) ||
    site.address.toLowerCase().includes(siteSearchTerm.toLowerCase())
  )

  const filteredTenants = tenants.filter(tenant => {
    const site = getSiteById(tenant.siteId)
    const matchesSearch = tenant.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
                         tenant.unit.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
                         tenant.phone.includes(tenantSearchTerm) ||
                         tenant.email.toLowerCase().includes(tenantSearchTerm.toLowerCase())
    const matchesSite = selectedSite === 'all' || tenant.siteId === selectedSite
    return matchesSearch && matchesSite
  })

  // Filter records based on selection
  const filteredRecords = billingRecords.filter(record => {
    const siteMatch = selectedSite === 'all' || record.siteId === selectedSite
    const tenantMatch = selectedTenant === 'all' || record.tenantId === selectedTenant
    return siteMatch && tenantMatch
  })

  const totalRevenue = filteredRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  const activeTenants = tenants.filter(t => t.status === 'active' && 
    (selectedSite === 'all' || getSiteById(t.siteId)?.id === selectedSite))
  const occupancyRate = selectedSite === 'all' 
    ? Math.round((sites.reduce((sum, site) => sum + site.occupiedUnits, 0) / sites.reduce((sum, site) => sum + site.totalUnits, 0)) * 100)
    : (() => {
        const site = sites.find(s => s.id === selectedSite)
        return site ? Math.round((site.occupiedUnits / site.totalUnits) * 100) : 0
      })()

  const handleSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSite) {
      updateSite(editingSite.id, siteForm)
    } else {
      addSite(siteForm)
    }
    setShowSiteModal(false)
    setEditingSite(null)
    setSiteForm({ name: '', address: '', totalUnits: 0, occupiedUnits: 0 })
  }

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTenant) {
      updateTenant(editingTenant.id, tenantForm)
    } else {
      addTenant(tenantForm)
    }
    setShowTenantModal(false)
    setEditingTenant(null)
    setTenantForm({
      name: '',
      siteId: '',
      unit: '',
      phone: '',
      email: '',
      moveInDate: '',
      baseRent: 0,
      status: 'active'
    })
  }

  const openSiteModal = (site?: Site) => {
    if (site) {
      setEditingSite(site)
      setSiteForm({
        name: site.name,
        address: site.address,
        totalUnits: site.totalUnits,
        occupiedUnits: site.occupiedUnits
      })
    } else {
      setEditingSite(null)
      setSiteForm({ name: '', address: '', totalUnits: 0, occupiedUnits: 0 })
    }
    setShowSiteModal(true)
  }

  const openTenantModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant)
      setTenantForm({
        name: tenant.name,
        siteId: tenant.siteId,
        unit: tenant.unit,
        phone: tenant.phone,
        email: tenant.email,
        moveInDate: tenant.moveInDate,
        baseRent: tenant.baseRent,
        status: tenant.status
      })
    } else {
      setEditingTenant(null)
      setTenantForm({
        name: '',
        siteId: '',
        unit: '',
        phone: '',
        email: '',
        moveInDate: '',
        baseRent: 0,
        status: 'active'
      })
    }
    setShowTenantModal(true)
  }

  return (
    <div className="space-y-8">
      {/* Sites Management */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Sites Management
          </h2>
          <button 
            onClick={() => openSiteModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Site
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sites by name or address..."
              value={siteSearchTerm}
              onChange={(e) => setSiteSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
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
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {siteSearchTerm ? 'No sites found matching your search.' : 'No sites added yet.'}
                  </td>
                </tr>
              ) : (
                filteredSites.map(site => (
                  <tr key={site.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.totalUnits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.occupiedUnits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => openSiteModal(site)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteSite(site.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
          <button 
            onClick={() => openTenantModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Tenant
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tenants by name, unit, phone, or email..."
              value={tenantSearchTerm}
              onChange={(e) => setTenantSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
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
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {tenantSearchTerm || selectedSite !== 'all' 
                      ? 'No tenants found matching your search/filter.' 
                      : 'No tenants added yet.'}
                  </td>
                </tr>
              ) : (
                filteredTenants.map(tenant => {
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
                        <button 
                          onClick={() => openTenantModal(tenant)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteTenant(tenant.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
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
        
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Tenants</option>
              {tenants
                .filter(tenant => selectedSite === 'all' || getSiteById(tenant.siteId)?.id === selectedSite)
                .map(tenant => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name} - {tenant.unit}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">₱{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">
              {selectedSite !== 'all' ? getSiteById(selectedSite)?.name : 'All sites'}
              {selectedTenant !== 'all' && ` - ${getTenantById(selectedTenant)?.name}`}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Active Tenants</h3>
            <p className="text-3xl font-bold text-green-600">{activeTenants.length}</p>
            <p className="text-sm text-green-600 mt-1">
              {selectedSite !== 'all' ? getSiteById(selectedSite)?.name : 'All sites'}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Occupancy Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{occupancyRate}%</p>
            <p className="text-sm text-purple-600 mt-1">
              {selectedSite !== 'all' ? getSiteById(selectedSite)?.name : 'Average'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredRecords.map(record => ({
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
              {sites
                .filter(site => selectedSite === 'all' || site.id === selectedSite)
                .map(site => {
                  const siteRecords = filteredRecords.filter(record => record.siteId === site.id)
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

      {/* Site Modal */}
      {showSiteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSite ? 'Edit Site' : 'Add Site'}
            </h3>
            <form onSubmit={handleSiteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input
                  type="text"
                  value={siteForm.name}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                  <input
                    type="number"
                    value={siteForm.totalUnits}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, totalUnits: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupied Units</label>
                  <input
                    type="number"
                    value={siteForm.occupiedUnits}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, occupiedUnits: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSite ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSiteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTenant ? 'Edit Tenant' : 'Add Tenant'}
            </h3>
            <form onSubmit={handleTenantSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                <select
                  value={tenantForm.siteId}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, siteId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="">Select a site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={tenantForm.unit}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={tenantForm.phone}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
                <input
                  type="date"
                  value={tenantForm.moveInDate}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Rent (₱)</label>
                <input
                  type="number"
                  value={tenantForm.baseRent}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, baseRent: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={tenantForm.status}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTenant ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTenantModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 