-- Add admin-only write policies to trending_topics table
-- This ensures only admin users can modify trending topics data

-- Allow admins to insert new trending topics
CREATE POLICY "Admins can insert trending topics"
  ON trending_topics FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Allow admins to update existing trending topics
CREATE POLICY "Admins can update trending topics"
  ON trending_topics FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Allow admins to delete trending topics
CREATE POLICY "Admins can delete trending topics"
  ON trending_topics FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add comments for documentation
COMMENT ON POLICY "Admins can insert trending topics" ON trending_topics IS 
  'Security: Only authenticated admin users can create new trending topics.';

COMMENT ON POLICY "Admins can update trending topics" ON trending_topics IS 
  'Security: Only authenticated admin users can modify existing trending topics.';

COMMENT ON POLICY "Admins can delete trending topics" ON trending_topics IS 
  'Security: Only authenticated admin users can remove trending topics.';