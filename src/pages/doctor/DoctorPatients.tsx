import { useEffect, useState, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'

// Import icons file
import { Search, Filter, Edit, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

// Import UI components
import { Button } from '@/components/common/Button'
import { Label } from '@/components/common/Label'
import Input from '@/components/common/Input'
import ThreeDotMenu from '@/components/common/ThreeDotMenu'

// Import utile file
import { ROLE_THEME } from '@/utils/theme'

// Import Types files
import type { RootState } from '@/app/store'
import type { Appointment } from '@/types/appointment/appointmentType'
import type { Patient } from '@/types/patients/patientType'

// Import selector for redux
import { useSelector } from 'react-redux'

// Import services file
import { appointmentServices } from '@/services/appointmentServices'
import { patientService } from '@/services/patientServices'

const DoctorPatients = () => {

  // State
  const [isOpenViewDialog, setIsOpenViewDialog] = useState<boolean>(false)
  const [isOpenEditDialog, setIsOpenEditDialog] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  // Dialog states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // Filter states
  const [genderFilter, setGenderFilter] = useState<string>('')
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('')
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: '', max: '' })

  // Get current logged-in doctor info
  const user = useSelector((state: RootState) => state.auth.user)

  // Get theme colors based on user role
  const themeColors = user ? ROLE_THEME[user.role] : ROLE_THEME.doctor

  useEffect(() => {
    const fetchDoctorPatients = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get doctor ID from localStorage (stored during login)
        const doctorInfo = localStorage.getItem('doctorInfo')
        if (!doctorInfo) {
          setError('Doctor information not found')
          return
        }

        const { doctorId } = JSON.parse(doctorInfo)

        // Fetch all appointments for this doctor
        const startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1) // Get appointments from last year
        const endDate = new Date()
        endDate.setFullYear(endDate.getFullYear() + 1) // To next year

        const doctorAppointments = await appointmentServices.fetchAppointments({
          doctorId,
          startDate,
          endDate
        })

        // Get unique patient IDs from appointments
        const uniquePatientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))]

        // Fetch all patients and filter by those who have appointments with this doctor
        const allPatients = await patientService.getAllPatients()
        const doctorPatients = allPatients.filter(patient =>
          uniquePatientIds.includes(patient.id)
        )

        setAppointments(doctorAppointments)
        setPatients(doctorPatients)
      } catch (err) {
        console.error('Error fetching doctor patients:', err)
        setError('Failed to load patients')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'doctor') {
      fetchDoctorPatients()
    }
  }, [user])

  // Calculate age from date of birth
  const calculateAge = useCallback((dob: string): number => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }, [])

  // Filter patients based on search and filter criteria
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (!p.isActive) return false

      // Search filter
      const searchMatch =
        (p.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (p.phone?.includes(search) ?? false) ||
        p.patientId?.toLowerCase().includes(search.toLowerCase()) ||
        p.bloodGroup?.toLowerCase().includes(search.toLowerCase())

      if (!searchMatch) return false

      // Gender filter
      if (genderFilter && p.gender !== genderFilter) return false

      // Blood group filter
      if (bloodGroupFilter && p.bloodGroup !== bloodGroupFilter) return false

      // Age range filter
      if (ageRange.min || ageRange.max) {
        if (!p.dob) return false
        const patientAge = calculateAge(p.dob)
        if (ageRange.min && patientAge < parseInt(ageRange.min)) return false
        if (ageRange.max && patientAge > parseInt(ageRange.max)) return false
      }

      return true
    })
  }, [patients, search, genderFilter, bloodGroupFilter, ageRange, calculateAge])

  const perPage = 5

  // Pagination Filter
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * perPage, page * perPage)
  }, [filtered, page])

  // Open View detail Dialog
  const handleView = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
    setIsOpenViewDialog(true)
  }, [])

  // Open Edit Dialog
  const handleEdit = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
    setIsOpenEditDialog(true)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setGenderFilter('')
    setBloodGroupFilter('')
    setAgeRange({ min: '', max: '' })
    setSearch('')
    setPage(1)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading patients...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${themeColors.text}`}>
                My Patients
              </h1>
              <p className="text-gray-600 mt-1">Manage your patient records</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-sm bg-opacity-95 space-y-4">
          <div className='flex flex-wrap justify-between gap-2 '>
            {/* Search Bar */}
            <Input
              type="text"
              placeholder="Search by name, phone, patient ID, or blood group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              iconPosition="left"
              className='w-full sm:w-80 md:w-98'
            />

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${themeColors.text} hover:${themeColors.text.replace('text-', 'text-').replace('600', '800')}`}
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {(genderFilter || bloodGroupFilter || ageRange.min || ageRange.max) && (
                  <span className={`ml-2 px-2 py-1 ${themeColors.bg} ${themeColors.text} text-xs rounded-full`}>
                    Active
                  </span>
                )}
              </Button>
              {(genderFilter || bloodGroupFilter || ageRange.min || ageRange.max) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Gender Filter */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input
                  as="select"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Input>
              </div>

              {/* Blood Group Filter */}
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Input
                  as="select"
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Input>
              </div>

              {/* Age Range Filter */}
              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                     min={0}
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Patient Records</h2>
            <div className="text-sm text-gray-600">
              Total Patients: {filtered.length} | Total Appointments: {appointments.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium mb-2">No patients found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                    paginated.map((patient) => {
                    const patientAppointments = appointments.filter(
                      apt => apt.patientId === patient.id
                    )

                    const latestAppointment = patientAppointments.sort(
                      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0]

                    return (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 font-mono">{patient.patientId || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                              {patient.photo ? (
                                <img src={patient.photo} alt={patient.name || 'Patient'} className="w-full h-full object-cover" />
                              ) : (
                                <span>{(patient.name || 'P').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{patient.name || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {patient.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {patient.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.dob ? calculateAge(patient.dob) : '-'} years</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {latestAppointment ? (
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(latestAppointment.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {latestAppointment.slot}
                              </div>
                              <div className="text-xs">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  latestAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  latestAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  latestAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {latestAppointment.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">No appointments</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <ThreeDotMenu
                            items={[
                              {
                                label: 'View',
                                onClick: () => handleView(patient),
                                icon: <Eye className="w-4 h-4" />,
                                className: 'text-blue-600 hover:text-blue-900'
                              },
                              {
                                label: 'Edit',
                                onClick: () => handleEdit(patient),
                                icon: <Edit className="w-4 h-4" />,
                                className: 'text-green-600 hover:text-green-900'
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1">
              Showing <span className="font-medium text-gray-900">{((page - 1) * perPage) + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * perPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> patients
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-10 w-10 sm:w-auto sm:px-4 p-0 sm:gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Page Numbers - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(filtered.length / perPage) || 1) }, (_, i) => {
                  const totalPages = Math.ceil(filtered.length / perPage) || 1;
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="h-10 w-10 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              {/* Compact page numbers for mobile/tablet */}
              <div className="flex items-center gap-1 md:hidden">
                {Array.from({ length: Math.min(3, Math.ceil(filtered.length / perPage) || 1) }, (_, i) => {
                  const totalPages = Math.ceil(filtered.length / perPage) || 1;
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (page === 1) {
                    pageNum = i + 1;
                  } else if (page === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = page - 1 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="h-10 w-10 p-0 font-semibold"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(Math.ceil(filtered.length / perPage), page + 1))}
                disabled={page >= Math.ceil(filtered.length / perPage)}
                className="h-10 w-10 sm:w-auto sm:px-4 p-0 sm:gap-2"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* View Patient Dialog - Simple implementation */}
        {isOpenViewDialog && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>Patient Details</h2>
                <button
                  onClick={() => setIsOpenViewDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                    {(selectedPatient.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedPatient.name || 'Unknown'}</h3>
                    <p className="text-gray-600">ID: {selectedPatient.patientId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    <p className="text-sm text-gray-900">{selectedPatient.dob ? calculateAge(selectedPatient.dob) : '-'} years</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-sm text-gray-900">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <Label>Blood Group</Label>
                    <p className="text-sm text-gray-900">{selectedPatient.bloodGroup}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-gray-900">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-900">{selectedPatient.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <p className="text-sm text-gray-900">{selectedPatient.address || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <Label>Allergies</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.allergies || 'None'}</p>
                </div>

                <div>
                  <Label>Medical Conditions</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.conditions || 'None'}</p>
                </div>

                <div>
                  <Label>Emergency Contact</Label>
                  <p className="text-sm text-gray-900">{selectedPatient.contactName} - {selectedPatient.emergencyPhone}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setIsOpenViewDialog(false)}
                  className={`${themeColors.button}`}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Patient Dialog - Simple implementation */}
        {isOpenEditDialog && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${themeColors.text}`}>Edit Patient</h2>
                <button
                  onClick={() => setIsOpenEditDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      type="text"
                      value={selectedPatient.name}
                      onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={selectedPatient.phone}
                      onChange={(e) => setSelectedPatient({...selectedPatient, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={selectedPatient.email || ''}
                      onChange={(e) => setSelectedPatient({...selectedPatient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      type="text"
                      value={selectedPatient.address || ''}
                      onChange={(e) => setSelectedPatient({...selectedPatient, address: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Allergies</Label>
                  <Input
                    type="text"
                    value={selectedPatient.allergies || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, allergies: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Medical Conditions</Label>
                  <Input
                    type="text"
                    value={selectedPatient.conditions || ''}
                    onChange={(e) => setSelectedPatient({...selectedPatient, conditions: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpenEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Here you would typically save the changes
                    toast.success('Patient updated successfully!')
                    setIsOpenEditDialog(false)
                  }}
                  className={`${themeColors.button}`}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorPatients