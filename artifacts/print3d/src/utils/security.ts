/**
 * Security utilities for input sanitization, validation, and protection
 */

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses a whitelist approach for allowed tags
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  
  // Allowed HTML tags (whitelist approach)
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'];
  
  // First, escape all HTML entities
  let sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Then un-escape allowed tags
  allowedTags.forEach(tag => {
    // Opening tags
    const openRegex = new RegExp(`&lt;${tag}(\s[^&]*)?&gt;`, 'gi');
    sanitized = sanitized.replace(openRegex, `<${tag}$1>`);
    
    // Closing tags
    const closeRegex = new RegExp(`&lt;\/${tag}&gt;`, 'gi');
    sanitized = sanitized.replace(closeRegex, `</${tag}>`);
  });
  
  // Remove any remaining escaped HTML tags (not in whitelist)
  sanitized = sanitized.replace(/&lt;[^&]*&gt;/g, '');
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized;
}

/**
 * Sanitize plain text - removes all HTML-like content
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9._%+-@]/g, '');
}

/**
 * Sanitize URL - only allow http/https protocols
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  const sanitized = url.trim();
  
  // Only allow http/https protocols
  if (!/^https?:\/\//i.test(sanitized)) {
    // If no protocol, assume https
    if (!sanitized.startsWith('http')) {
      return `https://${sanitized}`;
    }
  }
  
  // Block javascript/data protocols
  if (/^(javascript|data|vbscript|file):/i.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-5
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    noCommonPasswords: boolean;
  };
  feedback: string[];
}

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', 'letmein', 'dragon', '111111', 'baseball',
  'iloveyou', 'trustno1', 'sunshine', 'princess', 'admin',
  'welcome', 'shadow', 'ashley', 'football', 'jesus',
  'michael', 'ninja', 'mustang', 'password1', '123456789',
  'adobe123', 'admin123', 'letmein1', 'photoshop', '1234567',
];

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPasswords: !COMMON_PASSWORDS.includes(password.toLowerCase()),
  };

  let score = 0;
  const feedback: string[] = [];

  if (!requirements.minLength) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  if (!requirements.hasUppercase || !requirements.hasLowercase) {
    feedback.push('Use both uppercase and lowercase letters');
  } else {
    score++;
  }

  if (!requirements.hasNumber) {
    feedback.push('Include at least one number');
  } else {
    score++;
  }

  if (!requirements.hasSpecialChar) {
    feedback.push('Include at least one special character (!@#$%^&*)');
  } else {
    score++;
  }

  if (!requirements.noCommonPasswords) {
    feedback.push('This password is too common - choose something unique');
  } else {
    score++;
  }

  return {
    score,
    isValid: score >= 4 && requirements.noCommonPasswords,
    requirements,
    feedback,
  };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blocked: boolean;
  blockExpiry?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 60000, // 1 minute
  blockDurationMs: 300000, // 5 minutes
};

/**
 * Check if action is rate limited
 */
export function checkRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; blocked: boolean; retryAfter?: number } {
  const { maxAttempts, windowMs, blockDurationMs } = { ...DEFAULT_RATE_LIMIT, ...config };
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  // Check if currently blocked
  if (entry?.blocked && entry.blockExpiry) {
    if (now < entry.blockExpiry) {
      return {
        allowed: false,
        remaining: 0,
        blocked: true,
        retryAfter: Math.ceil((entry.blockExpiry - now) / 1000),
      };
    }
    // Block expired, reset
    rateLimitStore.delete(key);
  }
  
  // No entry or window expired
  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
      blocked: false,
    });
    return { allowed: true, remaining: maxAttempts - 1, blocked: false };
  }
  
  // Within window
  entry.count++;
  
  if (entry.count > maxAttempts) {
    entry.blocked = true;
    entry.blockExpiry = now + (blockDurationMs || 300000);
    return {
      allowed: false,
      remaining: 0,
      blocked: true,
      retryAfter: Math.ceil((blockDurationMs || 300000) / 1000),
    };
  }
  
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    blocked: false,
  };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ============================================================================
// VALIDATION
// ============================================================================

export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  username: /^[a-zA-Z0-9_-]{3,32}$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return ValidationPatterns.email.test(email);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  return ValidationPatterns.username.test(username);
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
  
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be under ${maxSizeMB}MB` };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Only ${allowedTypes.join(', ')} files are allowed` };
  }
  
  // Check for executable content in filename
  const dangerousExtensions = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.php', '.js'];
  const lowerName = file.name.toLowerCase();
  if (dangerousExtensions.some(ext => lowerName.endsWith(ext))) {
    return { valid: false, error: 'Executable files are not allowed' };
  }
  
  return { valid: true };
}

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
}

/**
 * Get stored CSRF token
 */
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('csrf_token');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const stored = getCSRFToken();
  return stored !== null && stored === token;
}

// ============================================================================
// SECURE STORAGE
// ============================================================================

const STORAGE_PREFIX = 'synthix_';

/**
 * Securely store data with encryption (basic XOR for demonstration)
 * In production, use proper encryption or don't store sensitive data client-side
 */
export function secureSetItem(key: string, value: string, encryptionKey?: string): void {
  const prefixedKey = STORAGE_PREFIX + key;
  
  if (!encryptionKey) {
    localStorage.setItem(prefixedKey, value);
    return;
  }
  
  // Simple XOR encryption - replace with proper encryption in production
  let encrypted = '';
  for (let i = 0; i < value.length; i++) {
    encrypted += String.fromCharCode(
      value.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length)
    );
  }
  
  localStorage.setItem(prefixedKey, btoa(encrypted));
}

/**
 * Retrieve and decrypt data
 */
export function secureGetItem(key: string, encryptionKey?: string): string | null {
  const prefixedKey = STORAGE_PREFIX + key;
  const value = localStorage.getItem(prefixedKey);
  
  if (!value || !encryptionKey) return value;
  
  try {
    const encrypted = atob(value);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length)
      );
    }
    return decrypted;
  } catch {
    return null;
  }
}

/**
 * Remove secure item
 */
export function secureRemoveItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

// ============================================================================
// SECURITY HEADERS (for API calls)
// ============================================================================

export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://*.supabase.co;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// ============================================================================
// CONTENT SCANNING
// ============================================================================

const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*['"]*javascript/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

/**
 * Scan content for suspicious patterns
 */
export function scanContent(content: string): { clean: boolean; threats: string[] } {
  const threats: string[] = [];
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      threats.push(`Detected pattern: ${pattern.source.slice(0, 30)}...`);
    }
  }
  
  return { clean: threats.length === 0, threats };
}

// ============================================================================
// SESSION SECURITY
// ============================================================================

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface SessionData {
  lastActivity: number;
  loginTime: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Check if session has expired due to inactivity
 */
export function isSessionExpired(lastActivity: number): boolean {
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('last_activity', Date.now().toString());
  }
}

/**
 * Get session inactivity time in minutes
 */
export function getSessionInactivityMinutes(): number {
  if (typeof window === 'undefined') return 0;
  const lastActivity = parseInt(sessionStorage.getItem('last_activity') || '0', 10);
  if (!lastActivity) return 0;
  return Math.floor((Date.now() - lastActivity) / 60000);
}

// ============================================================================
// API SECURITY
// ============================================================================

/**
 * Add security headers to fetch request
 */
export function createSecureFetchOptions(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
    },
    credentials: 'same-origin',
  };
}

/**
 * Validate API response for security issues
 */
export function validateAPIResponse(response: Response): { safe: boolean; error?: string } {
  // Check content type
  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    return { safe: false, error: 'Unexpected content type from server' };
  }
  
  return { safe: true };
}
