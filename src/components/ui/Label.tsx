import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'default' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  required?: boolean;
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant = 'default', size = 'default', required = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-lg font-medium transition-all duration-200';

    const variants = {
      default: 'text-gray-900 focus:ring-blue-500',
      secondary: 'text-gray-600 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
      destructive: 'text-red-900 bg-red-50 hover:bg-red-100 focus:ring-red-500',
    };

    const sizes = {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base'
    };

    return (
      <label
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };