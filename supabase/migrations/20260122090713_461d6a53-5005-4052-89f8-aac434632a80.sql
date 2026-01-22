-- Create user_stats table to track daily goals, fluency scores, and streaks
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 15,
  daily_progress_minutes INTEGER NOT NULL DEFAULT 0,
  fluency_score INTEGER NOT NULL DEFAULT 0,
  fluency_change INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize user stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create stats for new users
CREATE TRIGGER on_auth_user_created_stats
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_stats();