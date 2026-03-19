import { useState } from "react";
import { useDispatch } from "react-redux";
import { addPatient, updatePatient } from "../store/patientSlice";

import StepPersonal from "./steps/StepPersonal";
import StepMedical from "./steps/StepMedical";
import StepEmergency from "./steps/StepEmergency";
import StepReview from "./steps/StepReview";

export default function PatientFormWizard({ defaultData, onClose }) {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(defaultData || {});

  const steps = [
    "Personal Info",
    "Medical",
    "Emergency",
    "Review",
  ];

  // 🔹 Handle Next
  const handleNext = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setStep((prev) => prev + 1);
  };

  // 🔹 Handle Back
  const handleBack = () => setStep((prev) => prev - 1);

  // 🔹 Final Submit
  const handleSubmit = () => {
    if (formData.id) {
      dispatch(updatePatient(formData));
    } else {
      dispatch(addPatient({ ...formData, isActive: true }));
    }
    onClose();
  };

  return (
    <div className="space-y-6">

      {/* Progress */}
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-blue-600 rounded"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Step Title */}
      <h3 className="text-lg font-semibold">{steps[step - 1]}</h3>

      {/* Step Content */}
      {step === 1 && (
        <StepPersonal data={formData} onChange={setFormData} />
      )}
      {step === 2 && (
        <StepMedical data={formData} onChange={setFormData} />
      )}
      {step === 3 && (
        <StepEmergency data={formData} onChange={setFormData} />
      )}
      {step === 4 && <StepReview data={formData} />}

      {/* COMMON BUTTONS */}
      <div className="flex justify-between pt-4">

        {/* Back */}
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="btn-secondary"
        >
          Back
        </button>

        {/* Next / Submit */}
        {step < 4 ? (
          <button
            onClick={() => handleNext({})}
            className="btn-primary"
          >
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary">
            Save Patient
          </button>
        )}
      </div>
    </div>
  );
}