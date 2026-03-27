import { useFormContext } from "react-hook-form";
import { AlertTriangle, Hospital, Activity, Pill } from "lucide-react";
import Input from "@/components/ui/Input";

export default function StepMedical() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">

      {/* Allergies */}
      <div className="space-y-2">
        <Input
          id="allergies"
          label="Known Allergies"
          required
          as="textarea"
          rows={3}
          placeholder="List any known allergies (e.g., penicillin, nuts, latex)"
          registration={register("allergies", { required: "Allergies information is required" })}
          error={errors.allergies}
          icon={AlertTriangle}
        />
        <p className="text-xs text-gray-500">Please specify all known allergies. Write 'None' if no allergies.</p>
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-2">
        <Input
          id="conditions"
          label="Chronic Conditions"
          required
          as="textarea"
          rows={3}
          placeholder="List chronic conditions (e.g., diabetes, hypertension, asthma)"
          registration={register("conditions", { required: "Medical conditions information is required" })}
          error={errors.conditions}
          icon={Hospital}
        />
        <p className="text-xs text-gray-500">Include chronic conditions and ongoing treatments.</p>
      </div>

      {/* Past Surgeries */}
      <div className="space-y-2">
        <Input
          id="surgeries"
          label="Past Surgeries"
          as="textarea"
          rows={3}
          placeholder="List previous surgeries with year (e.g., Appendectomy - 2019, C-section - 2021)"
          registration={register("surgeries")}
          error={errors.surgeries}
          icon={Activity}
        />
        <p className="text-xs text-gray-500">Include surgery type and year. Write 'None' if no surgeries.</p>
      </div>

      {/* Current Medications */}
      <div className="space-y-2">
        <Input
          id="medications"
          label="Current Medications"
          as="textarea"
          rows={3}
          placeholder="List current medications with dosage (e.g., Metformin 500mg - twice daily, Lisinopril 10mg - once daily)"
          registration={register("medications")}
          error={errors.medications}
          icon={Pill}
        />
        <p className="text-xs text-gray-500">Include prescription medications, over-the-counter drugs, and supplements.</p>
      </div>

    </div>
  );
}