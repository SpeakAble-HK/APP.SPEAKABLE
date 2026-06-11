-- Aura Journey adaptation-engine signals
-- Stores per-chapter completion signals keyed by the chapter's adaptationKey, so
-- completing an interactive-story chapter feeds a 0..1 performance value into the
-- Narrative Assessment rubric's evidence-based auto-suggest (suggestScoresFromEvidence).
--
-- One row per (student, adaptation_key); upserted on each completion. `signal` is a
-- rolling 0..1 value (e.g. clone produced & line attempted = strong signal, skipped
-- = weaker). The rubric reads the latest signal per key.

create table if not exists public.journey_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  -- matches AuraJourneyScene.adaptationKey (e.g. "wh_question_response")
  adaptation_key text not null,
  -- 0..1 performance/engagement signal for this adaptation target
  signal numeric not null default 0,
  -- how many times this chapter target has been engaged
  attempts integer not null default 1,
  -- last chapter index that produced this signal (for traceability)
  scene_index integer,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (student_id, adaptation_key)
);

create index if not exists journey_progress_student_idx
  on public.journey_progress (student_id, updated_at desc);

alter table public.journey_progress enable row level security;

-- Students write/read their own journey progress; therapists/admins can read it
-- for assessment. Inserts/updates are scoped to the acting user as the student.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'journey_progress' and policyname = 'jp_select'
  ) then
    create policy jp_select on public.journey_progress
      for select using (
        auth.uid() = student_id
        or public.has_role(auth.uid(), 'therapist')
        or public.has_role(auth.uid(), 'admin')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'journey_progress' and policyname = 'jp_insert'
  ) then
    create policy jp_insert on public.journey_progress
      for insert with check (
        auth.uid() = student_id
        or public.has_role(auth.uid(), 'admin')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'journey_progress' and policyname = 'jp_update'
  ) then
    create policy jp_update on public.journey_progress
      for update using (
        auth.uid() = student_id
        or public.has_role(auth.uid(), 'admin')
      );
  end if;
end $$;
