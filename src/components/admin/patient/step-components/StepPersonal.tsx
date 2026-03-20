import { useFormContext } from "react-hook-form";

export default function StepPersonal() {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const photoPreview = watch("photo");

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
        <label className="block text-sm font-medium text-gray-700">
          Patient Photo
        </label>
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
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (Max 5MB)</p>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name", { required: "Full name is required" })}
          placeholder="Enter patient's full name"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message?.toString() || 'Full name is required'}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register("dob", { required: "Date of birth is required" })}
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
          <label className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            {...register("gender", { required: "Gender is required" })}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-red-500">
              {errors.gender.message?.toString() || 'Gender is required'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Blood Group <span className="text-red-500">*</span>
          </label>
          <select
            {...register("bloodGroup", { required: "Blood group is required" })}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.bloodGroup ? "border-red-500" : "border-gray-300"
            }`}
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
          </select>
          {errors.bloodGroup && (
            <p className="text-sm text-red-500">
              {errors.bloodGroup.message?.toString() || 'Blood group is required'}
            </p>
          )}
        </div>
      </div>

      {/* Phone and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500">📱</span>
            <input
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10,}$/,
                  message: "Please enter a valid phone number (at least 10 digits)"
                }
              })}
              placeholder="Enter phone number"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">
                {errors.phone.message?.toString() || 'Phone number is required'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500">✉️</span>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">
                {errors.email.message?.toString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          {...register("address")}
          placeholder="Enter street address"
          rows={2}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && (
          <p className="text-sm text-red-500">
            {errors.address.message?.toString()}
          </p>
        )}
      </div>

      {/* City, State, PIN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            {...register("city")}
            placeholder="Enter city"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.city && (
            <p className="text-sm text-red-500">
              {errors.city.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            {...register("state")}
            placeholder="Enter state"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.state ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.state && (
            <p className="text-sm text-red-500">
              {errors.state.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            PIN Code
          </label>
          <input
            {...register("pin")}
            placeholder="Enter PIN code"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
              errors.pin ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.pin && (
            <p className="text-sm text-red-500">
              {errors.pin.message?.toString()}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}