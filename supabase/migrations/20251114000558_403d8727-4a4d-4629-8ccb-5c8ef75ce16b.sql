-- Phase 1: Enhance scripts table with new columns
ALTER TABLE scripts
ADD COLUMN IF NOT EXISTS script_mode TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS series_id UUID,
ADD COLUMN IF NOT EXISTS episode_number INTEGER,
ADD COLUMN IF NOT EXISTS trend_id TEXT,
ADD COLUMN IF NOT EXISTS beat_markers JSONB,
ADD COLUMN IF NOT EXISTS hook_variations JSONB,
ADD COLUMN IF NOT EXISTS tts_optimized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fiction_disclaimer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS content_safety_flags JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scripts_series_id ON scripts(series_id);
CREATE INDEX IF NOT EXISTS idx_scripts_trend_id ON scripts(trend_id);
CREATE INDEX IF NOT EXISTS idx_scripts_mode ON scripts(script_mode);

-- Add check constraint for script_mode
ALTER TABLE scripts
ADD CONSTRAINT scripts_mode_check 
CHECK (script_mode IN ('standard', 'pov_skit', 'ai_storytime', 'mini_drama_series'));

-- Create series table
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  premise TEXT,
  total_episodes INTEGER DEFAULT 5,
  niche TEXT,
  tone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on series
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own series"
  ON series FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own series"
  ON series FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series"
  ON series FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series"
  ON series FOR DELETE
  USING (auth.uid() = user_id);

-- Add foreign key for series_id in scripts
ALTER TABLE scripts
ADD CONSTRAINT fk_scripts_series
FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;

-- Create trending_topics table
CREATE TABLE IF NOT EXISTS trending_topics (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  viral_score INTEGER DEFAULT 0,
  engagement_count TEXT,
  category TEXT,
  platform TEXT DEFAULT 'tiktok',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB
);

-- Enable RLS on trending_topics (public read)
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trends"
  ON trending_topics FOR SELECT
  USING (is_active = true);

-- Create trigger for updated_at on series
CREATE OR REPLACE FUNCTION update_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER series_updated_at
BEFORE UPDATE ON series
FOR EACH ROW
EXECUTE FUNCTION update_series_updated_at();