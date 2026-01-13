# Storage Bucket Security Review

## SocialMedia Bucket

**Status:** ⚠️ Public Access Enabled (Requires Review)

**Configuration:**
- Bucket Name: `SocialMedia`
- Public Access: `true`

### Current Usage Analysis

**Finding:** The `SocialMedia` bucket is currently **NOT referenced** anywhere in the application codebase (as of 2025-11-26).

A comprehensive search across all TypeScript/React files found zero usages of this bucket.

### Security Recommendations

Choose one of the following approaches:

#### Option 1: Remove Unused Bucket (Recommended)
If the bucket is not needed, remove it to reduce attack surface:

```sql
-- Remove the bucket
DELETE FROM storage.buckets WHERE id = 'SocialMedia';
```

#### Option 2: Secure the Bucket (If Planning to Use)
If you plan to use this bucket for user-generated content, make it private and use signed URLs:

```sql
-- Make bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'SocialMedia';

-- Create RLS policies for authenticated uploads
CREATE POLICY "Users can upload their own social media files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'SocialMedia' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own social media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'SocialMedia' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own social media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'SocialMedia' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Then in your application code, use signed URLs:

```typescript
import { supabase } from "@/integrations/supabase/client";

// Upload file
const uploadFile = async (file: File, userId: string) => {
  const filePath = `${userId}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('SocialMedia')
    .upload(filePath, file);
    
  if (error) throw error;
  return data;
};

// Get signed URL (valid for 1 hour)
const getSignedUrl = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from('SocialMedia')
    .createSignedUrl(filePath, 3600);
    
  if (error) throw error;
  return data.signedUrl;
};
```

#### Option 3: Document Public Access Intent
If public access is intentional (e.g., for sharing social media preview images), document it:

```sql
-- Add comment to document public access intent
COMMENT ON TABLE storage.buckets IS 
  'SocialMedia bucket: Public access enabled intentionally for social media sharing and preview images. 
   No sensitive data should be stored here.';
```

### Action Required

**Decision Needed:** Choose Option 1, 2, or 3 above and implement the appropriate security measures.

### Related Security Considerations

1. **Content Validation:** If allowing uploads, validate file types and sizes
2. **Malware Scanning:** Consider integrating malware scanning for user uploads
3. **Rate Limiting:** Implement upload rate limits per user
4. **Storage Quotas:** Set per-user storage quotas to prevent abuse
5. **Content Moderation:** If public, implement content moderation workflows

---

**Last Reviewed:** 2025-11-26  
**Next Review:** Before implementing any file upload features
