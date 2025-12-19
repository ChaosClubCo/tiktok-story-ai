/**
 * Request Throttling Utilities
 * Provides throttling and debouncing for API calls
 */

type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T> | undefined;

/**
 * Creates a throttled version of a function
 * Only allows execution once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ThrottledFunction<T> {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function throttled(...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= delayMs) {
      lastCall = now;
      return fn(...args);
    }
    
    // Schedule trailing call
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, delayMs - timeSinceLastCall);
    }
    
    return undefined;
  };
}

/**
 * Creates a debounced version of a function
 * Only executes after delay has passed without new calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function debounced(...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Request queue with concurrency control
 * Limits the number of concurrent requests
 */
export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private activeCount = 0;
  private readonly maxConcurrent: number;
  private readonly delayBetweenMs: number;

  constructor(maxConcurrent = 3, delayBetweenMs = 100) {
    this.maxConcurrent = maxConcurrent;
    this.delayBetweenMs = delayBetweenMs;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      this.queue.push(wrappedRequest);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.activeCount++;
    
    try {
      await request();
    } finally {
      this.activeCount--;
      
      // Add delay between requests
      if (this.delayBetweenMs > 0 && this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenMs));
      }
      
      this.processQueue();
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.activeCount;
  }

  clear(): void {
    this.queue = [];
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Pre-configured request queue for API calls
export const apiQueue = new RequestQueue(5, 100);
