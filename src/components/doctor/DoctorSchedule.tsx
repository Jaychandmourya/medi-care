import { useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/common/Button'

import { type AppDispatch } from '@/app/store'
import { type DoctorSchedule } from '@/features/db/dexie'
import { doctorScheduleSchema, type DoctorScheduleFormData, DAYS_OF_WEEK, SLOT_DURATIONS, TIME_SLOTS } from '@/features/doctorSchedule/doctorScheduleValidation'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useDispatch } from 'react-redux'

import { addDoctorSchedule, updateDoctorSchedule } from '@/features/doctorSchedule/doctorScheduleSlice'

// Interface
interface DoctorScheduleProps {
  lastAddedDoctor: any
  doctors: any[]
  addingSchedule: boolean
  setAddingSchedule: (value: boolean) => void
  onNavigateToAddDoctor?: () => void
  onBeforeScheduleSave?: () => Promise<string | null>
  existingSchedule?: DoctorSchedule | null
  isNewDoctor?: boolean
}

export function DoctorSchedule({
  lastAddedDoctor,
  doctors,
  addingSchedule,
  setAddingSchedule,
  onNavigateToAddDoctor,
  onBeforeScheduleSave,
  existingSchedule,
  isNewDoctor = false
}: DoctorScheduleProps) {

  // Redux dispatch
  const dispatch = useDispatch<AppDispatch>()

  // Use ref to track isNewDoctor to avoid stale closure issues
  const isNewDoctorRef = useRef(isNewDoctor)
  useEffect(() => {
    isNewDoctorRef.current = isNewDoctor
  }, [isNewDoctor])

  // Form control
  const {
    register: registerSchedule,
    handleSubmit: handleScheduleSubmit,
    formState: { errors: scheduleErrors },
    setValue: setScheduleValue,
    watch: watchSchedule,
    reset: resetSchedule
  } = useForm<DoctorScheduleFormData>({
    resolver: zodResolver(doctorScheduleSchema),
    defaultValues: {
      workingDays: [1, 2, 3, 4, 5], // Default to Monday-Friday
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: '30'
    }
  })

  const watchedScheduleValues = watchSchedule()

  // useEffect
  // Set doctorId when doctor data is available
  useEffect(() => {
    const doctorId = lastAddedDoctor ? lastAddedDoctor.id : doctors.length > 0 ? doctors[0].id : ''
    if (doctorId) {
      setScheduleValue('doctorId', doctorId)
    }
  }, [lastAddedDoctor, doctors, setScheduleValue])

  // Populate form with existing schedule data
  useEffect(() => {
    if (existingSchedule) {
      setScheduleValue('workingDays', existingSchedule.workingDays)
      setScheduleValue('startTime', existingSchedule.startTime)
      setScheduleValue('endTime', existingSchedule.endTime)
      setScheduleValue('slotDuration', existingSchedule.slotDuration.toString() as '15' | '20' | '30')
      setScheduleValue('lunchBreakStart', existingSchedule.lunchBreakStart || '')
      setScheduleValue('lunchBreakEnd', existingSchedule.lunchBreakEnd || '')
    }
  }, [existingSchedule, setScheduleValue])

  // Methods
  const handleAddSchedule = useCallback(async (data: DoctorScheduleFormData) => {
    setAddingSchedule(true)
    try {
      let doctorId = data.doctorId

      // If this is a new doctor, save doctor first to get the real ID
      // Use ref to check latest value to avoid stale closure
      if (isNewDoctorRef.current && onBeforeScheduleSave) {
        const newDoctorId = await onBeforeScheduleSave()
        if (!newDoctorId) {
          toast.error('Failed to save doctor. Cannot create schedule.')
          setAddingSchedule(false)
          return
        }
        doctorId = newDoctorId
      }

      if (existingSchedule) {
        // Update existing schedule
        await dispatch(updateDoctorSchedule({
          id: existingSchedule.id,
          updates: {
            workingDays: data.workingDays,
            startTime: data.startTime,
            endTime: data.endTime,
            slotDuration: parseInt(data.slotDuration) as 15 | 20 | 30,
            lunchBreakStart: data.lunchBreakStart,
            lunchBreakEnd: data.lunchBreakEnd,
            updatedAt: new Date().toISOString()
          }
        })).unwrap()
        toast.success('Doctor schedule updated successfully!')
      } else {
        await dispatch(addDoctorSchedule({
          doctorId: doctorId,
          workingDays: data.workingDays,
          startTime: data.startTime,
          endTime: data.endTime,
          slotDuration: parseInt(data.slotDuration) as 15 | 20 | 30,
          lunchBreakStart: data.lunchBreakStart,
          lunchBreakEnd: data.lunchBreakEnd
        })).unwrap()
        toast.success('Doctor and schedule saved successfully!')
      }

      resetSchedule()

      // Clear all temporary session storage data when setup is complete
      sessionStorage.removeItem('doctorFormData')
      sessionStorage.removeItem('currentDoctorData')
      sessionStorage.removeItem('doctorAdded')

      // Clear current doctor data from parent component

      // Navigate back to Add Doctor step
      if (onNavigateToAddDoctor) {
        onNavigateToAddDoctor()
      }
    } catch (error) {
      console.error('Schedule update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to ${existingSchedule ? 'update' : 'add'} doctor schedule: ${errorMessage}`)
    } finally {
      setAddingSchedule(false)
    }
  }, [dispatch, resetSchedule, setAddingSchedule, onNavigateToAddDoctor, onBeforeScheduleSave, existingSchedule])

  const handleWorkingDayChange = useCallback((dayValue: number, checked: boolean) => {
    const currentDays = watchedScheduleValues.workingDays || []
    if (checked) {
      const newDays = [...currentDays, dayValue]
      setScheduleValue('workingDays', newDays)
    } else {
      const newDays = currentDays.filter(day => day !== dayValue)
      setScheduleValue('workingDays', newDays)
    }
  }, [watchedScheduleValues.workingDays, setScheduleValue])

  const onSubmitError = (errors: any) => {
    console.error('Form validation errors:', errors)
    toast.error('Please fix form errors before submitting')
  }

  return (
    <form onSubmit={handleScheduleSubmit(handleAddSchedule, onSubmitError)}>
      <div className="space-y-8">
        {/* Schedule Status Header */}
        {existingSchedule && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-lg font-semibold text-blue-800">Editing Existing Schedule</h3>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Mode: Edit</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Update the doctor's current working schedule below</p>
          </div>
        )}

        {!existingSchedule && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">Create New Schedule</h3>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Mode: Add</span>
            </div>
            <p className="text-sm text-green-700 mt-1">Set up the doctor's working schedule for the first time</p>
          </div>
        )}

        {/* Doctor Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Current Doctor Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                value={lastAddedDoctor ? `Dr. ${lastAddedDoctor.firstName} ${lastAddedDoctor.lastName}` :
                      doctors.length > 0 ? `Dr. ${doctors[0].firstName} ${doctors[0].lastName}` : 'No doctor available'}
                disabled
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium shadow-sm cursor-not-allowed"
                placeholder="Doctor name will appear here"
              />
              <input
                type="hidden"
                {...registerSchedule('doctorId')}
                value={lastAddedDoctor ? lastAddedDoctor.id : doctors.length > 0 ? doctors[0].id : ''}
                onChange={(e) => {
                  setScheduleValue('doctorId', e.target.value)
                }}
              />
              {scheduleErrors.doctorId && (
                <p className="mt-1 text-sm text-red-600">{scheduleErrors.doctorId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                value={lastAddedDoctor ? lastAddedDoctor.specialty || lastAddedDoctor.department || 'General Practice' :
                      doctors.length > 0 ? doctors[0].specialty || doctors[0].department || 'General Practice' : 'No specialization'}
                disabled
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium shadow-sm cursor-not-allowed"
                placeholder="Specialization will appear here"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Information
              </label>
              <input
                type="text"
                value={lastAddedDoctor ? lastAddedDoctor.contact || lastAddedDoctor.email || 'No contact info' :
                      doctors.length > 0 ? doctors[0].contact || doctors[0].email || 'No contact info' : 'No contact info'}
                disabled
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium shadow-sm cursor-not-allowed"
                placeholder="Contact information will appear here"
              />
            </div>
          </div>
          {lastAddedDoctor && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200 flex justify-between items-center">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">NPI:</span> {lastAddedDoctor.npi} |
                <span className="font-semibold ml-2">Department:</span> {lastAddedDoctor.department} |
                <span className="font-semibold ml-2">Status:</span> <span className="text-green-700 font-medium">{lastAddedDoctor.status || 'Active'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Working Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                id="startTime"
                {...registerSchedule('startTime')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
              >
                <option value="">Select start time</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {scheduleErrors.startTime && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {scheduleErrors.startTime.message}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                id="endTime"
                {...registerSchedule('endTime')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
              >
                <option value="">Select end time</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {scheduleErrors.endTime && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {scheduleErrors.endTime.message}
                </p>
              )}
            </div>

            {/* Slot Duration */}
            <div className="space-y-2">
              <label htmlFor="slotDuration" className="block text-sm font-medium text-gray-700">
                Slot Duration <span className="text-red-500">*</span>
              </label>
              <select
                id="slotDuration"
                {...registerSchedule('slotDuration')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
              >
                {SLOT_DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
              {scheduleErrors.slotDuration && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {scheduleErrors.slotDuration.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Lunch Break */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Lunch Break (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lunch Break Start */}
            <div className="space-y-2">
              <label htmlFor="lunchBreakStart" className="block text-sm font-medium text-gray-700">
                Lunch Start
              </label>
              <select
                id="lunchBreakStart"
                {...registerSchedule('lunchBreakStart')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
              >
                <option value="">Select lunch start</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {scheduleErrors.lunchBreakStart && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {scheduleErrors.lunchBreakStart.message}
                </p>
              )}
            </div>

            {/* Lunch Break End */}
            <div className="space-y-2">
              <label htmlFor="lunchBreakEnd" className="block text-sm font-medium text-gray-700">
                Lunch End
              </label>
              <select
                id="lunchBreakEnd"
                {...registerSchedule('lunchBreakEnd')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
              >
                <option value="">Select lunch end</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {scheduleErrors.lunchBreakEnd && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {scheduleErrors.lunchBreakEnd.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Working Days <span className="text-red-500">*</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isChecked = watchedScheduleValues.workingDays?.includes(day.value) || false
              return (
                <label
                  key={day.value}
                  className="relative flex items-center justify-center p-3 bg-white border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      handleWorkingDayChange(day.value, e.target.checked)
                    }}
                    className="sr-only peer"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-200 ${
                      isChecked ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {day.label.slice(0, 3)}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
          {scheduleErrors.workingDays && (
            <p className="mt-3 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {scheduleErrors.workingDays.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap w-full justify-end gap-3 pt-8">
        <Button
          type="submit"
          variant="outline"
          loading={addingSchedule}
          disabled={addingSchedule}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 hover:from-green-700 hover:to-emerald-700 shadow-lg"
        >
          {addingSchedule ? (existingSchedule ? 'Updating...' : 'Adding Schedule...') : (existingSchedule ? 'Update' : 'Complete Setup')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => resetSchedule()}
          className="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Clear Schedule
        </Button>
      </div>
    </form>
  )
}