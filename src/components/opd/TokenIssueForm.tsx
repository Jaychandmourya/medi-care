import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// Import icons file
import { Plus, User, Building } from 'lucide-react'

// Import form control, validation and zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Import UI components
import { Button } from '@/components/common/Button'
import Input from '@/components/common/Input'

// Import Types files
import type { AppDispatch, RootState } from '@/app/store'

// Import Schema files
import { tokenSchema } from '@/schema/opdSchema'

// Import dispatch and selector for redux
import { useDispatch, useSelector } from 'react-redux'

// Import Thunk file for redux
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'

// Import Slice file for redux
import { issueToken } from '@/features/opd/opdSlice'



type TokenFormData = z.infer<typeof tokenSchema>

const TokenIssueForm = () => {

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Redux selector
  const { departments } = useSelector((state: RootState) => state.opd)
  const { localDoctors } = useSelector((state: RootState) => state.doctors)
  const { user } = useSelector((state: RootState) => state.auth)

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
      patientName: '',
      department: '',
      doctorId: ''
    }
  })

  // Variable
  const [busyDoctors, setBusyDoctors] = useState<Set<string>>(new Set())

  // Use effect state
  useEffect(() => {
    dispatch(fetchLocalDoctors())
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
  const setBusyFor30Seconds = (doctorId: string) => {
    // Add to busy sets
    setBusyDoctors(prev => new Set(prev).add(doctorId))

    // Remove after 30 seconds
    setTimeout(() => {
      setBusyDoctors(prev => {
        const newSet = new Set(prev)
        newSet.delete(doctorId)
        return newSet
      })
    }, 30000) // 30 seconds
  }

  // Form submit handler
  const onSubmit = (data: TokenFormData) => {
    const tokenData = {
      patientName: data.patientName,
      department: data.department,
      doctorId: data.doctorId
    }
    dispatch(issueToken(tokenData))
    toast.success('Token issued successfully!')

    // Set doctor as busy for 30 seconds
    setBusyFor30Seconds(data.doctorId)

    reset()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
      <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Issue New Token
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="patientName"
          label="Patient Name"
          icon={User}
          placeholder="Enter patient name"
          registration={register('patientName')}
          error={errors.patientName}
          required
        />

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

    </div>
  )
}

export default TokenIssueForm
