import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import UI components
import { FormButton } from "@/components/common/FormButton";
import ConfirmationDialog from "@/components/common/dialog/ConfirmationDialog";
import GenericDialog from "@/components/common/dialog/GenericDialog";

// Import Types files
import type { AddPatientDialogProps } from '@/types/patients/patientType'

// Import utils file
import { getRoleColors } from "@/utils/roleColors";

// Import selector for redux
import { useAppSelector } from "@/app/hooks";

// Import components files
import PatientFormWizard from "@/components/admin/patient/PatientFormWizard";


export default function AddEditPatient({ isOpen, onClose, editData, titleClass }: AddPatientDialogProps) {

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
  const contentRef = useRef<HTMLDivElement>(null);


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

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

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

  // Custom header with user icon and role-based colors
  const customHeader = (
    <div className="flex items-center space-x-3">
      <div className={`hidden w-12 h-12 bg-gradient-to-br ${roleColors.primary} rounded-xl md:flex items-center justify-center shadow-lg`}>
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
  );

  // Custom footer with Back and Next/Save buttons
  const customFooter = (
    <div className="flex justify-between items-center">
      <FormButton
        type="button"
        onClick={handleBack}
        variant="secondary"
        size="default"
        disabled={currentStep === 1}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </FormButton>

      <div className="flex space-x-3">
        <FormButton
          type="button"
          onClick={handleNextOrSubmit}
          variant="default"
          size="default"
          loading={isSubmitting}
          customColor={`bg-gradient-to-r ${roleColors.primary} text-white hover:shadow-lg transform hover:scale-105`}
        >
          {currentStep < 4 ? (<>Next <ChevronRight className="w-4 h-4 ml-1" /></>) : (isSubmitting ? "Saving..." : "Save Patient")}
        </FormButton>
      </div>
    </div>
  );

  return (
    <>
      <GenericDialog
        isOpen={isOpen}
        onClose={handleDialogClose}
        header={customHeader}
        footer={customFooter}
        showDefaultButtons={false}
        closeOnBackdropClick={false}
        customBackdropClickHandler={handleDialogClose}
        contentRef={contentRef}
      >
        <PatientFormWizard
          ref={wizardRef}
          defaultData={editData}
          onClose={onClose}
          onSafeCloseReady={handleSafeCloseReady}
          openCloseConfirmation={handleOpenCloseConfirmation}
          onStepChange={setCurrentStep}
          onSubmittingChange={setIsSubmitting}
        />
      </GenericDialog>

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
    </>
  );
}