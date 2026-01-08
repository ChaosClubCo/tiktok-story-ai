/**
 * PII Masking Utility for GDPR/CCPA Compliance
 * 
 * Masks sensitive personally identifiable information in logs
 * to comply with privacy regulations while maintaining debuggability.
 */

/**
 * Masks an email address by showing only the first character and domain
 * Example: john.doe@example.com -> j***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '***@***.***';
  }
  
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 0 ? `${localPart[0]}***` : '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Truncates a UUID to show only the first 8 characters
 * Example: 550e8400-e29b-41d4-a716-446655440000 -> 550e8400...
 */
export function truncateUserId(userId: string): string {
  if (!userId || typeof userId !== 'string') {
    return '***...';
  }
  
  return userId.length > 8 ? `${userId.slice(0, 8)}...` : userId;
}

/**
 * Creates a privacy-safe log object with masked PII
 * Use this for logging user-related information
 */
export function maskUserInfo(user: { id: string; email: string }): { userId: string; email: string } {
  return {
    userId: truncateUserId(user.id),
    email: maskEmail(user.email)
  };
}

/**
 * Masks sensitive data in a generic object
 * Automatically detects and masks common PII fields
 */
export function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const masked = { ...data };
  
  // Mask common PII fields
  if (masked.email && typeof masked.email === 'string') {
    masked.email = maskEmail(masked.email);
  }
  
  if (masked.userId && typeof masked.userId === 'string') {
    masked.userId = truncateUserId(masked.userId);
  }
  
  if (masked.user_id && typeof masked.user_id === 'string') {
    masked.user_id = truncateUserId(masked.user_id);
  }
  
  return masked;
}
