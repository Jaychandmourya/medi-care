import PatientFormWizard from "./PatientFormWizard";

export default function AddPatientDialog({
  isOpen,
  onClose,
  editData,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">👤</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {editData ? "Edit Patient" : "Add New Patient"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group"
          >
            <span className="text-gray-400 group-hover:text-gray-600 text-xl">✕</span>
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6 text-sm">
          {editData
            ? "Update patient information. All fields marked with * are required."
            : "Fill in the patient information below. All fields marked with * are required."
          }
        </p>

        {/* Wizard */}
        <PatientFormWizard
          defaultData={editData}
          onClose={onClose}
        />
      </div>
    </div>
  );
}