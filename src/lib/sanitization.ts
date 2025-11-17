/**
 * Sanitization utility to prevent XSS attacks and ensure data integrity
 */

/**
 * Sanitize text input by removing HTML tags and dangerous characters
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  
  return String(input)
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: number | string | null | undefined, defaultValue = 0): number {
  if (input === null || input === undefined || input === '') return defaultValue;
  
  const num = typeof input === 'number' ? input : parseFloat(input);
  
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  
  return num;
}

/**
 * Sanitize chart data to prevent XSS and ensure data integrity
 */
export function sanitizeChartData<T extends Record<string, any>>(
  data: T[],
  textFields: (keyof T)[] = [],
  numericFields: (keyof T)[] = []
): T[] {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    const sanitized = { ...item };
    
    // Sanitize text fields
    textFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = sanitizeText(sanitized[field] as string) as T[keyof T];
      }
    });
    
    // Sanitize numeric fields
    numericFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = sanitizeNumber(sanitized[field]) as T[keyof T];
      }
    });
    
    return sanitized;
  });
}

/**
 * Sanitize object for safe rendering
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  textFields: (keyof T)[] = [],
  numericFields: (keyof T)[] = []
): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  textFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = sanitizeText(sanitized[field] as string) as T[keyof T];
    }
  });
  
  numericFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = sanitizeNumber(sanitized[field]) as T[keyof T];
    }
  });
  
  return sanitized;
}
