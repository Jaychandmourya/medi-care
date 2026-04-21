import { useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  fetchOPDTrend,
  fetchBedOccupancy,
  fetchDepartmentDistribution,
  fetchAppointmentStatus,
  fetchDoctorWorkload,
  fetchRevenue,
  fetchDrugRecalls,
  clearError,
} from '@/features/reports/reportsSlice'
import { exportToCSV, printReport, formatCurrency, formatDate, formatPercentage } from '@/utils/exportUtils'
import type { RootState, AppDispatch } from '@/app/store'
import { Download, Printer, RefreshCw, Users, Bed, DollarSign, AlertTriangle } from 'lucide-react'

// Chart colors
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const STATUS_COLORS = {
  'Completed': '#10b981',
  'Cancelled': '#f59e0b',
  'No-Show': '#ef4444',
}

const AdminReports = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    opdTrend,
    bedOccupancy,
    departmentDistribution,
    appointmentStatus,
    doctorWorkload,
    revenue,
    drugRecalls,
    loading,
    error,
  } = useSelector((state: RootState) => state.reports)


  useEffect(() => {
    // Fetch all report data on component mount
    const fetchAllData = async () => {
      try {
        await Promise.all([
          dispatch(fetchOPDTrend()),
          dispatch(fetchBedOccupancy()),
          dispatch(fetchDepartmentDistribution()),
          dispatch(fetchAppointmentStatus()),
          dispatch(fetchDoctorWorkload()),
          dispatch(fetchRevenue()),
          dispatch(fetchDrugRecalls()),
        ])
      } catch (error) {
        console.error('Error fetching report data:', error)
      }
    }

    fetchAllData()
  }, [dispatch])

  const handleRefresh = useCallback(() => {
    dispatch(clearError())
    const fetchAllData = async () => {
      try {
        await Promise.all([
          dispatch(fetchOPDTrend()),
          dispatch(fetchBedOccupancy()),
          dispatch(fetchDepartmentDistribution()),
          dispatch(fetchAppointmentStatus()),
          dispatch(fetchDoctorWorkload()),
          dispatch(fetchRevenue()),
          dispatch(fetchDrugRecalls()),
        ])
      } catch (error) {
        console.error('Error refreshing report data:', error)
      }
    }

    fetchAllData()
  }, [dispatch])

  const handleExportCSV = useCallback((chartType: string) => {
    let data: Record<string, unknown>[] = []
    let filename = ''
    let headers: string[] = []

    switch (chartType) {
      case 'opdTrend':
        data = opdTrend.map(item => ({
          Date: formatDate(item.date),
          Patients: item.patients,
        }))
        filename = 'opd-trend.csv'
        headers = ['Date', 'Patients']
        break
      case 'bedOccupancy':
        data = bedOccupancy.map(item => ({
          Date: formatDate(item.date),
          'Occupancy Rate (%)': item.occupancyRate,
        }))
        filename = 'bed-occupancy.csv'
        headers = ['Date', 'Occupancy Rate (%)']
        break
      case 'departmentDistribution':
        data = departmentDistribution.map(item => ({
          Department: item.department,
          'Patient Count': item.count,
          'Percentage (%)': item.percentage,
        }))
        filename = 'department-distribution.csv'
        headers = ['Department', 'Patient Count', 'Percentage (%)']
        break
      case 'appointmentStatus':
        data = appointmentStatus.map(item => ({
          Date: formatDate(item.date),
          Status: item.status,
          Count: item.count,
        }))
        filename = 'appointment-status.csv'
        headers = ['Date', 'Status', 'Count']
        break
      case 'doctorWorkload':
        data = doctorWorkload.map(item => ({
          'Doctor Name': item.doctorName,
          Department: item.department,
          Appointments: item.appointments,
        }))
        filename = 'doctor-workload.csv'
        headers = ['Doctor Name', 'Department', 'Appointments']
        break
      case 'revenue':
        data = revenue.map(item => ({
          Department: item.department,
          Revenue: item.revenue,
        }))
        filename = 'revenue-summary.csv'
        headers = ['Department', 'Revenue']
        break
      case 'drugRecalls':
        data = drugRecalls.map(item => ({
          'Drug Class': item.drugClass,
          'Recall Count': item.recallCount,
          'Last Updated': formatDate(item.lastUpdated),
        }))
        filename = 'drug-recalls.csv'
        headers = ['Drug Class', 'Recall Count', 'Last Updated']
        break
    }

    if (data.length > 0) {
      exportToCSV(data, filename, headers)
    }
  }, [opdTrend, bedOccupancy, departmentDistribution, appointmentStatus, doctorWorkload, revenue, drugRecalls])

  const handlePrint = useCallback(() => {
    printReport()
  }, [])

  // Calculate summary statistics with useMemo
  const totalPatients = useMemo(() =>
    opdTrend.reduce((sum, item) => sum + item.patients, 0),
    [opdTrend]
  )

  const avgOccupancy = useMemo(() =>
    bedOccupancy.length > 0
      ? Math.round(bedOccupancy.reduce((sum, item) => sum + item.occupancyRate, 0) / bedOccupancy.length)
      : 0,
    [bedOccupancy]
  )

  const totalRevenue = useMemo(() =>
    revenue.reduce((sum, item) => sum + item.revenue, 0),
    [revenue]
  )

  const totalRecalls = useMemo(() =>
    drugRecalls.reduce((sum, item) => sum + item.recallCount, 0),
    [drugRecalls]
  )

  if (loading && opdTrend.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div id="admin-reports-container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive analytics and insights for MediCare HMS</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="summary-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="summary-label text-sm font-medium text-gray-600">Total Patients (30 days)</p>
                <p className="summary-value text-2xl font-bold text-gray-900 mt-2">{totalPatients.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="summary-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="summary-label text-sm font-medium text-gray-600">Avg Bed Occupancy</p>
                <p className="summary-value text-2xl font-bold text-gray-900 mt-2">{formatPercentage(avgOccupancy)}</p>
              </div>
              <Bed className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="summary-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="summary-label text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="summary-value text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="summary-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="summary-label text-sm font-medium text-gray-600">Drug Recalls</p>
                <p className="summary-value text-2xl font-bold text-gray-900 mt-2">{totalRecalls}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPD Trend Chart */}
        <div className="chart-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="chart-title text-lg font-semibold text-gray-900">OPD Trend Chart</h2>
            <button
              onClick={() => handleExportCSV('opdTrend')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
          <p className="chart-description text-sm text-gray-600 mb-4">Patients per day over last 30 days</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={opdTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value) => [`${value} patients`, 'Count']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="patients"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Patients"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bed Occupancy Over Time */}
        <div className="chart-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="chart-title text-lg font-semibold text-gray-900">Bed Occupancy Over Time</h2>
            <button
              onClick={() => handleExportCSV('bedOccupancy')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
          <p className="chart-description text-sm text-gray-600 mb-4">Occupancy % per day</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bedOccupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value) => [`${value}%`, 'Occupancy Rate']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="occupancyRate"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Occupancy Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department-wise Patient Distribution */}
        <div className="chart-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="chart-title text-lg font-semibold text-gray-900">Department-wise Patient Distribution</h2>
            <button
              onClick={() => handleExportCSV('departmentDistribution')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
          <p className="chart-description text-sm text-gray-600 mb-4">Patient distribution by department</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const { index } = props
                  const data = departmentDistribution[index]
                  return `${data?.department}: ${data?.percentage}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {departmentDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="chart-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="chart-title text-lg font-semibold text-gray-900">Appointment Status Breakdown</h2>
            <button
              onClick={() => handleExportCSV('appointmentStatus')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
          <p className="chart-description text-sm text-gray-600 mb-4">Completed vs Cancelled vs No-Show</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value, name) => [`${value}`, name]}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Count">
                {appointmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doctor Workload Comparison */}
        <div className="chart-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="chart-title text-lg font-semibold text-gray-900">Doctor Workload Comparison</h2>
            <button
              onClick={() => handleExportCSV('doctorWorkload')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
          <p className="chart-description text-sm text-gray-600 mb-4">Appointments per doctor this month</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doctorWorkload} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="doctorName" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value} appointments`, 'Count']} />
              <Legend />
              <Bar dataKey="appointments" fill="#8b5cf6" name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Summary */}
        <div className="chart-section bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="chart-title text-lg font-semibold text-gray-900">Revenue Summary</h2>
            <button
              onClick={() => handleExportCSV('revenue')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
          <p className="chart-description text-sm text-gray-600 mb-4">Billing data per department</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#ec4899" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drug Recall Summary Widget */}
      <div className="chart-section mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="chart-title text-lg font-semibold text-gray-900">Drug Recall Summary</h2>
          <button
            onClick={() => handleExportCSV('drugRecalls')}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
        </div>
        <p className="chart-description text-sm text-gray-600 mb-4">Count of recalls by drug class (OpenFDA API)</p>
        <div className="drug-recall-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {drugRecalls.map((recall, index) => (
            <div key={index} className="recall-card bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="recall-header flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="recall-count text-2xl font-bold text-red-600">{recall.recallCount}</span>
              </div>
              <p className="recall-class text-sm font-medium text-gray-900">{recall.drugClass}</p>
              <p className="recall-date text-xs text-gray-600 mt-1">
                Updated: {formatDate(recall.lastUpdated)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-section mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">Error loading reports: {error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports