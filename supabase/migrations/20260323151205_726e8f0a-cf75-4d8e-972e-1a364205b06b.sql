
-- Role enum
CREATE TYPE public.app_role AS ENUM ('explorer', 'therapist');

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ST-Student relationships (created BEFORE policies that reference it)
CREATE TABLE public.st_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (therapist_id, student_id)
);
ALTER TABLE public.st_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can view their students" ON public.st_students FOR SELECT TO authenticated USING (auth.uid() = therapist_id);
CREATE POLICY "Therapists can add students" ON public.st_students FOR INSERT TO authenticated WITH CHECK (auth.uid() = therapist_id);
CREATE POLICY "Therapists can remove students" ON public.st_students FOR DELETE TO authenticated USING (auth.uid() = therapist_id);
CREATE POLICY "Students can view their therapist" ON public.st_students FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- Explorer profiles
CREATE TABLE public.explorer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  nickname text NOT NULL,
  age integer,
  gender text,
  daily_reminder boolean DEFAULT true,
  onboarding_audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.explorer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own explorer profile" ON public.explorer_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own explorer profile" ON public.explorer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own explorer profile" ON public.explorer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Therapists can view student explorer profiles" ON public.explorer_profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.st_students WHERE therapist_id = auth.uid() AND student_id = explorer_profiles.user_id)
);

-- Lesson progress
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id text NOT NULL,
  completed boolean DEFAULT false,
  accuracy_score integer DEFAULT 0,
  attempts integer DEFAULT 1,
  xp_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lesson progress" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Therapists can view student progress" ON public.lesson_progress FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.st_students WHERE therapist_id = auth.uid() AND student_id = lesson_progress.user_id)
);

-- ST assignments
CREATE TABLE public.st_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  student_id uuid NOT NULL,
  category text NOT NULL,
  assigned_at timestamptz DEFAULT now()
);
ALTER TABLE public.st_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapists can manage own assignments" ON public.st_assignments FOR ALL TO authenticated USING (auth.uid() = therapist_id) WITH CHECK (auth.uid() = therapist_id);
CREATE POLICY "Students can view their assignments" ON public.st_assignments FOR SELECT TO authenticated USING (auth.uid() = student_id);
