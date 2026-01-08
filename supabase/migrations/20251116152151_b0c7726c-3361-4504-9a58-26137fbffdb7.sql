-- Create script_versions table for version history
CREATE TABLE IF NOT EXISTS public.script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  niche TEXT,
  length TEXT,
  tone TEXT,
  topic TEXT,
  change_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viral_score INTEGER,
  prediction_id UUID REFERENCES public.predictions_history(id),
  UNIQUE(script_id, version_number)
);

-- Add version tracking columns to scripts table
ALTER TABLE public.scripts 
ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_version_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON public.script_versions(script_id);
CREATE INDEX IF NOT EXISTS idx_script_versions_user_id ON public.script_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_script_versions_created_at ON public.script_versions(created_at DESC);

-- Enable RLS on script_versions
ALTER TABLE public.script_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for script_versions
CREATE POLICY "Users can view their own script versions"
  ON public.script_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own script versions"
  ON public.script_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own script versions"
  ON public.script_versions FOR DELETE
  USING (auth.uid() = user_id);