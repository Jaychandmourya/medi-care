import { useEffect, lazy, Suspense, memo } from 'react'

// Import icons file
import { Search, Database } from 'lucide-react'

// Import Types files
import { type AppDispatch, type RootState } from '@/app/store'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Slice file for redux
import { setActiveTab, clearError } from '@/features/doctor/doctorSlice'
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'

const DoctorSearch = lazy(() => import('@/components/doctor/DoctorSearch'))
const InternalDoctorList = lazy(() => import('@/components/doctor/InternalDoctorList'))

const AdminDoctorsComponent = () => {
  const dispatch = useDispatch<AppDispatch>()
  // Memoized selector to prevent unnecessary re-renders
  const { localDoctors, activeTab } = useSelector((state: RootState) => state.doctors)

  useEffect(() => {
    dispatch(clearError())
    dispatch(fetchLocalDoctors())
  }, [dispatch])

  return (
    <div className="bg-gray-50 rounded-md">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Directory
          </h1>
          <p className="text-gray-600">
            Search real US doctors from the NPI Registry and manage your internal doctor database
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => dispatch(setActiveTab('search'))}
              className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search NPI Registry
              </div>
            </button>
            <button
              onClick={() => dispatch(setActiveTab('internal'))}
              className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm transition-colors ${
                activeTab === 'internal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Internal Doctors ({localDoctors.length})
              </div>
            </button>
          </nav>
        </div>

        {/* Quick Autocomplete Search */}

         {/* Content */}
        {activeTab === 'search' ? (
          <Suspense fallback={<div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
            <DoctorSearch />
          </Suspense>
        ) : (
          <Suspense fallback={<div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
            <InternalDoctorList />
          </Suspense>
        )}


      </div>
    </div>
  )
}

// Memoize the entire component to prevent unnecessary re-renders
const AdminDoctors = memo(AdminDoctorsComponent)

export default AdminDoctors