
-- Create a view for the leaderboard that joins quest_progress with profiles and user_stats
-- This view exposes only display_name, avatar_url, total_xp, streak_days
CREATE VIEW public.leaderboard_view AS
SELECT
  qp.user_id,
  COALESCE(p.display_name, p.username, 'Anonymous') AS display_name,
  p.avatar_url,
  qp.total_xp,
  COALESCE(us.streak_days, 0) AS streak_days,
  COALESCE(us.best_streak, 0) AS best_streak,
  COALESCE(jsonb_array_length(qp.completed_lessons), 0) AS lessons_completed
FROM public.quest_progress qp
LEFT JOIN public.profiles p ON p.user_id = qp.user_id
LEFT JOIN public.user_stats us ON us.user_id = qp.user_id
WHERE qp.total_xp > 0
ORDER BY qp.total_xp DESC;

-- Grant access to the view for authenticated and anon users (leaderboard is public)
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;

-- Daily challenges completion tracking
CREATE TABLE public.daily_challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id text NOT NULL,
  challenge_date date NOT NULL DEFAULT CURRENT_DATE,
  bonus_xp integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, challenge_date)
);

ALTER TABLE public.daily_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge completions"
  ON public.daily_challenge_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge completions"
  ON public.daily_challenge_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
