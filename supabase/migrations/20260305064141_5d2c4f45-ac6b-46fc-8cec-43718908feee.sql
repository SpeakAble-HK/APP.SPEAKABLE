-- Deny all client access to guest_usage (only service role accesses this table)
CREATE POLICY "Deny all client access"
ON public.guest_usage
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);