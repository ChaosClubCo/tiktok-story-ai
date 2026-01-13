import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflightRequest } from '../_shared/corsHeaders.ts';
import { verifyAuth, verifyAdminRole, logAdminAction } from '../_shared/authHelpers.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/errorHandler.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth(req);
    if (authError || !user) {
      return createErrorResponse(authError || 'Unauthorized', 401);
    }

    // Verify admin role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const isAdmin = await verifyAdminRole(supabase, user.id);
    if (!isAdmin) {
      return createErrorResponse('Admin access required', 403);
    }

    // Parse request body
    const { keyName } = await req.json();

    if (!keyName) {
      return createErrorResponse('Key name is required', 400);
    }

    // Validate key name
    const allowedKeys = [
      'OPENAI_API_KEY',
      'ELEVENLABS_API_KEY',
      'STRIPE_SECRET_KEY',
      'RESEND_API_KEY',
      'POSTHOG_API_KEY'
    ];

    if (!allowedKeys.includes(keyName)) {
      return createErrorResponse('Invalid key name', 400);
    }

    console.log(`Rotating API key: ${keyName} by admin: ${user.id}`);

    // Log admin action
    await logAdminAction(
      supabase,
      user.id,
      'rotate_api_key',
      'api_key',
      req,
      keyName,
      { keyName, timestamp: new Date().toISOString() }
    );

    // In a production environment, you would:
    // 1. Generate a new key with the external service (OpenAI, ElevenLabs, etc.)
    // 2. Update Supabase secrets with the new key
    // 3. Invalidate the old key with the service
    // 4. Return the new key (to be saved by admin)

    // For now, return a mock response
    // In production, integrate with actual key rotation APIs
    
    const mockNewKey = `sk-${crypto.randomUUID().replace(/-/g, '')}`;

    // TODO: Implement actual key rotation logic
    // Example for OpenAI:
    // const openaiResponse = await fetch('https://api.openai.com/v1/api-keys', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${oldKey}`,
    //     'Content-Type': 'application/json'
    //   }
    // });

    console.log(`API key rotation simulated for ${keyName}`);

    return createSuccessResponse({
      success: true,
      message: 'API key rotation initiated',
      keyName,
      newKey: mockNewKey,
      rotatedAt: new Date().toISOString(),
      warning: 'This is a mock implementation. Production requires integration with service APIs.'
    });

  } catch (error) {
    console.error('API key rotation error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
  }
});
