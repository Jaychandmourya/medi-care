import PatientFormWizard from "./PatientFormWizard";

export default function AddPatientDialog({
  isOpen,
  onClose,
  editData,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-lg">

        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            {editData ? "Edit Patient" : "Add Patient"}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Wizard */}
        <PatientFormWizard
          defaultData={editData}
          onClose={onClose}
        />
      </div>
    </div>
  );
}