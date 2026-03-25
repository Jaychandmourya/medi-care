import PatientFormWizard from "./PatientFormWizard";
import { Button } from "@/components/ui/Button";
import { useState, useCallback } from "react";

export default function AddPatientDialog({isOpen,onClose,editData}: {isOpen: boolean, onClose: () => void, editData?: any}) {
  const [safeCloseHandler, setSafeCloseHandler] = useState<(() => void) | null>(null);

  const handleDialogClose = useCallback(() => {
    if (safeCloseHandler) {
      safeCloseHandler();
    } else {
      onClose();
    }
  }, [safeCloseHandler, onClose]);

  const handleSafeCloseReady = useCallback((handler: () => void) => {
    setSafeCloseHandler(() => handler);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100 flex flex-col max-h-[90vh]">

        {/* Fixed Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-3xl p-6 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {editData ? "Edit Patient" : "Add New Patient"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {editData
                    ? "Update patient information"
                    : "Fill in the patient information"
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDialogClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            >
              <span className="text-gray-400 group-hover:text-gray-600 text-xl">✕</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-700 text-sm">
              <span className="font-semibold">Required fields:</span> All fields marked with * are required to proceed.
            </p>
          </div>

          {/* Wizard */}
          <PatientFormWizard
            defaultData={editData}
            onClose={onClose}
            onSafeCloseReady={handleSafeCloseReady}
          />
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-3xl p-6 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              Need help? Contact support
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}