import { supabase } from "@/integrations/supabase/client";

export interface GenerateScriptParams {
  niche: string;
  length: string;
  tone: string;
  topic: string;
  targetAudience?: string;
  trendingKeywords?: string;
  visualStyle?: string;
  scriptMode?: string;
  trendId?: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  scenes: Array<{
    id: number;
    timeStamp: string;
    dialogue: string;
    action: string;
    visual: string;
    sound: string;
  }>;
  hashtags: string[];
  callToAction?: string;
  viralScore?: number;
}

/**
 * Generate a script using the AI backend
 */
export async function generateScript(params: GenerateScriptParams): Promise<GeneratedScript> {
  const { data, error } = await supabase.functions.invoke('generate-script', {
    body: params
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate script');
  }

  return data.script;
}

/**
 * Save a script to the database
 */
export async function saveScript(script: GeneratedScript, params: GenerateScriptParams, userId: string) {
  const { data, error } = await supabase
    .from('scripts')
    .insert({
      user_id: userId,
      title: script.title,
      content: JSON.stringify(script),
      niche: params.niche,
      length: params.length,
      tone: params.tone,
      topic: params.topic,
      script_mode: params.scriptMode || 'standard',
      trend_id: params.trendId || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to save script');
  }

  return data;
}

/**
 * Fetch user's scripts
 */
export async function fetchUserScripts(userId: string) {
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch scripts');
  }

  return data;
}

/**
 * Analyze a script for viral potential
 */
export async function analyzeScript(scriptId: string, content: string, title: string, niche: string) {
  const { data, error } = await supabase.functions.invoke('analyze-script', {
    body: {
      scriptId,
      content,
      title,
      niche
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to analyze script');
  }

  return data;
}

/**
 * Fetch trending topics
 */
export async function fetchTrendingTopics() {
  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .eq('is_active', true)
    .order('viral_score', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message || 'Failed to fetch trends');
  }

  return data;
}
