/**
 * Client-Side Error Tracking and Reporting
 * Captures runtime errors with stack traces for production monitoring
 */

import { analytics } from './analytics';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  type: 'error' | 'unhandledrejection' | 'react' | 'network';
  timestamp: string;
  url: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

interface ErrorReport {
  errors: ErrorInfo[];
  sessionId: string;
  userId?: string;
}

// Store errors for batched reporting
const errorBuffer: ErrorInfo[] = [];
const MAX_BUFFER_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000;

// Generate unique session ID
const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Parse stack trace into structured format
function parseStackTrace(stack?: string): Array<{ file: string; line: number; column: number; function: string }> {
  if (!stack) return [];
  
  const lines = stack.split('\n').slice(1); // Skip first line (error message)
  const parsed: Array<{ file: string; line: number; column: number; function: string }> = [];
  
  for (const line of lines.slice(0, 10)) { // Limit to 10 frames
    const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
                  line.match(/at\s+(.+?):(\d+):(\d+)/);
    
    if (match) {
      if (match.length === 5) {
        parsed.push({
          function: match[1] || 'anonymous',
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10),
        });
      } else if (match.length === 4) {
        parsed.push({
          function: 'anonymous',
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
        });
      }
    }
  }
  
  return parsed;
}

// Create error info object
function createErrorInfo(
  error: Error | string,
  type: ErrorInfo['type'],
  metadata?: Record<string, unknown>
): ErrorInfo {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  return {
    message: errorObj.message || String(error),
    stack: errorObj.stack,
    type,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    metadata: {
      ...metadata,
      parsedStack: parseStackTrace(errorObj.stack),
    },
  };
}

// Report single error immediately
function reportError(errorInfo: ErrorInfo) {
  // Log in development
  if (import.meta.env.DEV) {
    console.group(`🔴 Error Tracked: ${errorInfo.type}`);
    console.error(errorInfo.message);
    console.log('Stack:', errorInfo.stack);
    console.log('Metadata:', errorInfo.metadata);
    console.groupEnd();
  }

  // Send to analytics
  analytics.track('client_error', {
    error_message: errorInfo.message.substring(0, 500), // Truncate long messages
    error_type: errorInfo.type,
    error_stack: errorInfo.stack?.substring(0, 2000),
    page_url: errorInfo.url,
    session_id: sessionId,
    ...errorInfo.metadata,
  });
}

// Add error to buffer and flush if needed
function bufferError(errorInfo: ErrorInfo) {
  errorBuffer.push(errorInfo);
  
  if (errorBuffer.length >= MAX_BUFFER_SIZE) {
    flushErrors();
  }
}

// Flush buffered errors
function flushErrors() {
  if (errorBuffer.length === 0) return;
  
  const errors = errorBuffer.splice(0, errorBuffer.length);
  
  const report: ErrorReport = {
    errors,
    sessionId,
  };

  // Send batch to analytics
  analytics.track('client_error_batch', {
    error_count: errors.length,
    errors: errors.map(e => ({
      message: e.message.substring(0, 200),
      type: e.type,
      timestamp: e.timestamp,
    })),
    session_id: sessionId,
  });

  if (import.meta.env.DEV) {
    console.log(`📤 Flushed ${errors.length} errors`, report);
  }
}

// Global error handler
function handleGlobalError(event: ErrorEvent) {
  event.preventDefault();
  
  const errorInfo = createErrorInfo(event.error || event.message, 'error', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  
  reportError(errorInfo);
  bufferError(errorInfo);
}

// Unhandled promise rejection handler
function handleUnhandledRejection(event: PromiseRejectionEvent) {
  event.preventDefault();
  
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason));
  
  const errorInfo = createErrorInfo(error, 'unhandledrejection', {
    reason: String(event.reason).substring(0, 500),
  });
  
  reportError(errorInfo);
  bufferError(errorInfo);
}

// Network error tracking
export function trackNetworkError(
  url: string,
  status: number,
  statusText: string,
  method: string = 'GET'
) {
  const errorInfo = createErrorInfo(
    new Error(`Network error: ${method} ${url} - ${status} ${statusText}`),
    'network',
    {
      request_url: url,
      status_code: status,
      status_text: statusText,
      method,
    }
  );
  
  reportError(errorInfo);
}

// React error tracking (for Error Boundaries)
export function trackReactError(
  error: Error,
  errorInfo: { componentStack?: string }
) {
  const tracked = createErrorInfo(error, 'react', {
    componentStack: errorInfo.componentStack?.substring(0, 1000),
  });
  
  tracked.componentStack = errorInfo.componentStack;
  reportError(tracked);
  bufferError(tracked);
}

// Manual error tracking
export function trackError(
  error: Error | string,
  metadata?: Record<string, unknown>
) {
  const errorInfo = createErrorInfo(error, 'error', metadata);
  reportError(errorInfo);
  bufferError(errorInfo);
}

// Get error statistics for current session
export function getErrorStats() {
  return {
    sessionId,
    totalErrors: errorBuffer.length,
    errorsByType: errorBuffer.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Initialize error tracking
 * Call this once when the app loads
 */
export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  // Add global event listeners
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Set up periodic flush
  setInterval(flushErrors, FLUSH_INTERVAL_MS);

  // Flush on page unload
  window.addEventListener('beforeunload', flushErrors);

  if (import.meta.env.DEV) {
    console.log('🛡️ Error tracking initialized');
  }
}

/**
 * Cleanup error tracking
 */
export function cleanupErrorTracking() {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  flushErrors();
}
