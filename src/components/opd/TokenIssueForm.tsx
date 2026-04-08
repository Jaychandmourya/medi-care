import { useEffect, useState, lazy, Suspense } from 'react'
import toast from 'react-hot-toast'

// Import icons file
import { Plus, User, Building } from 'lucide-react'

// Import form control, validation and zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Import UI components
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// Import Types files
import type { AppDispatch, RootState } from '@/app/store'

// Import Schema files
import { tokenSchema } from '@/validation-schema/opdSchema'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Thunk file for redux
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'
import { getAllPatients } from '@/features/patient/patientThunk'

// Import Slice file for redux
import { issueToken } from '@/features/opd/opdSlice'

// Lazy load the component
const AddEditPatientDialog = lazy(() => import('@/components/admin/patient/dialog/AddEditPatientDialog'))


type TokenFormData = z.infer<typeof tokenSchema>

const TokenIssueForm = () => {

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Redux selector
  const { departments } = useSelector((state: RootState) => state.opd)
   const { localDoctors } = useSelector((state: RootState) => state.doctors)
  const { user } = useSelector((state: RootState) => state.auth)
  const { list: patients } = useSelector((state: RootState) => state.patients)

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      patientId: '',
      department: '',
      doctorId: ''
    }
  })

  // Variable
  const [showPatientDialog, setShowPatientDialog] = useState<boolean>(false)
  const [busyPatients, setBusyPatients] = useState<Set<string>>(new Set())
  const [busyDoctors, setBusyDoctors] = useState<Set<string>>(new Set())

  // Use effect state
  useEffect(() => {
    dispatch(fetchLocalDoctors())
    dispatch(getAllPatients())
  }, [dispatch])

  // Methods
  // Department change handler
  const handleDepartmentChange = (department: string) => {
    setValue('department', department)
    const deptDoctors = localDoctors.filter(doctor =>
      doctor.department.includes(department.split(' ')[0]) && doctor.id
    )
    if (deptDoctors.length > 0 && deptDoctors[0].id) {
      setValue('doctorId', deptDoctors[0].id)
    }
  }

  // Function to set busy state for 30 seconds
  const setBusyFor30Seconds = (patientId: string, doctorId: string) => {
    // Add to busy sets
    setBusyPatients(prev => new Set(prev).add(patientId))
    setBusyDoctors(prev => new Set(prev).add(doctorId))

    // Remove after 30 seconds
    setTimeout(() => {
      setBusyPatients(prev => {
        const newSet = new Set(prev)
        newSet.delete(patientId)
        return newSet
      })
      setBusyDoctors(prev => {
        const newSet = new Set(prev)
        newSet.delete(doctorId)
        return newSet
      })
    }, 30000) // 30 seconds
  }

  // Form submit handler
  const onSubmit = (data: TokenFormData) => {
    const selectedPatient = patients.find(p => p.id === data.patientId)
    const tokenData = {
      patientId: data.patientId,
      patientName: selectedPatient?.name,
      department: data.department,
      doctorId: data.doctorId
    }
    dispatch(issueToken(tokenData))
    toast.success('Token issued successfully!')

    // Set patient and doctor as busy for 30 seconds
    setBusyFor30Seconds(data.patientId, data.doctorId)

    reset()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Issue New Token
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className='flex justify-between items-center'>
            <label htmlFor="patientId" className="inline-flex items-center font-medium text-sm text-gray-700">
              Patient
              <span className="ml-1 text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPatientDialog(true)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </div>
          <div className="relative">
            <select
              id="patientId"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 shadow-sm appearance-none cursor-pointer hover:border-gray-400"
              {...register('patientId')}
            >
              <option value="">Select patient</option>
              {patients.filter(patient => patient.id && !busyPatients.has(patient.id)).map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.patientId && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.patientId.message}
            </p>
          )}
        </div>

        <Input
          id="department"
          as="select"
          label="Department"
          icon={Building}
          value={watch('department')}
          onChange={(e) => handleDepartmentChange(e.target.value)}
          error={errors.department}
          required
        >
          <option value="">Select department</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </Input>

        <Input
          id="doctorId"
          as="select"
          label="Doctor"
          icon={User}
          value={watch('doctorId')}
          onChange={(e) => setValue('doctorId', e.target.value)}
          error={errors.doctorId}
          required
        >
          <option value="">Select doctor</option>
          {localDoctors.filter(doctor => doctor.id && !busyDoctors.has(doctor.id)).map((doctor) => {
            return (
              <option key={doctor.id} value={doctor.id}>
                {`${doctor.firstName} ${doctor.lastName}`} - { doctor.department}
              </option>
            )
          })}
        </Input>

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2"
          customColor={user?.role === 'receptionist' ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg transform hover:scale-105 focus:ring-purple-500' : undefined}
        >
          <Plus className="w-4 h-4" />
          Issue Token
        </Button>
      </form>

      {/* Add Patient Dialog */}
      <Suspense fallback={<div className="flex items-center justify-center p-4">Loading...</div>}>
        <AddEditPatientDialog
          isOpen={showPatientDialog}
          onClose={() => {
            setShowPatientDialog(false)
            dispatch(getAllPatients())
          }}
        />
      </Suspense>
    </div>
  )
}

export default TokenIssueForm
