-- Fix search_path security issue for update_series_updated_at function
CREATE OR REPLACE FUNCTION update_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;