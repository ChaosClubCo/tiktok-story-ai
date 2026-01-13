-- Remove unused SocialMedia storage bucket
-- This bucket was found to have no references in the application codebase
-- Removing it reduces the attack surface and eliminates unnecessary public exposure

-- Delete the bucket (this will also delete all files in the bucket)
DELETE FROM storage.buckets WHERE id = 'SocialMedia';