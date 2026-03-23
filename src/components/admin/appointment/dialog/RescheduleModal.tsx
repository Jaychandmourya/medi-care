import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Reschedule Appointment</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-orange-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleReschedule)} className="p-6 space-y-6">
          {/* Current Appointment Info */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
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

          {/* Date */}
          <div>
            <Label required>
              <Calendar className="w-4 h-4 inline mr-2" />
              New Date
            </Label>
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
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Time Slot */}
          <div>
            <Label required>
              <Clock className="w-4 h-4 inline mr-2" />
              New Time Slot
            </Label>
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
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <div className="flex">
                <div className="shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
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
            <Label>
              Reason for Reschedule (Optional)
            </Label>
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
              disabled={loading || (watch('date') === selectedAppointment.date && watch('slot') === selectedAppointment.slot)}
            >
              Reschedule Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
