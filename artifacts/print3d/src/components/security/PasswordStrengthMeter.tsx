/**
 * Password Strength Meter Component
 * Displays visual feedback for password strength
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePasswordStrength } from '@/hooks/use-security';

// SVG Icons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (isValid: boolean) => void;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({ 
  password, 
  onStrengthChange,
  showRequirements = true 
}: PasswordStrengthMeterProps) {
  const { strength } = usePasswordStrength();
  
  // Update strength when password changes
  React.useEffect(() => {
    if (password) {
      const result = strength;
      onStrengthChange?.(result?.isValid ?? false);
    }
  }, [password, strength, onStrengthChange]);

  if (!password) return null;

  const { score, requirements, isValid, feedback } = strength || {
    score: 0,
    requirements: {},
    isValid: false,
    feedback: [],
  };

  // Get color and label based on score
  const getStrengthInfo = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { color: 'bg-red-500', label: 'Very Weak', textColor: 'text-red-400' };
      case 2:
        return { color: 'bg-orange-500', label: 'Weak', textColor: 'text-orange-400' };
      case 3:
        return { color: 'bg-yellow-500', label: 'Fair', textColor: 'text-yellow-400' };
      case 4:
        return { color: 'bg-blue-500', label: 'Good', textColor: 'text-blue-400' };
      case 5:
        return { color: 'bg-green-500', label: 'Strong', textColor: 'text-green-400' };
      default:
        return { color: 'bg-zinc-500', label: 'Unknown', textColor: 'text-zinc-400' };
    }
  };

  const strengthInfo = getStrengthInfo(score);
  const requirementList = [
    { key: 'minLength', label: 'At least 8 characters', met: requirements.minLength },
    { key: 'hasUppercase', label: 'Uppercase letter (A-Z)', met: requirements.hasUppercase },
    { key: 'hasLowercase', label: 'Lowercase letter (a-z)', met: requirements.hasLowercase },
    { key: 'hasNumber', label: 'Number (0-9)', met: requirements.hasNumber },
    { key: 'hasSpecialChar', label: 'Special character (!@#$%)', met: requirements.hasSpecialChar },
    { key: 'noCommonPasswords', label: 'Not a common password', met: requirements.noCommonPasswords },
  ];

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-500">Password strength</span>
          <span className={cn("text-xs font-medium", strengthInfo.textColor)}>
            {strengthInfo.label}
          </span>
        </div>
        
        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", strengthInfo.color)}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirementList.map((req) => (
            <div 
              key={req.key}
              className="flex items-center gap-2 text-xs"
            >
              <span className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                req.met ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-500"
              )}>
                {req.met ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
              </span>
              <span className={cn(
                req.met ? "text-zinc-300" : "text-zinc-500"
              )}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && feedback.length > 0 && (
        <div className="space-y-1">
          {feedback.map((message, index) => (
            <p key={index} className="text-xs text-red-400">
              {message}
            </p>
          ))}
        </div>
      )}

      {/* Valid Indicator */}
      {isValid && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckIcon className="w-4 h-4" />
          <span>Password meets all requirements</span>
        </div>
      )}
    </div>
  );
}

// Standalone password input with strength meter
interface SecurePasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (value: string, isValid: boolean) => void;
  showStrengthMeter?: boolean;
}

export function SecurePasswordInput({ 
  label = 'Password',
  onChange,
  showStrengthMeter = true,
  className,
  ...props 
}: SecurePasswordInputProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { strength } = usePasswordStrength();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value) {
      const result = strength;
      onChange?.(value, result?.isValid ?? false);
    } else {
      onChange?.('', false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handleChange}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white",
              "placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "pr-10",
              className
            )}
            {...props}
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showStrengthMeter && <PasswordStrengthMeter password={password} />}
    </div>
  );
}
