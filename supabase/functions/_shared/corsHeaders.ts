/**
 * Shared CORS headers for all edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}
