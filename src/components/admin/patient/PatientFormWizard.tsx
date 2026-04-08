import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast"

// Import UI components
import { Button } from "@/components/ui/Button";

// Import form, validation and zod files
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import validation schemas files
import { patientSchema, stepSchemas } from "@/validation-schema/patientValidation";

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

export default function PatientFormWizard({ defaultData, onClose, onSafeCloseReady, openCloseConfirmation }: {
  defaultData?: Partial<Patient>;
  onClose: () => void;
  onSafeCloseReady: (handleSafeClose: () => void) => void;
  openCloseConfirmation: () => void;
}) {

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const roleColors = getRoleColors(userRole || 'admin');

  const methods = useForm<Patient>({
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

  const { formState: { errors, isValid, dirtyFields }, trigger } = methods;

  // Check if current step has any errors
  const hasStepErrors = () => {
    const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
    const currentStepFields = Object.keys(currentStepSchema?.shape || {});
    return currentStepFields.some(field => errors[field as keyof Patient]);
  };

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

  //  Submit all data in database
  const onSubmit = useCallback(async (data: Patient) => {
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
          {steps.map((stepName, index) => (
            <div
              key={index}
              className={`text-xs font-medium ${
                index + 1 <= step ? roleColors.text.replace('700', '600') : "text-gray-400"
              }`}
            >
              {index + 1}. {stepName}
            </div>
          ))}
        </div>
      </div>

      {/* Step Title */}
      <h3 className="text-xl font-bold text-gray-800">{steps[step - 1]}</h3>

      {/* Step Content */}
      {step === 1 && (<StepPersonal />)}
      {step === 2 && (<StepMedical />)}
      {step === 3 && (<StepEmergency />)}
      {step === 4 && <StepReview />}

      {/*  Next, Back and Save Patient */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          variant="secondary"
          size="default"
        >
          ← Back
        </Button>

        {/* Next / Submit */}
        {step < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={hasStepErrors()}
            variant="default"
            size="default"
            customColor={`bg-gradient-to-r ${roleColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
          >
            Next →
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            variant="default"
            size="default"
            loading={isSubmitting}
            customColor={`bg-gradient-to-r ${roleColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
          >
            {isSubmitting ? "Saving..." : "Save Patient"}
          </Button>
        )}
      </div>
      </form>
    </FormProvider>
  );
}