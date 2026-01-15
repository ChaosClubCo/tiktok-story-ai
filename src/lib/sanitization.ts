/**
 * Sanitization utility to prevent XSS attacks and ensure data integrity
 * @module sanitization
 */

// Common XSS patterns to filter
const XSS_PATTERNS = [
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<!--[\s\S]*?-->/g,
  /expression\s*\(/gi,
] as const;

/**
 * Sanitize text input by removing HTML tags and dangerous characters
 * @param input - The input string to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeText(
  input: string | null | undefined,
  maxLength = 1000
): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input).slice(0, maxLength);
  
  let sanitized = input;
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove XSS patterns
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized.trim().slice(0, maxLength);
}

/**
 * Sanitize text for display in HTML (escape special characters)
 * @param input - The input string to escape
 * @returns HTML-escaped string
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input) return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return String(input).replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Sanitize numeric input with bounds checking
 * @param input - The input to sanitize
 * @param defaultValue - Default value if invalid (default: 0)
 * @param options - Optional min/max bounds
 * @returns Sanitized number
 */
export function sanitizeNumber(
  input: number | string | null | undefined,
  defaultValue = 0,
  options?: { min?: number; max?: number }
): number {
  if (input === null || input === undefined || input === '') return defaultValue;
  
  const num = typeof input === 'number' ? input : parseFloat(String(input));
  
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  
  let result = num;
  
  if (options?.min !== undefined && result < options.min) {
    result = options.min;
  }
  
  if (options?.max !== undefined && result > options.max) {
    result = options.max;
  }
  
  return result;
}

/**
 * Sanitize and validate email address
 * @param input - The email to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return '';
  
  const sanitized = sanitizeText(input, 254).toLowerCase();
  
  // Basic email validation pattern
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailPattern.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize and validate URL
 * @param input - The URL to validate
 * @param allowedProtocols - Allowed protocols (default: ['http:', 'https:'])
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  input: string | null | undefined,
  allowedProtocols: string[] = ['http:', 'https:']
): string {
  if (!input) return '';
  
  try {
    const sanitized = sanitizeText(input, 2048);
    const url = new URL(sanitized);
    
    if (!allowedProtocols.includes(url.protocol)) {
      return '';
    }
    
    return url.href;
  } catch {
    return '';
  }
}

/**
 * Sanitize chart data to prevent XSS and ensure data integrity
 * @param data - Array of data objects
 * @param textFields - Fields to sanitize as text
 * @param numericFields - Fields to sanitize as numbers
 * @returns Sanitized data array
 */
export function sanitizeChartData<T extends object>(
  data: T[],
  textFields: (keyof T)[] = [],
  numericFields: (keyof T)[] = []
): T[] {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    if (!item || typeof item !== 'object') return item;
    
    const sanitized = { ...item };
    
    // Sanitize text fields
    for (const field of textFields) {
      if (field in sanitized) {
        (sanitized as Record<keyof T, unknown>)[field] = sanitizeText(sanitized[field] as string);
      }
    }
    
    // Sanitize numeric fields
    for (const field of numericFields) {
      if (field in sanitized) {
        (sanitized as Record<keyof T, unknown>)[field] = sanitizeNumber(sanitized[field] as number);
      }
    }
    
    return sanitized;
  });
}

/**
 * Sanitize object for safe rendering
 * @param obj - Object to sanitize
 * @param textFields - Fields to sanitize as text
 * @param numericFields - Fields to sanitize as numbers
 * @returns Sanitized object
 */
export function sanitizeObject<T extends object>(
  obj: T,
  textFields: (keyof T)[] = [],
  numericFields: (keyof T)[] = []
): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  for (const field of textFields) {
    if (field in sanitized) {
      (sanitized as Record<keyof T, unknown>)[field] = sanitizeText(sanitized[field] as string);
    }
  }
  
  for (const field of numericFields) {
    if (field in sanitized) {
      (sanitized as Record<keyof T, unknown>)[field] = sanitizeNumber(sanitized[field] as number);
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize form input based on type
 * @param value - The input value
 * @param type - The expected type
 * @param options - Additional validation options
 * @returns Validation result with sanitized value
 */
export function validateFormInput(
  value: unknown,
  type: 'text' | 'email' | 'number' | 'url',
  options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }
): { valid: boolean; value: string | number; error?: string } {
  const { required = false, minLength, maxLength, min, max } = options ?? {};
  
  // Check required
  if (required && (value === null || value === undefined || value === '')) {
    return { valid: false, value: '', error: 'This field is required' };
  }
  
  if (!required && (value === null || value === undefined || value === '')) {
    return { valid: true, value: type === 'number' ? 0 : '' };
  }
  
  switch (type) {
    case 'email': {
      const sanitized = sanitizeEmail(value as string);
      if (!sanitized) {
        return { valid: false, value: '', error: 'Please enter a valid email address' };
      }
      return { valid: true, value: sanitized };
    }
    
    case 'url': {
      const sanitized = sanitizeUrl(value as string);
      if (!sanitized) {
        return { valid: false, value: '', error: 'Please enter a valid URL' };
      }
      return { valid: true, value: sanitized };
    }
    
    case 'number': {
      const sanitized = sanitizeNumber(value as number, NaN, { min, max });
      if (isNaN(sanitized)) {
        return { valid: false, value: 0, error: 'Please enter a valid number' };
      }
      return { valid: true, value: sanitized };
    }
    
    case 'text':
    default: {
      const sanitized = sanitizeText(value as string, maxLength);
      if (minLength && sanitized.length < minLength) {
        return { valid: false, value: sanitized, error: `Minimum ${minLength} characters required` };
      }
      return { valid: true, value: sanitized };
    }
  }
}
