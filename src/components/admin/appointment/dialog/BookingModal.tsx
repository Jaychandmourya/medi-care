import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createAppointment, generateTimeSlots, setShowBookingModal } from '@/features/appointment/appointmentSlice';
import { fetchPatients } from '@/features/appointment/appointmentSlice';
import { fetchDoctors } from '@/features/appointment/appointmentSlice';
import type { Appointment, Doctor, Patient } from '@/features/patient/db/dexie';

const bookingSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  department: z.string().min(1, 'Department is required'),
  date: z.string().min(1, 'Date is required'),
  slot: z.string().min(1, 'Time slot is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showBookingModal, doctors, patients, availableSlots, loading, appointments } = useAppSelector(
    (state) => state.appointments
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 30,
    },
  });

  const checkSlotConflict = (doctorId: string, date: string, slot: string) => {
    const existingAppointment = appointments.find(
      (apt: Appointment) => apt.doctorId === doctorId && apt.date === date && apt.slot === slot
    );
    return existingAppointment;
  };

  const watchedDoctorId = watch('doctorId');
  const watchedDate = watch('date');
  const watchedSlot = watch('slot');

  const conflict = watchedDoctorId && watchedDate && watchedSlot
    ? checkSlotConflict(watchedDoctorId, watchedDate, watchedSlot)
    : null;

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (watchedDoctorId && watchedDate) {
      const date = new Date(watchedDate);
      dispatch(generateTimeSlots({ doctorId: watchedDoctorId, date }));
    }
  }, [watchedDoctorId, watchedDate, dispatch]);

  const onSubmit = (data: BookingFormData) => {
    dispatch(createAppointment({
      ...data,
      status: 'scheduled',
    }));
    reset();
  };

  const handleClose = () => {
    dispatch(setShowBookingModal(false));
    reset();
  };

  const getDepartments = () => {
    const departments = [...new Set(doctors.map((doctor: Doctor) => doctor.department))];
    return departments;
  };

  const getDoctorsByDepartment = (department: string) => {
    return doctors.filter((doctor: Doctor) => doctor.department === department);
  };

  if (!showBookingModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Book New Appointment</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-blue-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <Label required>
              <User className="w-4 h-4 inline mr-2" />
              Patient
            </Label>
            <Controller
              name="patientId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient: Patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.patientId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.patientId.message}
              </p>
            )}
          </div>

          {/* Department and Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>
                Department
              </Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('doctorId', '');
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select department</option>
                    {getDepartments().map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <Label required>
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Doctor
              </Label>
              <Controller
                name="doctorId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a doctor</option>
                    {getDoctorsByDepartment(watch('department')).map((doctor: Doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.doctorId && (
                <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <Label required>
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Time Slot */}
            <div>
              <Label required>
                <Clock className="w-4 h-4 inline mr-2" />
                Time Slot
              </Label>
              <Controller
                name="slot"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={!watchedDoctorId || !watchedDate || availableSlots.length === 0}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!watchedDoctorId ? 'Select doctor first' :
                       !watchedDate ? 'Select date first' :
                       availableSlots.length ? 'Select time slot' :
                       'No available slots for selected date'}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.slot && (
                <p className="mt-1 text-sm text-red-600">{errors.slot.message}</p>
              )}

              {/* Conflict Alert */}
              {conflict && (
                <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-3">
                  <div className="flex">
                    <div className="shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        This time slot is already booked! Please select a different time.
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Existing appointment for Patient {conflict.patientId.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Available slots info */}
              {watchedDoctorId && watchedDate && availableSlots.length > 0 && (
                <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3">
                  <div className="flex">
                    <div className="shrink-0">
                      <Clock className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {availableSlots.length} time slots available
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label required>
              Duration (minutes)
            </Label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              )}
            />
          </div>

          {/* Reason */}
          <div>
            <Label required>
              Reason for Visit
            </Label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Describe the reason for the appointment..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>
              Additional Notes
            </Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={2}
                  placeholder="Any additional information..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Book Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
