-- Create predictions_history table to track all viral score predictions
CREATE TABLE public.predictions_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  script_id UUID NULL,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('premise', 'full_script')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  niche TEXT,
  
  -- Prediction scores
  viral_score INTEGER NOT NULL,
  engagement_score INTEGER NOT NULL,
  shareability_score INTEGER NOT NULL,
  hook_strength INTEGER NOT NULL,
  emotional_impact INTEGER NOT NULL,
  conflict_clarity INTEGER NOT NULL,
  pacing_quality INTEGER NOT NULL,
  dialogue_quality INTEGER NOT NULL,
  quotability INTEGER NOT NULL,
  relatability INTEGER NOT NULL,
  
  -- AI recommendations
  recommendations JSONB,
  strengths JSONB,
  weaknesses JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.predictions_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own prediction history"
ON public.predictions_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
ON public.predictions_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
ON public.predictions_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_predictions_history_user_created 
ON public.predictions_history(user_id, created_at DESC);

CREATE INDEX idx_predictions_history_script 
ON public.predictions_history(script_id) 
WHERE script_id IS NOT NULL;

-- Add foreign key to scripts table
ALTER TABLE public.predictions_history
ADD CONSTRAINT fk_predictions_history_script
FOREIGN KEY (script_id) REFERENCES public.scripts(id) ON DELETE CASCADE;