// Rate limiting utility using in-memory storage
// In production, consider using Redis or Supabase for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string; // IP address or user ID
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const key = config.identifier;
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}
