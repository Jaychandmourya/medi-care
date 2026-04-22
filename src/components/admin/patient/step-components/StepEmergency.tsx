import { useFormContext } from "react-hook-form";
import { User, Phone, Link } from "lucide-react";
import FormField from "@/components/common/FormField";

export default function StepEmergency() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">

      {/* Contact Name */}
      <FormField
        id="contactName"
        label="Emergency Contact Name"
        placeholder="Enter emergency contact's full name"
        required
        icon={User}
        registration={register("contactName", { required: "Emergency contact name is required" })}
        error={errors.contactName}
      />

      {/* Emergency Phone */}
      <FormField
        id="emergencyPhone"
        label="Emergency Phone Number"
        type="tel"
        placeholder="Enter emergency contact phone number"
        required
        icon={Phone}
        registration={register("emergencyPhone")}
        error={errors.emergencyPhone}
      />
      <p className="text-xs text-gray-500">This contact will be notified in case of emergency.</p>

      {/* Relationship */}
      <FormField
        id="relationship"
        label="Relationship to Patient"
        as="select"
        required
        icon={Link}
        registration={register("relationship", { required: "Relationship is required" })}
        error={errors.relationship}
      >
        <option value="">Select relationship</option>
        <option value="Spouse">Spouse</option>
        <option value="Parent">Parent</option>
        <option value="Child">Child</option>
        <option value="Sibling">Sibling</option>
        <option value="Friend">Friend</option>
        <option value="Other">Other</option>
      </FormField>

    </div>
  );
}