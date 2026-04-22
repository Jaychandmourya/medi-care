import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { FormButton } from '../FormButton';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
  };

  const currentStyle = typeStyles[type];
  const Icon = currentStyle.icon;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 opacity-100 animate-slide-up">
        {/* Header */}
        <div className={`${currentStyle.bgColor} ${currentStyle.borderColor} border-b p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className={`w-6 h-6 ${currentStyle.iconColor}`} />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <FormButton
              variant="ghost"
              size="icon"
              onClick={onCancel}
            >
              <X className="w-5 h-5" />
            </FormButton>
          </div>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          {cancelText && (
            <FormButton
              variant="outline"
              onClick={onCancel}
            >
              {cancelText}
            </FormButton>
          )}
          <FormButton
            variant={type === 'danger' ? 'destructive' : type === 'info' ? 'default' : 'default'}
            onClick={onConfirm}
          >
            {confirmText}
          </FormButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
