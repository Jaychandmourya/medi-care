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
    const baseClasses = 'inline-flex items-center font-medium';

    const variants = {
      default: 'text-gray-700',
      secondary: 'text-gray-600',
      destructive: 'text-red-700',
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