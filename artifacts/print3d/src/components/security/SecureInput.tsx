/**
 * Secure Input Component with built-in sanitization and validation
 */

import React, { useState, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeText, isValidEmail } from '@/utils/security';

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  helperText?: string;
  error?: string;
  sanitize?: boolean;
  validateOnBlur?: boolean;
  validate?: (value: string) => string | null;
  onChange?: (value: string, isValid: boolean) => void;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    label, 
    helperText, 
    error: externalError,
    sanitize = true,
    validateOnBlur = true,
    validate,
    onChange,
    maxLength = 500,
    showCharacterCount = false,
    className,
    type = 'text',
    ...props 
  }, ref) => {
    const [internalError, setInternalError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);

    const error = externalError || internalError;

    const runValidation = useCallback((value: string): string | null => {
      if (validate) {
        return validate(value);
      }
      
      // Built-in validation based on type
      if (type === 'email' && value && !isValidEmail(value)) {
        return 'Please enter a valid email address';
      }
      
      if (value.length > maxLength) {
        return `Maximum ${maxLength} characters allowed`;
      }
      
      return null;
    }, [validate, type, maxLength]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Sanitize input
      if (sanitize) {
        value = sanitizeText(value);
      }
      
      setCharacterCount(value.length);
      
      // Validate if already touched
      if (touched) {
        const validationError = runValidation(value);
        setInternalError(validationError);
        onChange?.(value, !validationError);
      } else {
        onChange?.(value, true);
      }
    }, [sanitize, touched, runValidation, onChange]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      
      if (validateOnBlur) {
        const validationError = runValidation(e.target.value);
        setInternalError(validationError);
      }
      
      props.onBlur?.(e);
    }, [validateOnBlur, runValidation, props]);

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full rounded-xl border bg-black/30 px-4 py-3 text-white placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            "transition-all duration-200",
            error 
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50" 
              : "border-white/10 focus:border-primary/50",
            className
          )}
          maxLength={maxLength}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        
        <div className="flex justify-between items-center">
          {(helperText || error) && (
            <p className={cn(
              "text-xs",
              error ? "text-red-400" : "text-zinc-500"
            )}>
              {error || helperText}
            </p>
          )}
          
          {showCharacterCount && (
            <p className={cn(
              "text-xs ml-auto",
              characterCount > maxLength * 0.9 ? "text-yellow-400" : "text-zinc-600"
            )}>
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SecureInput.displayName = 'SecureInput';
