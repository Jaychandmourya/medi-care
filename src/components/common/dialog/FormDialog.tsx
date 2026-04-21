import { type ReactNode, useEffect } from "react";

// Import UI components
import { Button } from "@/components/common/Button";

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;

  // Dynamic sizing
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;

  // Dynamic header
  showHeader?: boolean;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  titleClass?: string;
  showCloseButton?: boolean;

  // Dynamic footer
  showFooter?: boolean;
  footer?: ReactNode;

  // Footer button options
  showDefaultButtons?: boolean;
  cancelButtonText?: string;
  saveButtonText?: string;
  onCancel?: () => void;
  onSave?: () => void;
  saveButtonLoading?: boolean;
  saveButtonDisabled?: boolean;

  // Custom styling
  containerClass?: string;
  dialogClass?: string;
  backdropClass?: string;

  // Close handlers
  closeOnBackdropClick?: boolean;
  closeOnEscapeKey?: boolean;
  preventInnerClickClose?: boolean;
  customBackdropClickHandler?: (e: React.MouseEvent) => void;
}

export default function FormDialog({
  isOpen,
  onClose,
  children,

  // Dynamic sizing with defaults
  maxWidth = "max-w-2xl",
  maxHeight = "max-h-[90vh]",
  width = "w-full",
  height = "",

  // Dynamic header
  showHeader = true,
  header,
  title,
  subtitle,
  titleClass,
  showCloseButton = true,

  // Dynamic footer
  showFooter = true,
  footer,

  // Footer button options
  showDefaultButtons = true,
  cancelButtonText = "Cancel",
  saveButtonText = "Save",
  onCancel,
  onSave,
  saveButtonLoading = false,
  saveButtonDisabled = false,

  // Custom styling
  containerClass = "",
  dialogClass = "",
  backdropClass = "bg-black/60 backdrop-blur-sm",

  // Close handlers
  closeOnBackdropClick = true,
  closeOnEscapeKey = true,
  preventInnerClickClose = false,
  customBackdropClickHandler,
}: FormDialogProps) {

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (customBackdropClickHandler) {
      customBackdropClickHandler(e);
      return;
    }

    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    if (preventInnerClickClose) {
      e.stopPropagation();
    }
  };

  // Escape key handler
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (closeOnEscapeKey && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeOnEscapeKey, onClose]);

  if (!isOpen) return null;

  // Default header content
  const defaultHeader = (
    <div className="flex items-center space-x-3">
      {title && (
        <div>
          <h2 className={`text-2xl font-bold ${titleClass || 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'}`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  // Default footer content with Cancel and Save buttons
  const defaultFooter = (
    <div className="flex justify-between items-center">
      <Button
        type="button"
        onClick={onCancel || onClose}
        variant="secondary"
        size="default"
      >
        {cancelButtonText}
      </Button>

      <div className="flex space-x-3">
        <Button
          type="button"
          onClick={onSave}
          variant="default"
          size="default"
          loading={saveButtonLoading}
          disabled={saveButtonDisabled}
          customColor="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transform hover:scale-105"
        >
          {saveButtonLoading ? "Saving..." : saveButtonText}
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 ${backdropClass} flex items-center justify-center z-50 p-4 ${containerClass}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white ${width} ${maxWidth} ${height} ${maxHeight} rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100 flex flex-col ${dialogClass}`}
        onClick={handleDialogClick}
      >
        {/* Dynamic Header */}
        {showHeader && (
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-3xl p-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {header || defaultHeader}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseClick}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex-shrink-0 ml-4"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {children}
        </div>

        {/* Dynamic Footer */}
        {showFooter && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-3xl p-6 pt-4">
            {footer || (showDefaultButtons && defaultFooter)}
          </div>
        )}
      </div>
    </div>
  );
}