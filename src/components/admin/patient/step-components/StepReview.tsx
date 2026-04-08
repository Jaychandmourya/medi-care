import { useFormContext } from "react-hook-form";

export default function StepReview() {
  const { getValues } = useFormContext();
  const data = getValues();

  return (
    <div className="space-y-6">

      {/* Review Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Review Patient Information</h3>
        <p className="text-sm text-gray-600 mt-1">Please review all details before saving</p>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Personal Information */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-blue-600">👤</span>
            <h4 className="font-semibold text-gray-800">Personal Information</h4>
          </div>
          <div className="space-y-3 text-sm">
            {/* Photo Display */}
            {data.photo && (
              <div className="flex justify-center">
                <img
                  src={data.photo}
                  alt="Patient photo"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-800">{data.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium text-gray-800">{data.dob || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium text-gray-800">{data.gender || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-800">{data.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-orange-600">🏥</span>
            <h4 className="font-semibold text-gray-800">Medical Information</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Allergies:</span>
              <p className="font-medium text-gray-800 mt-1">{data.allergies || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Conditions:</span>
              <p className="font-medium text-gray-800 mt-1">{data.conditions || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 md:col-span-2">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-green-600">📞</span>
            <h4 className="font-semibold text-gray-800">Emergency Contact</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Contact Name:</span>
              <p className="font-medium text-gray-800 mt-1">{data.contactName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium text-gray-800 mt-1">{data.emergencyPhone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Relationship:</span>
              <p className="font-medium text-gray-800 mt-1">{data.relationship || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}