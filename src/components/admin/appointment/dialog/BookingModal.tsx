import React from 'react';
import { useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

// Import icons file
import { X, Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DatePicker from '@/components/ui/DatePicker';
import { Label } from '@/components/ui/Label';

// Import form controller, zod, and validation
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Import validation schema file
import { bookingSchema } from '@/validation-schema/appointmentSchema'

// Import Types files
import type { RootState } from "@/app/store";
import type { Appointment, RoleColors } from '@/types/appointment/appointmentType';
import type { LocalDoctor } from '@/types/doctors/doctorType'

// Import dispatch and selector for redux
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// Import Thunk file for redux
import { createAppointment, generateTimeSlots } from '@/features/appointment/appointmentThunk';
import { getAllPatients } from "@/features/patient/patientThunk";
import { fetchLocalDoctors } from '@/features/doctor/doctorThunk'
import { fetchDoctorSchedules } from '@/features/appointment/appointmentThunk';


type BookingFormData = z.infer<typeof bookingSchema>;

const BookingModal = React.memo(({ showBookingModal, closeBookingModel, roleColors }: {
  showBookingModal: boolean,
  closeBookingModel: () => void,
  roleColors?: RoleColors
}) => {

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Redux selectors
  const { availableSlots, loading, appointments } = useAppSelector((state: RootState) => state.appointments);
  const patients = useAppSelector((state: RootState) => state.patients.list);
  const { localDoctors } = useAppSelector((state: RootState) => state.doctors)

  // Control form
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

  // Check slot conflict
  const checkSlotConflict = useCallback((doctorId: string, date: string, slot: string) => {
    const existingAppointment = appointments.find(
      (apt: Appointment) => apt.doctorId === doctorId && apt.date === date && apt.slot === slot
    );
    return existingAppointment;
  }, [appointments]);

  // Watch form values
  const watchedDoctorId = watch('doctorId');
  const watchedDate = watch('date');
  const watchedSlot = watch('slot');
  const watchedDepartment = watch('department');

  //  Check timeSlot conflict
  const conflict = watchedDoctorId && watchedDate && watchedSlot
    ? checkSlotConflict(watchedDoctorId, watchedDate, watchedSlot)
    : null;

  // Use effect hook
  // Call fetchPatients and fetchDoctors
  useEffect(() => {
    dispatch(getAllPatients());
    dispatch(fetchLocalDoctors());
    dispatch(fetchDoctorSchedules());
  }, [dispatch]);

  useEffect(() => {
    if (watchedDoctorId && watchedDate) {
      const date = new Date(watchedDate);
      dispatch(generateTimeSlots({ doctorId: watchedDoctorId, date }));
    }
  }, [watchedDoctorId, watchedDate, dispatch]);

  // Methods
   // Create new appointment with toast
  const onSubmit = useCallback((data: BookingFormData) => {
    toast.promise(
      dispatch(createAppointment({
        ...data,
        status: 'scheduled',
      })),
      {
        loading: 'Creating appointment...',
        success: 'Appointment booked successfully!',
        error: 'Failed to book appointment. Please try again.',
      }
    ).then(() => {
      reset();
      closeBookingModel();
    });
  }, [dispatch, reset, closeBookingModel]);

  // Close model and reset form
  const handleCloseModal = useCallback(() => {
    reset();
    closeBookingModel();
  }, [reset, closeBookingModel]);


  //  Fetch departments list
  const departments = useMemo(() => {
    return [...new Set(localDoctors.map((doctor: LocalDoctor) => doctor.department))];
  }, [localDoctors]);

  // Fetch data departments wise doctor list
  const getDoctorsByDepartment = useCallback((department: string) => {
    return localDoctors.filter((doctor: LocalDoctor) => doctor.department === department);
  }, [localDoctors]);

  // Get role-based header class
  const getHeaderClass = () => {
    if (!roleColors) return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg';

    switch (roleColors.header) {
      case 'bg-purple-600':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg';
      case 'bg-blue-600':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg';
      case 'bg-green-600':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg';
      case 'bg-pink-600':
        return 'bg-gradient-to-r from-pink-600 to-pink-700 text-white p-6 rounded-t-lg';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg';
    }
  };

  // Get role-based button hover class
  const getButtonHoverClass = () => {
    if (!roleColors) return 'hover:bg-blue-500';

    switch (roleColors.header) {
      case 'bg-purple-600':
        return 'hover:bg-purple-500';
      case 'bg-blue-600':
        return 'hover:bg-blue-500';
      case 'bg-green-600':
        return 'hover:bg-green-500';
      case 'bg-pink-600':
        return 'hover:bg-pink-500';
      default:
        return 'hover:bg-blue-500';
    }
  };

  if (!showBookingModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={getHeaderClass()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Book New Appointment</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseModal}
              className={`text-white ${getButtonHoverClass()}`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Patient Selection */}
          <Controller
            name="patientId"
            control={control}
            render={({ field }) => (
              <Input
                as="select"
                label="Patient"
                required
                icon={User}
                error={errors.patientId}
                {...field}
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className='hover: cursor-pointer'>
                    {patient.name}
                  </option>
                ))}
              </Input>
            )}
          />

          {/* Department and Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Input
                  as="select"
                  label="Department"
                  required
                  error={errors.department}
                  {...field}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
                    field.onChange(e);
                    setValue('doctorId', '');
                  }}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Input>
              )}
            />

            <Controller
              name="doctorId"
              control={control}
              render={({ field }) => (
                <Input
                  as="select"
                  label="Doctor"
                  required
                  icon={Stethoscope}
                  error={errors.doctorId}
                  {...field}
                >
                  <option value="">Select a doctor</option>
                  {getDoctorsByDepartment(watchedDepartment).map((doctor: LocalDoctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                    </option>
                  ))}
                </Input>
              )}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label required>Date</Label>
                  <DatePicker
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Select appointment date"
                    className="w-full h-11"
                    disablePastDates={true}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.date.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Time Slot */}
            <Controller
              name="slot"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Input
                    as="select"
                    label="Time Slot"
                    required
                    icon={Clock}
                    error={errors.slot}
                    {...field}
                    disabled={!watchedDoctorId || !watchedDate || loading || availableSlots.length === 0}
                  >
                    <option value="">
                      {!watchedDoctorId ? 'Select doctor first' :
                      !watchedDate ? 'Select date first' :
                      loading ? 'Loading available slots...' :
                      availableSlots.length ? 'Select time slot' :
                      'No available slots for selected date'}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </Input>

                  {/* Conflict Alert */}
                  {conflict && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3">
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
                    <div className="bg-green-50 border-l-4 border-green-400 p-3">
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
              )}
            />
          </div>

          {/* Duration */}
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Input
                as="select"
                label="Duration (minutes)"
                required
                {...field}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => field.onChange(Number((e.target as HTMLSelectElement).value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </Input>
            )}
          />

          {/* Reason */}
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <Input
                as="textarea"
                label="Reason for Visit"
                required
                rows={3}
                placeholder="Describe the reason for the appointment..."
                error={errors.reason}
                {...field}
              />
            )}
          />

          {/* Notes */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Input
                as="textarea"
                label="Additional Notes"
                rows={2}
                placeholder="Any additional information..."
                {...field}
              />
            )}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
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
});

BookingModal.displayName = 'BookingModal';

export default BookingModal;
