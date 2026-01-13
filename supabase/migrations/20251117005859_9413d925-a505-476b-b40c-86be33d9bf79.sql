-- Create script_branches table for version branching
CREATE TABLE script_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  branch_name TEXT NOT NULL,
  parent_branch_id UUID REFERENCES script_branches(id),
  created_from_version INTEGER NOT NULL,
  current_version_content TEXT NOT NULL,
  niche TEXT,
  length TEXT,
  tone TEXT,
  topic TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  merged_at TIMESTAMPTZ NULL,
  merged_by UUID NULL,
  UNIQUE(script_id, branch_name)
);

CREATE INDEX idx_script_branches_script_id ON script_branches(script_id);
CREATE INDEX idx_script_branches_user_id ON script_branches(user_id);

-- Enable RLS
ALTER TABLE script_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own branches"
  ON script_branches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own branches"
  ON script_branches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branches"
  ON script_branches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branches"
  ON script_branches FOR DELETE
  USING (auth.uid() = user_id AND branch_name != 'main');

-- Add branch reference to script_versions
ALTER TABLE script_versions ADD COLUMN branch_id UUID REFERENCES script_branches(id);
ALTER TABLE script_versions ADD COLUMN branch_name TEXT DEFAULT 'main';

-- Add active branch to scripts
ALTER TABLE scripts ADD COLUMN active_branch_id UUID REFERENCES script_branches(id);

-- Create ab_tests table for A/B testing
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  hypothesis TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  winner_variant_id UUID NULL,
  notes TEXT
);

CREATE INDEX idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX idx_ab_tests_script_id ON ab_tests(script_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);

-- Enable RLS
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tests"
  ON ab_tests FOR ALL
  USING (auth.uid() = user_id);

-- Create ab_test_variants table
CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  version_id UUID REFERENCES script_versions(id),
  branch_id UUID REFERENCES script_branches(id),
  content TEXT NOT NULL,
  prediction_id UUID REFERENCES predictions_history(id),
  viral_score INTEGER,
  engagement_score INTEGER,
  shareability_score INTEGER,
  hook_strength INTEGER,
  emotional_impact INTEGER,
  trend_alignment INTEGER,
  user_preference_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ab_test_variants_test_id ON ab_test_variants(test_id);

-- Enable RLS
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage variants for their tests"
  ON ab_test_variants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ab_tests WHERE ab_tests.id = ab_test_variants.test_id AND ab_tests.user_id = auth.uid()
  ));

-- Create ab_test_results table
CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ab_test_results_test_id ON ab_test_results(test_id);
CREATE INDEX idx_ab_test_results_variant_id ON ab_test_results(variant_id);

-- Enable RLS
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results for their tests"
  ON ab_test_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ab_tests WHERE ab_tests.id = ab_test_results.test_id AND ab_tests.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert results for their tests"
  ON ab_test_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ab_tests WHERE ab_tests.id = ab_test_results.test_id AND ab_tests.user_id = auth.uid()
  ));