
CREATE TABLE IF NOT EXISTS public.calibration_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  therapist_name TEXT NOT NULL,
  calibration_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  voice_clone_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calibration_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calibration audits"
  ON public.calibration_audit FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calibration audits"
  ON public.calibration_audit FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
