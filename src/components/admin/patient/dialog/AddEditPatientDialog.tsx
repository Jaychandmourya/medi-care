import { useState, useCallback, useRef } from "react";

// Import UI components
import { Button } from "@/components/common/Button";
import ConfirmationDialog from "@/components/common/dialog/ConfirmationDialog";

// Import Types files
import type { AddPatientDialogProps } from '@/types/patients/patientType'

// Import utils file
import { getRoleColors } from "@/utils/roleColors";

// Import selector for redux
import { useAppSelector } from "@/app/hooks";

// Import components files
import PatientFormWizard from "@/components/admin/patient/PatientFormWizard";


export default function AddPatientDialog({ isOpen, onClose, editData, titleClass }: AddPatientDialogProps) {

  // Redux selector
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Utile
  const roleColors = getRoleColors(userRole || 'admin');

  // Variable
  const [safeCloseHandler, setSafeCloseHandler] = useState<(() => void) | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState<boolean>(false);
  const wizardRef = useRef<{
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => void;
  step: number;
  isSubmitting: boolean;
} | null>(null);


  // Methods
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

   // Open OpenCloseConfirmation dialog
  const handleOpenCloseConfirmation = () => {
    setShowCloseConfirmation(true)
  }

  //  Handle Confirm Close dialog
  const handleConfirmClose = useCallback(() => {
    setShowCloseConfirmation(false);
    onClose();
  }, [onClose]);

  // Handle close confirm close dialog
  const handleCancelClose = useCallback(() => {
    setShowCloseConfirmation(false);
  }, []);


  const handleBack = useCallback(() => {
    if (wizardRef.current?.handleBack) {
      wizardRef.current.handleBack();
    }
  }, []);

  // State to track current step and submitting status
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle next/submit based on current step
  const handleNextOrSubmit = useCallback(() => {
    if (currentStep < 4) {
      if (wizardRef.current?.handleNext) {
        wizardRef.current.handleNext();
      }
    } else {
      if (wizardRef.current?.handleSubmit) {
        wizardRef.current.handleSubmit();
      }
    }
  }, [currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100 flex flex-col max-h-[90vh]">

        {/* Fixed Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-3xl p-6 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${roleColors.primary} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white text-xl">👤</span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${titleClass || 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'}`}>
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
          {/* Wizard */}
          <PatientFormWizard
            ref={wizardRef}
            defaultData={editData}
            onClose={onClose}
            onSafeCloseReady={handleSafeCloseReady}
            openCloseConfirmation={ handleOpenCloseConfirmation }
            onStepChange={setCurrentStep}
            onSubmittingChange={setIsSubmitting}
          />
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-3xl p-6 pt-4">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={handleBack}
              variant="secondary"
              size="default"
              disabled={ currentStep === 1}
            >
              ← Back
            </Button>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={handleNextOrSubmit}
                variant="default"
                size="default"
                loading={isSubmitting}
                customColor={`bg-gradient-to-r ${roleColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
              >
                {currentStep < 4 ? "Next →" : (isSubmitting ? "Saving..." : "Save Patient")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Close Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCloseConfirmation}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close? All entered data will be lost."
        confirmText="Close"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </div>
  );
}