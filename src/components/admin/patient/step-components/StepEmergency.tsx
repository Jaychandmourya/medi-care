import { useFormContext } from "react-hook-form";
import { User, Phone, Link } from "lucide-react";
import Input from "@/components/common/Input";

export default function StepEmergency() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">

      {/* Contact Name */}
      <Input
        id="contactName"
        label="Emergency Contact Name"
        placeholder="Enter emergency contact's full name"
        required
        icon={User}
        registration={register("contactName", { required: "Emergency contact name is required" })}
        error={errors.contactName}
      />

      {/* Emergency Phone */}
      <Input
        id="emergencyPhone"
        label="Emergency Phone Number"
        type="tel"
        placeholder="Enter emergency contact phone number"
        required
        icon={Phone}
        registration={register("emergencyPhone", {
          required: "Emergency phone number is required",
          pattern: {
            value: /^\d{10,}$/,
            message: "Please enter a valid emergency phone number (at least 10 digits)"
          }
        })}
        error={errors.emergencyPhone}
      />
      <p className="text-xs text-gray-500">This contact will be notified in case of emergency.</p>

      {/* Relationship */}
      <Input
        id="relationship"
        label="Relationship to Patient"
        as="select"
        icon={Link}
        registration={register("relationship")}
        error={errors.relationship}
      >
        <option value="">Select relationship</option>
        <option value="Spouse">Spouse</option>
        <option value="Parent">Parent</option>
        <option value="Child">Child</option>
        <option value="Sibling">Sibling</option>
        <option value="Friend">Friend</option>
        <option value="Other">Other</option>
      </Input>

    </div>
  );
}