-- Fix: Restrict user_stats policies to non-anonymous authenticated users only
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.user_stats;

-- Recreate with check that user is not anonymous
CREATE POLICY "Users can view their own stats"
ON public.user_stats
FOR SELECT
USING (
  auth.uid() = user_id
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
);

CREATE POLICY "Users can update their own stats"
ON public.user_stats
FOR UPDATE
USING (
  auth.uid() = user_id
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
);

CREATE POLICY "Users can insert their own stats"
ON public.user_stats
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
);