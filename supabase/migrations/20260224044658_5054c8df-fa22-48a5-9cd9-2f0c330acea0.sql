-- Fix: Restrict profiles policies to non-anonymous users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE);

-- Fix: Restrict pronunciation_results policies to non-anonymous users
DROP POLICY IF EXISTS "Users can view their own results" ON public.pronunciation_results;
DROP POLICY IF EXISTS "Users can create their own results" ON public.pronunciation_results;
DROP POLICY IF EXISTS "Users can delete their own results" ON public.pronunciation_results;

CREATE POLICY "Users can view their own results"
ON public.pronunciation_results FOR SELECT
USING (auth.uid() = user_id AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE);

CREATE POLICY "Users can create their own results"
ON public.pronunciation_results FOR INSERT
WITH CHECK (auth.uid() = user_id AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE);

CREATE POLICY "Users can delete their own results"
ON public.pronunciation_results FOR DELETE
USING (auth.uid() = user_id AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE);