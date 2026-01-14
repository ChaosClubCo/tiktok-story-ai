import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { truncateUserId } from "../_shared/piiMasking.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Manual trending topics (can be updated via admin dashboard or cron job)
const CURATED_TRENDS = [
  {
    id: 'ai_storytime_2025',
    topic: 'AI Voiceover Storytime',
    viral_score: 95,
    engagement_count: '10M+ views',
    category: 'storytime',
    platform: 'tiktok',
    metadata: { keywords: ['ai voice', 'storytime', 'chaotic', 'dramatic'] }
  },
  {
    id: 'pov_breakup_drama',
    topic: 'POV: Toxic relationship breakup',
    viral_score: 88,
    engagement_count: '8.5M+ views',
    category: 'pov',
    platform: 'tiktok',
    metadata: { keywords: ['pov', 'breakup', 'drama', 'toxic'] }
  },
  {
    id: 'first_day_disaster',
    topic: 'POV: First day at new job disasters',
    viral_score: 82,
    engagement_count: '6.2M+ views',
    category: 'workplace',
    platform: 'tiktok',
    metadata: { keywords: ['first day', 'workplace', 'comedy', 'relatable'] }
  },
  {
    id: 'wrong_text_sent',
    topic: 'Accidentally texting the wrong person',
    viral_score: 90,
    engagement_count: '12M+ views',
    category: 'comedy',
    platform: 'tiktok',
    metadata: { keywords: ['texting', 'wrong person', 'embarrassing', 'panic'] }
  },
  {
    id: 'overheard_conversation',
    topic: 'Overhearing people talk about you',
    viral_score: 85,
    engagement_count: '7.8M+ views',
    category: 'drama',
    platform: 'tiktok',
    metadata: { keywords: ['overheard', 'gossip', 'confrontation'] }
  },
  {
    id: 'fake_expertise',
    topic: 'POV: You lied about a skill and got caught',
    viral_score: 78,
    engagement_count: '5.5M+ views',
    category: 'comedy',
    platform: 'tiktok',
    metadata: { keywords: ['fake it', 'caught', 'comedy', 'work'] }
  },
  {
    id: 'zoom_fail_2025',
    topic: 'Work from home call disasters',
    viral_score: 80,
    engagement_count: '6.8M+ views',
    category: 'workplace',
    platform: 'tiktok',
    metadata: { keywords: ['zoom', 'wfh', 'embarrassing', 'pets'] }
  },
  {
    id: 'group_chat_exposed',
    topic: 'Group chat getting exposed',
    viral_score: 92,
    engagement_count: '11M+ views',
    category: 'drama',
    platform: 'tiktok',
    metadata: { keywords: ['group chat', 'exposed', 'screenshots', 'drama'] }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin', { _user_id: user.id });
    
    if (roleError || !isAdmin) {
      console.error('Admin check failed:', roleError?.message);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${truncateUserId(user.id)} updating trending topics...`);

    // Upsert curated trends
    const { data, error } = await supabase
      .from('trending_topics')
      .upsert(
        CURATED_TRENDS.map(trend => ({
          ...trend,
          last_updated: new Date().toISOString(),
          is_active: true
        })),
        { onConflict: 'id' }
      );

    if (error) throw error;

    console.log(`Successfully updated ${CURATED_TRENDS.length} trending topics`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: CURATED_TRENDS.length,
        trends: CURATED_TRENDS.map(t => t.topic)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating trends:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
