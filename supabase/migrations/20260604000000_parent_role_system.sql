
-- Add 'parent' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';

-- Parent-Student relationship table
CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- Parents can view/manage their own student links
CREATE POLICY "Parents can view own students" ON public.parent_students FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "Parents can add students" ON public.parent_students FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can remove students" ON public.parent_students FOR DELETE TO authenticated USING (auth.uid() = parent_id);
-- Students can see which parent is linked to them
CREATE POLICY "Students can view own parent links" ON public.parent_students FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- Parents can view their linked students' explorer profiles
CREATE POLICY "Parents can view student explorer profiles" ON public.explorer_profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = explorer_profiles.user_id)
);

-- Parents can view their linked students' lesson progress
CREATE POLICY "Parents can view student progress" ON public.lesson_progress FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = auth.uid() AND student_id = lesson_progress.user_id)
);
