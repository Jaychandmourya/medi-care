import { useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { RootState } from "@/app/store";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Label } from '@/components/common/Label';
import FormDatePicker from '@/components/common/FormDatePicker';
import FormField from '@/components/common/FormField';
import GenericDialog from '@/components/common/dialog/GenericDialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateAppointment, generateTimeSlots } from '@/features/appointment/appointmentThunk';
import { rescheduleSchema } from '@/schema/appointmentSchema'


type RescheduleFormData = z.infer<typeof rescheduleSchema>;

const RescheduleModal = ({ showRescheduleModal, closeRescheduleModal }: { showRescheduleModal: boolean, closeRescheduleModal: () => void }) => {
  // Redux dispatch
  const dispatch = useAppDispatch();

  //  Redux selectors
  const { selectedAppointment, appointments, availableSlots, loading } = useAppSelector((state: RootState) => state.appointments);
  const { localDoctors } = useAppSelector((state: RootState) => state.doctors)
  // Form control
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

  // Watch form values
  const watchedDoctorId = useMemo(() => selectedAppointment?.doctorId, [selectedAppointment?.doctorId]);
  const watchedDate = watch('date');

  // Set initial values when modal opens
  useEffect(() => {
    if (selectedAppointment) {
      setValue('date', selectedAppointment.date);
      setValue('slot', selectedAppointment.slot);
    }
  }, [selectedAppointment, setValue, showRescheduleModal]);

  // Generate time slots when doctor and date are selected
  useEffect(() => {
    if (watchedDoctorId && watchedDate) {
      const date = new Date(watchedDate);
      dispatch(generateTimeSlots({ doctorId: watchedDoctorId, date }));
    }
  }, [watchedDoctorId, watchedDate, dispatch]);

  // Update appointment
  const handleReschedule = useCallback((data: RescheduleFormData) => {
    if (selectedAppointment) {
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

      toast.success('Appointment rescheduled successfully!');
      closeRescheduleModal()
      reset();
    }
  }, [selectedAppointment, appointments, dispatch, closeRescheduleModal, reset]);

  // Close model
  const handleClose = useCallback(() => {
    closeRescheduleModal()
    reset()
  }, [closeRescheduleModal, reset]);

  // Check for conflicts
  const checkConflict = useCallback((slot: string) => {
    if (!selectedAppointment || !watchedDate) return false;

    const conflict = appointments.find(
      apt => apt.id !== selectedAppointment.id &&
              apt.doctorId === selectedAppointment.doctorId &&
              apt.date === watchedDate &&
              apt.slot === slot
    );

    return !!conflict;
  }, [selectedAppointment, watchedDate, appointments]);

  // Check if the selected time slot is the same as the current appointment
  const isSameTimeSlot = useMemo(() => {
    const watchedDateValue = watch('date');
    const watchedSlotValue = watch('slot');
    return watchedDateValue === selectedAppointment?.date && watchedSlotValue === selectedAppointment?.slot;
  }, [watch, selectedAppointment?.date, selectedAppointment?.slot]);

  // Find the doctor for the selected appointment
  const doctor = useMemo(() => localDoctors.find(d => d.id === selectedAppointment?.doctorId), [localDoctors, selectedAppointment?.doctorId]);

  // Generate time slot options
  const timeSlotOptions = useMemo(() => {
    return availableSlots.map((slot) => {
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
    });
  }, [availableSlots, checkConflict]);

  // Custom header with orange accent
  const customHeader = (
    <div className="flex items-center space-x-3">
      <Calendar className="w-6 h-6 text-orange-600" />
      <h2 className="text-xl font-semibold text-orange-600">Reschedule Appointment</h2>
    </div>
  );

  if (!showRescheduleModal || !selectedAppointment) return null;

  return (
    <GenericDialog
      isOpen={showRescheduleModal}
      onClose={handleClose}
      header={customHeader}
      showDefaultButtons={true}
      cancelButtonText="Cancel"
      saveButtonText="Reschedule"
      onCancel={handleClose}
      onSave={handleSubmit(handleReschedule)}
      saveButtonLoading={loading}
      saveButtonDisabled={loading}
      maxWidth="max-w-lg"
      maxHeight="max-h-[90vh]"
      dialogClass="rounded-lg shadow-xl"
      containerClass=""
      backdropClass="bg-black/60 backdrop-blur-sm"
    >

      <div className="space-y-6">
        {/* Current appointment info */}
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
              <FormDatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select new date"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2"
                disablePastDates={true}
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
              <FormField
                {...field}
                as="select"
                disabled={!availableSlots.length}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 disabled:bg-gray-100"
              >
                <option value="">
                  {availableSlots.length ? 'Select a time slot' : 'Select a date first'}
                </option>
                {timeSlotOptions}
              </FormField>
            )}
          />
          {errors.slot && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.slot.message}
            </p>
          )}
        </div>

        {/* Reason for reschedule */}
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
                placeholder="Please provide a reason for rescheduling..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            )}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.reason.message}
            </p>
          )}
        </div>

        {/* Warning message */}
        {isSameTimeSlot && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No changes detected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  You have selected the same date and time as the current appointment. Please select a different time slot to reschedule.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GenericDialog>
  );
};

export default RescheduleModal;
