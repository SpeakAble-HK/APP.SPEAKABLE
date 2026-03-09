
-- Fix: set the view to use invoker security instead of definer
ALTER VIEW public.leaderboard_view SET (security_invoker = on);
