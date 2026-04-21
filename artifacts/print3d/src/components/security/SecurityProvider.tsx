/**
 * Security Provider Component
 * Provides CSP headers, security monitoring, and context for the application
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSessionSecurity, useClickjackingProtection } from '@/hooks/use-security';

// ============================================================================
// SECURITY CONTEXT
// ============================================================================

interface SecurityContextType {
  // Session security
  inactivityMinutes: number;
  isSessionExpired: boolean;
  isWarning: boolean;
  recordActivity: () => void;
  
  // Clickjacking
  isFramed: boolean;
  
  // Security level
  securityLevel: 'low' | 'medium' | 'high';
  
  // Security features enabled
  features: {
    csrf: boolean;
    xss: boolean;
    rateLimit: boolean;
    sessionTimeout: boolean;
  };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
}

// ============================================================================
// SECURITY PROVIDER
// ============================================================================

interface SecurityProviderProps {
  children: ReactNode;
  sessionTimeoutMinutes?: number;
  securityLevel?: 'low' | 'medium' | 'high';
  onSessionTimeout?: () => void;
}

export function SecurityProvider({ 
  children, 
  sessionTimeoutMinutes = 30,
  securityLevel = 'medium',
  onSessionTimeout 
}: SecurityProviderProps) {
  // Session security monitoring
  const session = useSessionSecurity({
    timeoutMinutes: sessionTimeoutMinutes,
    onTimeout: onSessionTimeout,
  });
  
  // Clickjacking protection
  const { isFramed } = useClickjackingProtection();

  // Security features based on level
  const features = {
    low: { csrf: false, xss: false, rateLimit: false, sessionTimeout: false },
    medium: { csrf: true, xss: true, rateLimit: true, sessionTimeout: true },
    high: { csrf: true, xss: true, rateLimit: true, sessionTimeout: true },
  }[securityLevel];

  const value: SecurityContextType = {
    inactivityMinutes: session.inactivityMinutes,
    isSessionExpired: session.isExpired,
    isWarning: session.isWarning,
    recordActivity: session.recordActivity,
    isFramed,
    securityLevel,
    features,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

// ============================================================================
// CONTENT SECURITY POLICY META TAG
// ============================================================================

interface CSPMetaProps {
  policy?: string;
}

export function CSPMetaTag({ policy }: CSPMetaProps) {
  useEffect(() => {
    // Remove any existing CSP meta tag
    const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existing) {
      existing.remove();
    }

    // Create new CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    
    // Default CSP policy
    const defaultPolicy = policy || [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' https: data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https://*.stripe.com",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');

    meta.content = defaultPolicy;
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, [policy]);

  return null;
}

// ============================================================================
// SECURITY HEADERS COMPONENT
// ============================================================================

export function SecurityHeaders() {
  useEffect(() => {
    // Set security-related meta tags
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    ];

    headers.forEach(({ name, content }) => {
      // Remove existing
      const existing = document.querySelector(`meta[http-equiv="${name}"]`);
      if (existing) existing.remove();

      // Add new
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      document.head.appendChild(meta);
    });

    return () => {
      headers.forEach(({ name }) => {
        const meta = document.querySelector(`meta[http-equiv="${name}"]`);
        if (meta) meta.remove();
      });
    };
  }, []);

  return null;
}

// ============================================================================
// SESSION TIMEOUT WARNING MODAL
// ============================================================================

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  remainingMinutes: number;
  onContinue: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({ 
  isOpen, 
  remainingMinutes, 
  onContinue, 
  onLogout 
}: SessionTimeoutWarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Timeout Warning</h2>
          <p className="text-zinc-400">
            Your session will expire in {remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''} due to inactivity.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-3 transition-colors"
          >
            Continue Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 rounded-xl border border-white/20 hover:bg-white/5 text-white font-semibold py-3 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECURITY MONITORING WRAPPER
// ============================================================================

interface SecurityMonitorProps {
  children: ReactNode;
  onSecurityEvent?: (event: { type: string; details: unknown }) => void;
}

export function SecurityMonitor({ children, onSecurityEvent }: SecurityMonitorProps) {
  const security = useSecurity();

  useEffect(() => {
    // Monitor and report security events
    if (security.isFramed) {
      onSecurityEvent?.({
        type: 'clickjacking_detected',
        details: { timestamp: new Date().toISOString() },
      });
    }

    if (security.isSessionExpired) {
      onSecurityEvent?.({
        type: 'session_timeout',
        details: { 
          inactivityMinutes: security.inactivityMinutes,
          timestamp: new Date().toISOString() 
        },
      });
    }
  }, [security.isFramed, security.isSessionExpired, security.inactivityMinutes, onSecurityEvent]);

  return <>{children}</>;
}

// ============================================================================
// ANTI-DEVTOOLS (Optional - for high security)
// ============================================================================

export function AntiDevTools({ enabled = false }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        console.warn('Developer tools detected');
      }
    };

    window.addEventListener('resize', checkDevTools);
    const interval = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('resize', checkDevTools);
      clearInterval(interval);
    };
  }, [enabled]);

  return null;
}
