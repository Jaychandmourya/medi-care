import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateAppointment, generateTimeSlots, setShowRescheduleModal } from '@/features/appointment/appointmentSlice';

const rescheduleSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  slot: z.string().min(1, 'Time slot is required'),
  reason: z.string().optional(),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

const RescheduleModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showRescheduleModal, selectedAppointment, appointments, doctors, availableSlots, loading } = useAppSelector(
    (state) => state.appointments
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
  });

  const watchedDoctorId = selectedAppointment?.doctorId;
  const watchedDate = watch('date');

  useEffect(() => {
    if (selectedAppointment) {
      setValue('date', selectedAppointment.date);
      setValue('slot', selectedAppointment.slot);
    }
  }, [selectedAppointment, setValue]);

  useEffect(() => {
    if (watchedDoctorId && watchedDate) {
      const date = new Date(watchedDate);
      dispatch(generateTimeSlots({ doctorId: watchedDoctorId, date }));
    }
  }, [watchedDoctorId, watchedDate, dispatch]);

  const handleReschedule = (data: RescheduleFormData) => {
    if (selectedAppointment) {
      // Check for conflicts
      const conflict = appointments.find(
        apt => apt.id !== selectedAppointment.id &&
                apt.doctorId === selectedAppointment.doctorId &&
                apt.date === data.date &&
                apt.slot === data.slot
      );

      if (conflict) {
        alert('This time slot is already booked. Please select a different time.');
        return;
      }

      const updatedNotes = data.reason
        ? `Rescheduled: ${data.reason}. ${selectedAppointment.notes || ''}`
        : selectedAppointment.notes;

      dispatch(updateAppointment({
        id: selectedAppointment.id,
        updates: {
          date: data.date,
          slot: data.slot,
          notes: updatedNotes,
        }
      }));

      dispatch(setShowRescheduleModal(false));
      reset();
    }
  };

  const handleClose = () => {
    dispatch(setShowRescheduleModal(false));
  };

  const checkConflict = (slot: string) => {
    if (!selectedAppointment || !watchedDate) return false;

    // Check for actual conflicts with other appointments
    const conflict = appointments.find(
      apt => apt.id !== selectedAppointment.id &&
              apt.doctorId === selectedAppointment.doctorId &&
              apt.date === watchedDate &&
              apt.slot === slot
    );

    return !!conflict;
  };

  if (!showRescheduleModal || !selectedAppointment) return null;

  const doctor = doctors.find(d => d.id === selectedAppointment.doctorId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Reschedule Appointment</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-orange-500 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Appointment Info */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 m-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Current Appointment
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>Date: {selectedAppointment.date}</p>
                <p>Time: {selectedAppointment.slot}</p>
                <p>Doctor: {doctor ? `Dr. ${doctor.name}` : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleReschedule)} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date *
            </label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              )}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              New Time Slot *
            </label>
            <Controller
              name="slot"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!availableSlots.length}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {availableSlots.length ? 'Select time slot' : 'Select date first'}
                  </option>
                  {availableSlots.map((slot) => {
                    const hasConflict = checkConflict(slot);
                    return (
                      <option
                        key={slot}
                        value={slot}
                        disabled={hasConflict}
                      >
                        {slot} {hasConflict ? '(Current Slot)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            />
            {errors.slot && (
              <p className="mt-1 text-sm text-red-600">{errors.slot.message}</p>
            )}
          </div>

          {/* Conflict Warning */}
          {watch('date') === selectedAppointment.date && watch('slot') === selectedAppointment.slot && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This is the same as the current appointment time. Please select a different time to reschedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason for Reschedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reschedule (Optional)
            </label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Reason for rescheduling..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (watch('date') === selectedAppointment.date && watch('slot') === selectedAppointment.slot)}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Rescheduling...' : 'Reschedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
