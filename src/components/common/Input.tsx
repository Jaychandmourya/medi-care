import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import { Label } from '@/components/common/Label';

export interface InputProps {
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  registration?: UseFormRegisterReturn;
  error?: FieldError | { message?: string; type?: string };
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  rows?: number;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode; // For select options
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onClick?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  step?: string | number;
  min?: string | number;
  max?: string | number;
}

const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  placeholder,
  label,
  required = false,
  disabled = false,
  className = '',
  registration,
  error,
  icon: Icon,
  iconPosition = 'left',
  rows = 3,
  as = 'input',
  children,
  value,
  onChange,
  onClick,
  onFocus,
  onKeyDown,
  step,
  min,
  max,
}) => {
  const baseClasses = `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 shadow-sm ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  const iconPadding = Icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (type === 'tel' && e.key.length === 1 && !/[\d+]/.test(e.key)) {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  const renderInput = () => {
    const commonProps = {
      id,
      placeholder,
      disabled,
      className: `${baseClasses} ${iconPadding}`,
      value,
      onChange,
      onClick,
      onFocus,
      onKeyDown: handleKeyDown,
      ...registration,
    };

    switch (as) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        );
      case 'select':
        return (
          <select
            {...commonProps}
            className={`${baseClasses} ${iconPadding}`}
          >
            {children}
          </select>
        );
      default:
        return (
          <input
            {...commonProps}
            type={type === 'tel' ? 'text' : type}
            autoComplete="off"
            step={step}
            min={min}
            max={max}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} required={required} className="mb-1.5">
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        )}
        {renderInput()}
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">
          {error.message?.toString() || 'This field is required'}
        </p>
      )}
    </div>
  );
};

export default Input;
