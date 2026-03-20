import { useFormContext } from "react-hook-form";

export default function StepEmergency() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">

      {/* Contact Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Emergency Contact Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">👤</span>
          <input
            {...register("contactName", { required: "Emergency contact name is required" })}
            placeholder="Enter emergency contact's full name"
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.contactName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.contactName && (
            <p className="text-sm text-red-500">{errors.contactName.message as string}</p>
          )}
        </div>
      </div>

      {/* Emergency Phone */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Emergency Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">📞</span>
          <input
            {...register("emergencyPhone", {
              required: "Emergency phone number is required",
              pattern: {
                value: /^\d{10,}$/,
                message: "Please enter a valid emergency phone number (at least 10 digits)"
              }
            })}
            placeholder="Enter emergency contact phone number"
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.emergencyPhone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.emergencyPhone && (
            <p className="text-sm text-red-500">{errors.emergencyPhone.message as string}</p>
          )}
        </div>
        <p className="text-xs text-gray-500">This contact will be notified in case of emergency.</p>
      </div>

      {/* Relationship */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Relationship to Patient
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-gray-500">🔗</span>
          <select
            {...register("relationship")}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none ${
              errors.relationship ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

    </div>
  );
}