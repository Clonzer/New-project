/**
 * Security hooks for rate limiting, password validation, and session monitoring
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  checkRateLimit, 
  checkPasswordStrength, 
  PasswordStrength, 
  updateSessionActivity, 
  isSessionExpired,
  getSessionInactivityMinutes,
  resetRateLimit,
} from '@/utils/security';

// ============================================================================
// RATE LIMITING HOOK
// ============================================================================

interface UseRateLimitOptions {
  key: string;
  maxAttempts?: number;
  windowMs?: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number;
  isBlocked: boolean;
  remainingTime: number;
  canRetry: boolean;
}

export function useRateLimit(options: UseRateLimitOptions) {
  const { key, maxAttempts = 5, windowMs = 60000, blockDurationMs = 300000 } = options;
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    isBlocked: false,
    remainingTime: 0,
    canRetry: true,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkLimit = useCallback((): boolean => {
    const result = checkRateLimit(key, { maxAttempts, windowMs, blockDurationMs });
    
    setState({
      attempts: maxAttempts - result.remaining,
      isBlocked: result.blocked,
      remainingTime: result.retryAfter || 0,
      canRetry: result.allowed,
    });
    
    return result.allowed;
  }, [key, maxAttempts, windowMs, blockDurationMs]);

  const recordAttempt = useCallback((): boolean => {
    return checkLimit();
  }, [checkLimit]);

  const reset = useCallback(() => {
    resetRateLimit(key);
    setState({
      attempts: 0,
      isBlocked: false,
      remainingTime: 0,
      canRetry: true,
    });
  }, [key]);

  // Update countdown timer when blocked
  useEffect(() => {
    if (state.isBlocked && state.remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newTime = prev.remainingTime - 1;
          if (newTime <= 0) {
            // Time expired, re-check
            const result = checkRateLimit(key, { maxAttempts, windowMs, blockDurationMs });
            return {
              attempts: maxAttempts - result.remaining,
              isBlocked: result.blocked,
              remainingTime: result.retryAfter || 0,
              canRetry: result.allowed,
            };
          }
          return { ...prev, remainingTime: newTime };
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isBlocked, state.remainingTime, key, maxAttempts, windowMs, blockDurationMs]);

  return {
    ...state,
    recordAttempt,
    reset,
    formatRemainingTime: () => {
      const mins = Math.floor(state.remainingTime / 60);
      const secs = state.remainingTime % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    },
  };
}

// ============================================================================
// PASSWORD STRENGTH HOOK
// ============================================================================

export function usePasswordStrength() {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [password, setPassword] = useState('');

  const updatePassword = useCallback((newPassword: string) => {
    setPassword(newPassword);
    if (newPassword.length > 0) {
      setStrength(checkPasswordStrength(newPassword));
    } else {
      setStrength(null);
    }
  }, []);

  return {
    password,
    strength,
    updatePassword,
    isValid: strength?.isValid ?? false,
  };
}

// ============================================================================
// SESSION SECURITY HOOK
// ============================================================================

interface SessionSecurityOptions {
  timeoutMinutes?: number;
  onTimeout?: () => void;
}

export function useSessionSecurity(options: SessionSecurityOptions = {}) {
  const { timeoutMinutes = 30, onTimeout } = options;
  const [inactivityMinutes, setInactivityMinutes] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutMs = timeoutMinutes * 60 * 1000;

  // Track activity
  const recordActivity = useCallback(() => {
    updateSessionActivity();
    setInactivityMinutes(0);
    setIsExpired(false);
  }, []);

  // Check for session expiration
  const checkExpiration = useCallback(() => {
    const lastActivity = parseInt(sessionStorage.getItem('last_activity') || '0', 10);
    if (lastActivity && isSessionExpired(lastActivity)) {
      setIsExpired(true);
      onTimeout?.();
      return true;
    }
    return false;
  }, [onTimeout]);

  // Set up inactivity monitoring
  useEffect(() => {
    // Record initial activity
    recordActivity();

    // Activity events to monitor
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    const handleActivity = () => {
      recordActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check inactivity every minute
    intervalRef.current = setInterval(() => {
      const minutes = getSessionInactivityMinutes();
      setInactivityMinutes(minutes);
      
      if (minutes >= timeoutMinutes) {
        checkExpiration();
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recordActivity, checkExpiration, timeoutMinutes]);

  return {
    inactivityMinutes,
    isExpired,
    recordActivity,
    checkExpiration,
    isWarning: inactivityMinutes >= timeoutMinutes - 5, // Warning 5 minutes before timeout
  };
}

// ============================================================================
// SECURE FORM HOOK
// ============================================================================

interface SecureFormOptions {
  sanitize?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  required?: boolean;
}

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  isValid: boolean;
}

export function useSecureField(options: SecureFormOptions = {}) {
  const { sanitize = true, maxLength = 500, pattern, required = false } = options;
  const [state, setState] = useState<FieldState>({
    value: '',
    error: null,
    touched: false,
    isValid: !required,
  });

  const validate = useCallback((value: string): string | null => {
    if (required && !value.trim()) {
      return 'This field is required';
    }
    
    if (value.length > maxLength) {
      return `Maximum ${maxLength} characters allowed`;
    }
    
    if (pattern && value && !pattern.test(value)) {
      return 'Invalid format';
    }
    
    return null;
  }, [required, maxLength, pattern]);

  const setValue = useCallback((value: string) => {
    let sanitized = value;
    
    if (sanitize) {
      // Basic XSS prevention
      sanitized = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    }
    
    const error = validate(sanitized);
    setState({
      value: sanitized,
      error,
      touched: true,
      isValid: !error,
    });
  }, [sanitize, validate]);

  const onBlur = useCallback(() => {
    setState(prev => ({
      ...prev,
      touched: true,
      error: validate(prev.value),
    }));
  }, [validate]);

  return {
    ...state,
    setValue,
    onBlur,
    reset: () => setState({ value: '', error: null, touched: false, isValid: !required }),
  };
}

// ============================================================================
// ANTI-CSRF TOKEN HOOK
// ============================================================================

export function useCSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve CSRF token
    let csrfToken = sessionStorage.getItem('csrf_token');
    if (!csrfToken) {
      csrfToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      sessionStorage.setItem('csrf_token', csrfToken);
    }
    setToken(csrfToken);
  }, []);

  const refreshToken = useCallback(() => {
    const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('csrf_token', newToken);
    setToken(newToken);
  }, []);

  return { token, refreshToken };
}

// ============================================================================
// CLICKJACKING PROTECTION HOOK
// ============================================================================

export function useClickjackingProtection() {
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    // Check if site is being framed
    if (window.self !== window.top) {
      setIsFramed(true);
      
      // Attempt to break out of frame (optional)
      // if (confirm('This page is being displayed in an unauthorized frame. Continue?')) {
      //   window.top.location = window.self.location;
      // }
    }
  }, []);

  return { isFramed };
}
