import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { issueToken } from '@/features/opd/opdSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { Plus, User, Stethoscope, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'

const TokenIssueForm = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { departments, doctors } = useSelector((state: RootState) => state.opd)

  const [formData, setFormData] = useState({
    patientName: '',
    department: '',
    doctorId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.patientName && formData.department && formData.doctorId) {
      dispatch(issueToken(formData))
      setFormData({ patientName: '', department: '', doctorId: '' })
    }
  }

  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department }))
    // Auto-select first doctor for department
    const deptDoctors = Object.entries(doctors).filter(([, name]) =>
      name.includes(department.split(' ')[0])
    )
    if (deptDoctors.length > 0) {
      setFormData(prev => ({ ...prev, doctorId: deptDoctors[0][0] }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Issue New Token
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient name"
              required
            />
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={formData.department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor
          </Label>
          <div className="relative">
            <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="">Select doctor</option>
              {Object.entries(doctors).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Issue Token
        </Button>
      </form>
    </div>
  )
}

export default TokenIssueForm
