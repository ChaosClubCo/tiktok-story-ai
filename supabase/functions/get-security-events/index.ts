import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflightRequest } from '../_shared/corsHeaders.ts';
import { verifyAuth, verifyAdminRole } from '../_shared/authHelpers.ts';
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
    const { limit = 50, offset = 0, severity, type } = await req.json();

    console.log(`Fetching security events for admin: ${user.id}`);

    // In production, these would come from a security_events table
    // For now, return mock data structure
    const mockEvents = [
      {
        id: crypto.randomUUID(),
        type: 'auth_attempt',
        severity: 'low',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: { email: 'us***@example.com', success: true }
      },
      {
        id: crypto.randomUUID(),
        type: 'rate_limit',
        severity: 'medium',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: { endpoint: 'demo-viral-score', attempts: 15 }
      },
      {
        id: crypto.randomUUID(),
        type: 'auth_attempt',
        severity: 'medium',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        details: { email: 'te***@example.com', success: false }
      }
    ];

    // Filter by severity and type if provided
    let filteredEvents = mockEvents;
    if (severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === severity);
    }
    if (type) {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    return createSuccessResponse({
      events: paginatedEvents,
      total: filteredEvents.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Get security events error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Internal server error', 500);
  }
});
