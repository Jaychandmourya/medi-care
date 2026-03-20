import { useFormContext } from "react-hook-form";

export default function StepMedical() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">

      {/* Allergies */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Known Allergies <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">⚠️</span>
          <textarea
            {...register("allergies", { required: "Allergies information is required" })}
            placeholder="List any known allergies (e.g., penicillin, nuts, latex)"
            rows={3}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none ${
              errors.allergies ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.allergies && (
            <p className="text-sm text-red-500">{errors.allergies.message as string}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">Please specify all known allergies. Write 'None' if no allergies.</p>
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Chronic Conditions <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">🏥</span>
          <textarea
            {...register("conditions", { required: "Medical conditions information is required" })}
            placeholder="List chronic conditions (e.g., diabetes, hypertension, asthma)"
            rows={3}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none ${
              errors.conditions ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.conditions && (
            <p className="text-sm text-red-500">{errors.conditions.message as string}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">Include chronic conditions and ongoing treatments.</p>
      </div>

      {/* Past Surgeries */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Past Surgeries
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">🔪</span>
          <textarea
            {...register("surgeries")}
            placeholder="List previous surgeries with year (e.g., Appendectomy - 2019, C-section - 2021)"
            rows={3}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none ${
              errors.surgeries ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.surgeries && (
            <p className="text-sm text-red-500">{errors.surgeries.message as string}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">Include surgery type and year. Write 'None' if no surgeries.</p>
      </div>

      {/* Current Medications */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Current Medications
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">💊</span>
          <textarea
            {...register("medications")}
            placeholder="List current medications with dosage (e.g., Metformin 500mg - twice daily, Lisinopril 10mg - once daily)"
            rows={3}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none ${
              errors.medications ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.medications && (
            <p className="text-sm text-red-500">{errors.medications.message as string}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">Include prescription medications, over-the-counter drugs, and supplements.</p>
      </div>

    </div>
  );
}