-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_niche text,
ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';

-- Add index for faster lookup of users who haven't completed onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_incomplete 
ON public.profiles(user_id) 
WHERE onboarding_completed = false;