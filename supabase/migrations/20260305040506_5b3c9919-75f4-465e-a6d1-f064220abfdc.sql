
CREATE TABLE public.guest_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed — only edge functions (service role) access this table
