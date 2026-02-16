import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { truncateUserId } from "../_shared/piiMasking.ts";
import { corsHeaders } from "../_shared/corsHeaders.ts";

interface TrendItem {
  id: string;
  topic: string;
  viral_score: number;
  engagement_count: string;
  category: string;
  platform: string;
  metadata: { keywords: string[] };
}

const CURATED_TRENDS: TrendItem[] = [
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

// Helper to normalized counts (e.g. 1200000 -> 1.2M)
function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
  return num.toString();
}

interface ApifyTrendStats {
  playCount: number;
}

interface ApifyChallenge {
  title: string;
}

interface ApifyTrendItem {
  id: string;
  desc: string;
  stats: ApifyTrendStats;
  challenges: ApifyChallenge[];
}

async function fetchRealtimeTrends(): Promise<TrendItem[] | null> {
  const token = Deno.env.get('APIFY_API_TOKEN');
  if (!token) return null;

  try {
    // Using simple TikTok Scraper actor (e.g. novi/tiktok-trend-api or clockworks/free-tiktok-scraper)
    // For this example, we'll hit the Apify run-sync endpoint for a specific actor.
    // Actor ID for "TikTok Trends": 'OtzYfK1ndEGdwWpKq' (novi/tiktok-trend-api) is a good candidate.
    const actorId = 'OtzYfK1ndEGdwWpKq'; 
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;
    
    // Input for the actor (fetching trending feed)
    const input = { count: 10, type: 'trend' }; // generic input structure

    console.log('Fetching live trends from Apify...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      console.warn(`Apify API failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const items: unknown = await response.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    // Use a type guard or explicit casting with runtime checks if possible, but for now we cast to mapped type
    // We filter for items that match our structure
    return (items as ApifyTrendItem[]).map((item) => ({
      id: item.id || `tiktok_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      topic: item.desc ? item.desc.split('#')[0].trim().substring(0, 100) : 'Trending TikTok Video',
      viral_score: Math.min(Math.floor((item.stats?.playCount || 0) / 100000), 100), // simplistic score
      engagement_count: formatCount(item.stats?.playCount || 0) + ' views',
      category: 'trending',
      platform: 'tiktok',
      metadata: { 
        keywords: (item.challenges || []).map((c) => c.title) 
      }
    })).filter(t => t.topic.length > 0).slice(0, 10);

  } catch (err) {
    console.error('Failed to fetch realtime trends:', err);
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth Logic: Check if Cron or Admin
    const url = new URL(req.url);
    const isCron = url.searchParams.get('source') === 'cron';
    let userId = 'system';

    if (isCron) {
      const authHeader = req.headers.get('Authorization');
      const cronSecret = Deno.env.get('CRON_SECRET');
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized Cron' }), { status: 401, headers: corsHeaders });
      }
      console.log('Running via Cron...');
    } else {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('Missing auth header');
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) throw new Error('Invalid token');
      
      const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
      if (!isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
      userId = user.id;
    }

    let trends = await fetchRealtimeTrends();
    let source = 'apify';

    if (!trends) {
      console.log('Falling back to curated trends');
      trends = CURATED_TRENDS;
      source = 'curated_fallback';
    }

    // Upsert logic
    const { error: upsertError } = await supabase
      .from('trending_topics')
      .upsert(
        trends.map(trend => ({
          ...trend,
          last_updated: new Date().toISOString(),
          is_active: true
        })),
        { onConflict: 'id' }
      );

    if (upsertError) throw upsertError;

    console.log(`Action by ${isCron ? 'Cron' : truncateUserId(userId)}: Updated ${trends.length} trends via ${source}`);

    return new Response(
      JSON.stringify({ success: true, count: trends.length, source, trends: trends.map((t: TrendItem) => t.topic) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: corsHeaders });
  }
});
