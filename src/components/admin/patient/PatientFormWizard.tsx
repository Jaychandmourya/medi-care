import { useState, useMemo, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormData, stepSchemas } from "@/lib/patientValidation";
import { useAppDispatch } from "../../../app/hooks"
import { addPatient, updatePatient } from "@/features/patient/patientThunk"
import StepPersonal from "./step-components/StepPersonal";
import StepMedical from "./step-components/StepMedical";
import StepEmergency from "./step-components/StepEmergency";
import StepReview from "./step-components/StepReview";

export default function PatientFormWizard({ defaultData, onClose }: { defaultData?: Partial<PatientFormData>; onClose: () => void }) {

  const [step, setStep] = useState(1);
  const dispatch = useAppDispatch();

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
      isActive: true,
    },
    mode: "onChange",
  });

  const { formState: { errors, isValid }, trigger } = methods;

  // Check if current step has any errors
  const hasStepErrors = () => {
    const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
    const currentStepFields = Object.keys(currentStepSchema?.shape || {});
    return currentStepFields.some(field => errors[field as keyof PatientFormData]);
  };

  const steps = useMemo(() => [
    "Personal Info",
    "Medical",
    "Emergency",
    "Review",
  ], []);

  const handleNext = useCallback(async () => {
    const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
    const fieldsToValidate = Object.keys(currentStepSchema?.shape || {});

    const valid = await trigger(fieldsToValidate as (keyof PatientFormData)[]);

    if (!valid) {
      return;
    }

    if (step < 4) {
      setStep(prev => prev + 1);
    }
  }, [step, trigger]);

  const handleBack = useCallback(() => setStep(prev => prev - 1), []);

  const onSubmit = useCallback(async (data: PatientFormData) => {
    console.log('data',data)
    try {
      if (data.id) {
        dispatch(updatePatient(data as any));
      } else {
        dispatch(addPatient(data));
      }
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  }, [dispatch, onClose]);

  const handleSubmit = useCallback(() => {
    if (step === 4) {
      methods.handleSubmit(onSubmit)();
    }
  }, [step, methods, onSubmit]);

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">

      {/* Progress */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((stepName, index) => (
            <div
              key={index}
              className={`text-xs font-medium ${
                index + 1 <= step ? "text-purple-600" : "text-gray-400"
              }`}
            >
              {index + 1}. {stepName}
            </div>
          ))}
        </div>
      </div>

      {/* Step Title */}
      <h3 className="text-xl font-bold text-gray-800">{steps[step - 1]}</h3>

      {/* Error Display */}
      {(() => {
        const currentStepSchema = stepSchemas[step as keyof typeof stepSchemas];
        const currentStepFields = Object.keys(currentStepSchema?.shape || {});
        const currentStepErrors = currentStepFields.filter(field => errors[field as keyof PatientFormData]);

        return currentStepErrors.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {currentStepErrors.map((field, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <span className="text-red-400">•</span>
                      <span>{(errors as any)[field]?.message?.toString() || 'This field has an error'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Step Content */}
      {step === 1 && (
        <StepPersonal />
      )}
      {step === 2 && (
        <StepMedical />
      )}
      {step === 3 && (
        <StepEmergency />
      )}
      {step === 4 && <StepReview />}

      {/* COMMON BUTTONS */}
      <div className="flex justify-between pt-6 border-t border-gray-200">

        {/* Back */}
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            step === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95"
          }`}
        >
          ← Back
        </button>

        {/* Next / Submit */}
        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={hasStepErrors()}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              hasStepErrors()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:scale-95 shadow-md hover:shadow-lg"
            }`}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              !isValid
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-md hover:shadow-lg"
            }`}
          >
            Save Patient
          </button>
        )}
      </div>
      </form>
    </FormProvider>
  );
}