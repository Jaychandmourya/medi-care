import { useState, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast"


// Import form, validation and zod files
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import validation schemas files
import { patientSchema, stepSchemas, type PatientFormData } from "@/schema/patientValidation";

// Import Types file
import type { Patient } from "@/types/patients/patientType";

// Import utils file
import { getRoleColors } from "@/utils/roleColors";

// Import dispatch and selector for redux
import { useAppDispatch, useAppSelector } from "@/app/hooks"

// Import Thunk file for redux
import { addPatient, updatePatient } from "@/features/patient/patientThunk"

// Import components
import StepPersonal from "./step-components/StepPersonal";
import StepMedical from "./step-components/StepMedical";
import StepEmergency from "./step-components/StepEmergency";
import StepReview from "./step-components/StepReview";

const PatientFormWizard = forwardRef<any, {
  defaultData?: Partial<Patient>;
  onClose: () => void;
  onSafeCloseReady: (handleSafeClose: () => void) => void;
  openCloseConfirmation: () => void;
  onStepChange?: (step: number) => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}>(({ defaultData, onClose, onSafeCloseReady, openCloseConfirmation, onStepChange, onSubmittingChange }, ref) => {

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const roleColors = getRoleColors(userRole || 'admin');

  const methods = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultData || {
      name: "",
      dob: "",
      gender: undefined,
      bloodGroup: undefined,
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pin: "",
      allergies: "",
      conditions: "",
      surgeries: "",
      medications: "",
      contactName: "",
      emergencyPhone: "",
      relationship: "",
      photo: "",
      isActive: true,
    },
    mode: "onChange",
  });

  const { formState: { dirtyFields, errors }, trigger } = methods;

  // Check if there are any unsaved changes
  const checkUnsavedChanges = useCallback(() => {
    const hasChanges = Object.keys(dirtyFields).length > 0;
    return hasChanges;
  }, [dirtyFields]);

  // Handle safe close with confirmation
  const handleSafeClose = useCallback(() => {
    if (step > 1 && checkUnsavedChanges()) {
      openCloseConfirmation()
    } else {
      onClose();
    }
  }, [step, checkUnsavedChanges, onClose]);

  // Pass the safe close handler to parent
  useEffect(() => {
    onSafeCloseReady(handleSafeClose);
  }, [handleSafeClose, onSafeCloseReady]);

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  // Notify parent of submitting state changes
  useEffect(() => {
    if (onSubmittingChange) {
      onSubmittingChange(isSubmitting);
    }
  }, [isSubmitting, onSubmittingChange]);

  //  Manage step
  const steps = useMemo(() => [
    "Personal Info",
    "Medical",
    "Emergency",
    "Review",
  ], []);

  //  Handle next step and check validation
  const handleNext = useCallback(async () => {
    const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
    const fieldsToValidate = Object.keys(currentStepSchema?.shape || {});

    const valid = await trigger(fieldsToValidate as (keyof Patient)[]);

    if (!valid) {
      return;
    }

    if (step < 4) {
      setStep(prev => prev + 1);
    }
  }, [step, trigger]);

  const handleBack = useCallback(() => setStep(prev => prev - 1), []);

  // Handle direct step navigation (only available in edit mode)
  const handleStepClick = useCallback(async (targetStep: number) => {
    // Only allow direct navigation in edit mode (when defaultData has an id)
    if (!defaultData?.id) {
      return;
    }

    // Check if current step has any validation errors
    const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
    const fieldsToValidate = Object.keys(currentStepSchema?.shape || {});
    const valid = await trigger(fieldsToValidate as (keyof Patient)[]);

    // If current step has validation errors, prevent navigation
    if (!valid) {
      return;
    }

    setStep(targetStep);
  }, [defaultData?.id, step, trigger]);

  //  Submit all data in database
  const onSubmit = useCallback(async (data: PatientFormData) => {
    setIsSubmitting(true);
    // Show loading toast
    const loadingToast = toast.loading(data.id ? 'Updating patient...' : 'Adding patient...');
    try {
      // Ensure all required fields are present
      const submissionData = {
        ...data,
        allergies: data.allergies || "",
        conditions: data.conditions || "",
        contactName: data.contactName || "",
        emergencyPhone: data.emergencyPhone || "",
      };

      if (data.id) {

        // Update existing patient
        const result = await dispatch(updatePatient(submissionData));
        if (updatePatient.rejected.match(result)) {
          throw new Error((result.payload as string) || 'Failed to update patient');
        }
        toast.success('Patient updated successfully!', { id: loadingToast });
      } else {

        // Add new patient
        const result = await dispatch(addPatient(submissionData));
        if (addPatient.rejected.match(result)) {
          throw new Error((result.payload as string) || 'Failed to add patient');
        }
        toast.success('Patient added successfully!', { id: loadingToast });
      }

      // Small delay to ensure Redux state is updated
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error saving patient:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save patient';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, onClose]);

  // Call handleSubmit method
  const handleSubmit = useCallback(() => {
    if (step === 4) {
      methods.handleSubmit(onSubmit)();
    }
  }, [step, methods, onSubmit]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handleNext,
    handleBack,
    handleSubmit,
    step,
    isSubmitting
  }), [handleNext, handleBack, handleSubmit, step, isSubmitting]);

  return (
    <FormProvider {...methods}>
      <form className="space-y-6" onSubmit={methods.handleSubmit(onSubmit)}>

      {/* Progress */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${roleColors.progress} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((stepName, index) => {
            const stepNumber = index + 1;
            const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
            const currentStepFields = Object.keys(currentStepSchema?.shape || {});
            const hasCurrentStepErrors = currentStepFields.some(field => errors[field as keyof Patient]);

            const isClickable = defaultData?.id && stepNumber !== step && !hasCurrentStepErrors;
            const isCompleted = stepNumber <= step;

            return (
              <div
                key={index}
                onClick={() => isClickable && handleStepClick(stepNumber)}
                className={`hidden md:block text-xs font-medium transition-all duration-200 ${
                  isCompleted
                    ? roleColors.text.replace('700', '600')
                    : "text-gray-400"
                } ${
                  isClickable
                    ? "cursor-pointer hover:opacity-80 hover:scale-105"
                    : "cursor-default"
                }`}
              >
                {stepNumber}. {stepName}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Title */}
      <h3 className="text-xl font-bold text-gray-800">{steps[step - 1]}</h3>

      {/* Step Content */}
      {step === 1 && (<StepPersonal />)}
      {step === 2 && (<StepMedical />)}
      {step === 3 && (<StepEmergency />)}
      {step === 4 && <StepReview />}
      </form>
    </FormProvider>
  );
});

PatientFormWizard.displayName = 'PatientFormWizard';

export default PatientFormWizard;