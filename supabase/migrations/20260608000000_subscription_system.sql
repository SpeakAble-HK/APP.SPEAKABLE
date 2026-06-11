-- ═══════════════════════════════════════════════════════════════════════════════
-- Subscription & Route Protection System
-- Links pricing tiers to feature access
-- ═══════════════════════════════════════════════════════════════════════════════

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_zh text,
  monthly_price_hkd integer NOT NULL DEFAULT 0,
  annual_price_hkd integer NOT NULL DEFAULT 0,
  max_child_accounts integer DEFAULT 1,
  features jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default plans
INSERT INTO public.subscription_plans (id, name, name_zh, monthly_price_hkd, annual_price_hkd, max_child_accounts, features) VALUES
  ('free', 'Free', '免費', 0, 0, 1, '{
    "daily_credits": 5,
    "monthly_cap": 30,
    "speech_quest": false,
    "ai_voice_clone": false,
    "ipa_transcription": false,
    "diagnostics": false,
    "ad_free": false,
    "parent_insights": false,
    "nepa_analysis": false,
    "therapist_collaboration": false,
    "unlimited_practice": false,
    "interactive_stories": 3,
    "mini_games": 6
  }'),
  ('plus', 'Plus', '進階', 99, 79, 3, '{
    "daily_credits": -1,
    "monthly_cap": -1,
    "speech_quest": true,
    "ai_voice_clone": true,
    "ipa_transcription": false,
    "diagnostics": false,
    "ad_free": false,
    "parent_insights": true,
    "nepa_analysis": false,
    "therapist_collaboration": false,
    "unlimited_practice": true,
    "interactive_stories": 12,
    "mini_games": 12
  }'),
  ('pro', 'Pro', '專業', 199, 159, -1, '{
    "daily_credits": -1,
    "monthly_cap": -1,
    "speech_quest": true,
    "ai_voice_clone": true,
    "ipa_transcription": true,
    "diagnostics": true,
    "ad_free": true,
    "parent_insights": true,
    "nepa_analysis": true,
    "therapist_collaboration": true,
    "unlimited_practice": true,
    "interactive_stories": -1,
    "mini_games": -1
  }')
ON CONFLICT (id) DO NOTHING;

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Therapists can view their students' subscriptions (for collaboration)
DROP POLICY IF EXISTS "Therapists can view student subscriptions" ON public.subscriptions;
CREATE POLICY "Therapists can view student subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.st_students WHERE therapist_id = auth.uid() AND student_id = subscriptions.user_id)
  );

-- Parents can view their children's subscriptions
DROP POLICY IF EXISTS "Parents can view child subscriptions" ON public.subscriptions;
CREATE POLICY "Parents can view child subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = subscriptions.user_id)
  );

-- Function to get user's subscription with plan features
CREATE OR REPLACE FUNCTION public.get_user_subscription(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_build_object(
      'plan_id', s.plan_id,
      'status', s.status,
      'billing_cycle', s.billing_cycle,
      'current_period_end', s.current_period_end,
      'features', p.features,
      'plan_name', p.name,
      'plan_name_zh', p.name_zh,
      'max_child_accounts', p.max_child_accounts
    ),
    jsonb_build_object(
      'plan_id', 'free',
      'status', 'active',
      'billing_cycle', 'monthly',
      'current_period_end', null,
      'features', (SELECT features FROM public.subscription_plans WHERE id = 'free'),
      'plan_name', 'Free',
      'plan_name_zh', '免費',
      'max_child_accounts', 1
    )
  )
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = _user_id AND s.status IN ('active', 'trialing')
$$;

-- Function to check if user has a specific feature
CREATE OR REPLACE FUNCTION public.has_feature(_user_id uuid, _feature text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (p.features->>_feature)::boolean
     FROM public.subscriptions s
     JOIN public.subscription_plans p ON p.id = s.plan_id
     WHERE s.user_id = _user_id AND s.status IN ('active', 'trialing')),
    false
  )
$$;

-- Auto-create free subscription for new users via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, status, billing_cycle)
  VALUES (NEW.id, 'free', 'active', 'monthly')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- NOTE: must use a UNIQUE trigger name. `on_auth_user_created` is already owned
-- by the profile-creation trigger (migration 20260120185848); reusing it would
-- silently replace profile creation and break new-user signup.
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Grant read access to subscription_plans for all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view plans" ON public.subscription_plans;
CREATE POLICY "Authenticated users can view plans" ON public.subscription_plans
  FOR SELECT TO authenticated USING (true);
