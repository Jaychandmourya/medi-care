import { useMemo, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

// Import UI components
import Input from '@/components/common/Input';
import FormDialog from '@/components/common/dialog/FormDialog';

// Import Schema file
import { vitalsSchema } from '@/schema/vitalsSchema'

// Import Types files
import type { Vitals, VitalsFormData, Patient } from '@/types/vitals/vitalsType';

// Import form, validation and zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import service
import { VitalsService } from '@/services/vitalsService';

// Type
type VitalsFormProps = {
  isOpen: boolean;
  vitals?: Vitals;
  patients: Patient[];
  existingVitals?: Vitals[];
  onSubmit: (vitals: Vitals) => void;
  onClose: () => void;
};

export const VitalsForm = ({ isOpen, vitals, patients, existingVitals = [], onSubmit, onClose }: VitalsFormProps) => {

  const isEditing = !!vitals;
  const formRef = useRef<HTMLFormElement>(null);

  // Form control
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<VitalsFormData>({
    resolver: zodResolver(vitalsSchema),
    mode: 'onChange',
    defaultValues: {
      patientId: '',
      bp: '',
      pulse: '',
      temp: '',
      spo2: ''
    }
  });

  // Reset form when dialog opens/closes or vitals changes
  useEffect(() => {
    if (isOpen) {
      if (vitals) {
        reset({
          patientId: vitals.patientId,
          bp: vitals.bp,
          pulse: vitals.pulse.toString(),
          temp: vitals.temp.toString(),
          spo2: vitals.spo2.toString()
        });
      } else {
        reset({
          patientId: '',
          bp: '',
          pulse: '',
          temp: '',
          spo2: ''
        });
      }
    }
  }, [isOpen, vitals, reset]);

  // Memoize form submission handler to prevent recreation on every render
  const onFormSubmit = useCallback(async (data: VitalsFormData) => {
    try {
      let result: Vitals;
      if (isEditing) {
        result = await VitalsService.updateVitals(vitals!.id, data);
        toast.success('Vitals updated successfully');
      } else {
        result = await VitalsService.addVitals(data);
        toast.success('Vitals recorded successfully');
      }
      onSubmit(result);
      reset();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update vitals' : 'Failed to record vitals');
      console.error(error);
    }
  }, [isEditing, vitals, onSubmit, reset]);

  // Handle save via FormDialog's save button
  const handleSave = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  // Memoize available patients calculation to avoid filtering on every render
  const availablePatients = useMemo(() => {
    if (isEditing) return patients;
    return patients.filter(patient => !existingVitals.some(vital => vital.patientId === patient.id));
  }, [isEditing, patients, existingVitals]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Vitals' : 'Record New Vitals'}
      maxWidth="max-w-md"
      cancelButtonText="Cancel"
      saveButtonText={isEditing ? 'Update' : 'Save'}
      saveButtonLoading={isSubmitting}
      saveButtonDisabled={isSubmitting}
      onCancel={onClose}
      onSave={handleSave}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit(onFormSubmit)}
        className="space-y-4"
      >
        <Input
          id="patientId"
          label="Patient"
          as="select"
          registration={register('patientId')}
          error={errors.patientId}
          disabled={isEditing || patients.length === 0}
          required
          className={isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
        >
          <option value="">
            {patients.length === 0 ? 'No patients available' : 'Select a patient'}
          </option>
          {availablePatients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} - Age: {patient.age} - {patient.gender} - Bed: {patient.bedNumber}
            </option>
          ))}
        </Input>
        {!isEditing && availablePatients.length === 0 && patients.length > 0 && (
          <p className="text-sm text-amber-600 mt-1">
            <strong>Note:</strong> All patients already have vitals recorded. Edit existing records to update vitals.
          </p>
        )}
        {isEditing && (
          <p className="text-sm text-amber-600 mt-1">
            <strong>Note:</strong> Patient cannot be changed when editing existing vitals record.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="bp"
            label="Blood Pressure"
            placeholder="120/80"
            registration={register('bp')}
            error={errors.bp}
            required
          />

          <Input
            id="pulse"
            label="Pulse (bpm)"
            placeholder="72"
            type="number"
            registration={register('pulse')}
            error={errors.pulse}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="temp"
            label="Temperature (°F)"
            placeholder="98.6"
            step="0.1"
            registration={register('temp')}
            error={errors.temp}
            required
          />

          <Input
            id="spo2"
            label="SpO2 (%)"
            placeholder="98"
            type="number"
            min="1"
            max="100"
            registration={register('spo2')}
            error={errors.spo2}
            required
          />
        </div>
      </form>
    </FormDialog>
  );
};
