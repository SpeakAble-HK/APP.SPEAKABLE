-- Narrative Assessment Profile + rubric scoring storage
-- Stores per-session therapist rubric scores aligned to the standard SLP
-- narrative-language framework (macrostructure / microstructure / intelligibility).

create table if not exists public.narrative_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  therapist_id uuid,
  -- elementId -> 0..4 score, e.g. {"character": 3, "syntactic_complexity": 2, ...}
  scores jsonb not null default '{}'::jsonb,
  -- computed snapshot at save time (totalProficiency, band, domain percents)
  result jsonb not null default '{}'::jsonb,
  -- evidence values used to auto-suggest (evidenceKey -> 0..1)
  evidence jsonb not null default '{}'::jsonb,
  total_proficiency numeric not null default 0,
  band text not null default 'Emerging',
  notes text,
  assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists narrative_assessments_student_idx
  on public.narrative_assessments (student_id, assessed_at desc);

alter table public.narrative_assessments enable row level security;

-- Therapists/owners can read assessments for their students; students can read their own.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'narrative_assessments' and policyname = 'na_select'
  ) then
    create policy na_select on public.narrative_assessments
      for select using (
        auth.uid() = student_id
        or auth.uid() = therapist_id
        or public.has_role(auth.uid(), 'therapist')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'narrative_assessments' and policyname = 'na_insert'
  ) then
    create policy na_insert on public.narrative_assessments
      for insert with check (
        auth.uid() = therapist_id
        or public.has_role(auth.uid(), 'therapist')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'narrative_assessments' and policyname = 'na_update'
  ) then
    create policy na_update on public.narrative_assessments
      for update using (
        auth.uid() = therapist_id
        or public.has_role(auth.uid(), 'therapist')
      );
  end if;
end $$;
