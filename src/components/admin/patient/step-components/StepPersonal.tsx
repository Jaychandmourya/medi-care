import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import {Phone, Mail} from 'lucide-react'

export default function StepPersonal() {
  const { register, formState: { errors }, setValue, watch, setError, clearErrors } = useFormContext();
  const photoPreview = watch("photo");

  // Upload photo
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5">

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>
          Patient Photo
        </Label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt="Patient preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-2xl">👤</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Photo
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF</p>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <Input
        id="name"
        label="Full Name"
        required
        placeholder="Enter patient's full name"
        registration={register("name", { required: "Full name is required" })}
        error={errors.name}
      />

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label required>
          Date of Birth
        </Label>
        <DatePicker
          value={watch("dob") || ''}
          onChange={(value) => {
            setValue("dob", value);
            if (!value) {
              setError("dob", { message: "Date of birth is required" });
            } else {
              clearErrors("dob");
            }
          }}
          placeholder="Select date of birth"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
            errors.dob ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.dob && (
          <p className="text-sm text-red-500">
            {errors.dob.message?.toString() || 'Date of birth is required'}
          </p>
        )}
      </div>

      {/* Gender and Blood Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            id="gender"
            label="Gender"
            required
            as="select"
            registration={register("gender", { required: "Gender is required" })}
            error={errors.gender}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Input>
        </div>

        <div className="space-y-2">
          <Input
            id="bloodGroup"
            label="Blood Group"
            required
            as="select"
            registration={register("bloodGroup", { required: "Blood group is required" })}
            error={errors.bloodGroup}
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Input>
        </div>
      </div>

      {/* Phone and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            id="phone"
            label="Phone Number"
            required
            type="tel"
            placeholder="Enter phone number"
            icon={Phone}
            iconPosition="left"
            registration={register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^\d{10,}$/,
                message: "Please enter a valid phone number (at least 10 digits)"
              }
            })}
            error={errors.phone}
          />
        </div>

        <div className="space-y-2">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            icon={Mail}
            iconPosition="left"
            registration={register("email")}
            error={errors.email}
          />
        </div>
      </div>

      {/* Address */}
      <Input
        id="address"
        label="Address"
        placeholder="Enter street address"
        as="textarea"
        rows={2}
        registration={register("address")}
        error={errors.address}
      />

      {/* City, State, PIN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Input
            id="city"
            label="City"
            placeholder="Enter city"
            registration={register("city")}
            error={errors.city}
          />
        </div>

        <div className="space-y-2">
          <Input
            id="state"
            label="State"
            placeholder="Enter state"
            registration={register("state")}
            error={errors.state}
          />
        </div>

        <div className="space-y-2">
          <Input
            id="pin"
            label="PIN Code"
            placeholder="Enter PIN code"
            registration={register("pin")}
            error={errors.pin}
          />
        </div>
      </div>

    </div>
  );
}