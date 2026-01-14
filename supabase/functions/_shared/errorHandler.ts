import { corsHeaders } from './corsHeaders.ts';

export interface ErrorResponse {
  error: string;
  details?: any;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  details?: any
): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  
  console.error('Error:', errorMessage, details);
  
  const body: ErrorResponse = {
    error: errorMessage,
    ...(details && { details })
  };

  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
