-- Video Generation System Schema

-- Video projects table
CREATE TABLE IF NOT EXISTS public.video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'processing', 'completed', 'failed')),
  settings JSONB DEFAULT '{
    "aspectRatio": "9:16",
    "duration": 60,
    "voiceId": "alloy",
    "musicVolume": 0.3,
    "transitionStyle": "fade"
  }'::jsonb,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video scenes table (individual segments of the video)
CREATE TABLE IF NOT EXISTS public.video_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  script_segment TEXT NOT NULL,
  visual_prompt TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  duration_seconds DECIMAL(5,2) NOT NULL DEFAULT 3.0,
  transition_type TEXT DEFAULT 'fade',
  settings JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating_image', 'generating_audio', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video assets table (generated media files)
CREATE TABLE IF NOT EXISTS public.video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.video_scenes(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'audio', 'video', 'music')),
  url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_projects
CREATE POLICY "Users can view their own video projects"
  ON public.video_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video projects"
  ON public.video_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video projects"
  ON public.video_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video projects"
  ON public.video_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for video_scenes
CREATE POLICY "Users can view scenes of their projects"
  ON public.video_scenes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scenes for their projects"
  ON public.video_scenes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenes of their projects"
  ON public.video_scenes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenes of their projects"
  ON public.video_scenes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_scenes.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

-- RLS Policies for video_assets
CREATE POLICY "Users can view assets of their projects"
  ON public.video_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_assets.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets for their projects"
  ON public.video_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_assets.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assets of their projects"
  ON public.video_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.video_projects
      WHERE video_projects.id = video_assets.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_video_projects_user_id ON public.video_projects(user_id);
CREATE INDEX idx_video_projects_status ON public.video_projects(status);
CREATE INDEX idx_video_scenes_project_id ON public.video_scenes(project_id);
CREATE INDEX idx_video_scenes_sequence ON public.video_scenes(project_id, sequence_order);
CREATE INDEX idx_video_assets_project_id ON public.video_assets(project_id);
CREATE INDEX idx_video_assets_scene_id ON public.video_assets(scene_id);

-- Trigger for updated_at
CREATE TRIGGER update_video_projects_updated_at
  BEFORE UPDATE ON public.video_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_scenes_updated_at
  BEFORE UPDATE ON public.video_scenes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();