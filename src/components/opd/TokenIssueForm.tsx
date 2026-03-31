import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { issueToken } from '@/features/opd/opdSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { Plus, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { tokenSchema } from '@/validation-schema/opdSchema'
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'
import { useEffect } from 'react'

type TokenFormData = z.infer<typeof tokenSchema>

const TokenIssueForm = () => {
  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Redux selector
  const { departments, doctors } = useSelector((state: RootState) => state.opd)
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

  // Fetch doctors on component mount
  useEffect(() => {
    dispatch(fetchLocalDoctors())
  }, [dispatch])

  // Department change handler
  const handleDepartmentChange = (department: string) => {
    setValue('department', department)
    const deptDoctors = Object.entries(doctors).filter(([, name]) =>
      name.includes(department.split(' ')[0])
    )
    if (deptDoctors.length > 0) {
      setValue('doctorId', deptDoctors[0][0])
    }
  }

  // Form submit handler
  const onSubmit = (data: TokenFormData) => {
    dispatch(issueToken(data))
    toast.success('Token issued successfully!')
    reset()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Issue New Token
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="patientName"
          type="text"
          label="Patient Name"
          placeholder="Enter patient name"
          icon={User}
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
          {Object.entries(doctors).map(([id, name]) => {
            const doctorName = name.split(' - ')[0]
            const department = name.split(' - ')[1]
            return (
              <option key={id} value={id}>
                {doctorName} - {department}
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
