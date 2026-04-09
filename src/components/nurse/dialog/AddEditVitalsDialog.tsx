import { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

// Import icons file
import { X } from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Import Schema file
import { vitalsSchema } from '@/validation-schema/vitalsSchema'

// Import Types files
import type { Vitals, VitalsFormData, Patient } from '@/types/vitals/vitalsType';

// Import form, validation and zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import service
import { VitalsService } from '@/services/vitalsService';

// Type
type VitalsFormProps = {
  vitals?: Vitals;
  patients: Patient[];
  existingVitals?: Vitals[];
  onSubmit: (vitals: Vitals) => void;
  onCancel: () => void;
};

export const VitalsForm = ({ vitals, patients, existingVitals = [], onSubmit, onCancel }: VitalsFormProps) => {

  // State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isEditing = !!vitals;

  // Form control
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<VitalsFormData>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: vitals ? {
      patientId: vitals.patientId,
      bp: vitals.bp,
      pulse: vitals.pulse.toString(),
      temp: vitals.temp.toString(),
      spo2: vitals.spo2.toString()
    } : {}
  });

  // Memoize form submission handler to prevent recreation on every render
  const onFormSubmit = useCallback(async (data: VitalsFormData) => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditing, vitals, onSubmit, reset]);

  // Memoize available patients calculation to avoid filtering on every render
  const availablePatients = useMemo(() => {
    if (isEditing) return patients;
    return patients.filter(patient => !existingVitals.some(vital => vital.patientId === patient.id));
  }, [isEditing, patients, existingVitals]);

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Vitals' : 'Record New Vitals'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1"
              >
                {isEditing ? 'Update' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
