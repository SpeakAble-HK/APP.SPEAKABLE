-- Mini-game SDK + story-engine + unified telemetry schema.
-- Converts the 13 table definitions in src/lib/minigame-sdk/schema.ts into real
-- Postgres tables with row level security.
--
-- RLS conventions (matching existing migrations):
--   * Learner-owned rows: owner column is a uuid that equals auth.uid().
--   * Therapist-owned rows: owner column is a uuid equal to auth.uid() AND the
--     acting user holds the 'therapist' role via public.has_role().
--   * Shared lookups (game_metadata, story_scenes): readable by any authenticated
--     user; writes restricted to therapists/admins.
-- owner/therapist id columns are uuid (not text) so auth.uid() comparisons work.

-- ─────────────────────────────────────────────────────────────────────────────
-- session_results — learner-owned mini-game session summaries
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.session_results (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  learner_id uuid not null,
  game_id text not null,
  total_attempts integer not null,
  success_rate real not null,
  avg_latency_ms real not null,
  fatigue_marker jsonb not null,
  reward_payout integer not null,
  carryover_recommendation text,
  completed_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists idx_session_results_learner on public.session_results(learner_id);
create index if not exists idx_session_results_game on public.session_results(game_id);
create index if not exists idx_session_results_completed on public.session_results(completed_at);
alter table public.session_results enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='session_results' and policyname='session_results_select') then
    create policy session_results_select on public.session_results for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='session_results' and policyname='session_results_insert') then
    create policy session_results_insert on public.session_results for insert
      with check (auth.uid() = learner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='session_results' and policyname='session_results_update') then
    create policy session_results_update on public.session_results for update
      using (auth.uid() = learner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='session_results' and policyname='session_results_delete') then
    create policy session_results_delete on public.session_results for delete
      using (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- learner_model — one row per learner (learner-owned)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.learner_model (
  learner_id uuid primary key,
  weakest_phonemes text[] default '{}',
  improved_phonemes text[] default '{}',
  avg_session_duration real default 0,
  fatigue_trend text default 'stable',
  last_game_played text,
  total_sessions integer default 0,
  time_of_day_preference text,
  therapist_assignments text[] default '{}',
  updated_at timestamptz default now()
);
alter table public.learner_model enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='learner_model' and policyname='learner_model_select') then
    create policy learner_model_select on public.learner_model for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='learner_model' and policyname='learner_model_insert') then
    create policy learner_model_insert on public.learner_model for insert
      with check (auth.uid() = learner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='learner_model' and policyname='learner_model_update') then
    create policy learner_model_update on public.learner_model for update
      using (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- therapist_phoneme_tags — therapist-owned tags on learners
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.therapist_phoneme_tags (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null,
  learner_id uuid not null,
  phoneme_symbol text not null,
  priority text default 'primary',
  note text,
  created_at timestamptz default now(),
  unique(therapist_id, learner_id, phoneme_symbol)
);
create index if not exists idx_therapist_phoneme_tags_learner on public.therapist_phoneme_tags(learner_id);
alter table public.therapist_phoneme_tags enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='therapist_phoneme_tags' and policyname='tpt_select') then
    create policy tpt_select on public.therapist_phoneme_tags for select
      using (auth.uid() = therapist_id or auth.uid() = learner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_phoneme_tags' and policyname='tpt_insert') then
    create policy tpt_insert on public.therapist_phoneme_tags for insert
      with check (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_phoneme_tags' and policyname='tpt_update') then
    create policy tpt_update on public.therapist_phoneme_tags for update
      using (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_phoneme_tags' and policyname='tpt_delete') then
    create policy tpt_delete on public.therapist_phoneme_tags for delete
      using (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- game_metadata — shared lookup (read by any authenticated user)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.game_metadata (
  game_id text primary key,
  name text not null,
  mechanic_type text not null,
  therapeutic_objective text not null,
  difficulties jsonb not null,
  min_age_years integer not null,
  estimated_session_minutes integer not null,
  created_at timestamptz default now()
);
alter table public.game_metadata enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='game_metadata' and policyname='game_metadata_select') then
    create policy game_metadata_select on public.game_metadata for select
      to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='game_metadata' and policyname='game_metadata_write') then
    create policy game_metadata_write on public.game_metadata for all
      using (public.has_role(auth.uid(),'therapist'))
      with check (public.has_role(auth.uid(),'therapist'));
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- therapist_dashboard_events — learner-owned events surfaced to therapists
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.therapist_dashboard_events (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null,
  game_id text not null,
  session_date timestamptz not null,
  success_rate real not null,
  fatigue_flag boolean default false,
  carryover_note text,
  created_at timestamptz default now()
);
create index if not exists idx_dashboard_events_learner on public.therapist_dashboard_events(learner_id);
create index if not exists idx_dashboard_events_date on public.therapist_dashboard_events(session_date);
alter table public.therapist_dashboard_events enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='therapist_dashboard_events' and policyname='tde_select') then
    create policy tde_select on public.therapist_dashboard_events for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_dashboard_events' and policyname='tde_insert') then
    create policy tde_insert on public.therapist_dashboard_events for insert
      with check (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- story_scenes — shared authored content (read by any authenticated user)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.story_scenes (
  scene_id text primary key,
  story_id text not null,
  chapter_id text not null,
  scene_order integer not null,
  narrative_state text not null,
  target_phoneme jsonb not null,
  character_line text not null,
  learner_task text not null,
  success_condition jsonb not null,
  branching_outcome jsonb not null,
  unlock_condition text,
  reward_on_complete integer default 0,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_story_scenes_story on public.story_scenes(story_id);
create index if not exists idx_story_scenes_chapter on public.story_scenes(chapter_id);
alter table public.story_scenes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='story_scenes' and policyname='story_scenes_select') then
    create policy story_scenes_select on public.story_scenes for select
      to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='story_scenes' and policyname='story_scenes_write') then
    create policy story_scenes_write on public.story_scenes for all
      using (public.has_role(auth.uid(),'therapist'))
      with check (public.has_role(auth.uid(),'therapist'));
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- learner_story_state — learner-owned story progress
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.learner_story_state (
  learner_id uuid not null,
  story_id text not null,
  current_scene_id text not null,
  completed_scenes text[] default '{}',
  phoneme_progress jsonb default '{}',
  emotional_state text default 'neutral',
  last_updated timestamptz default now(),
  primary key (learner_id, story_id)
);
alter table public.learner_story_state enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='learner_story_state' and policyname='lss_select') then
    create policy lss_select on public.learner_story_state for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='learner_story_state' and policyname='lss_insert') then
    create policy lss_insert on public.learner_story_state for insert
      with check (auth.uid() = learner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='learner_story_state' and policyname='lss_update') then
    create policy lss_update on public.learner_story_state for update
      using (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- story_telemetry — learner-owned scene telemetry
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.story_telemetry (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null,
  story_id text not null,
  chapter_id text not null,
  scene_id text not null,
  completed boolean not null,
  attempts integer not null,
  phoneme_symbol text not null,
  confidence_score real not null,
  branch_taken text not null,
  time_on_scene_ms integer not null,
  abandoned boolean default false,
  re_engaged boolean default false,
  frustration_flag boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_story_telemetry_learner on public.story_telemetry(learner_id);
create index if not exists idx_story_telemetry_scene on public.story_telemetry(scene_id);
create index if not exists idx_story_telemetry_created on public.story_telemetry(created_at);
alter table public.story_telemetry enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='story_telemetry' and policyname='st_select') then
    create policy st_select on public.story_telemetry for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='story_telemetry' and policyname='st_insert') then
    create policy st_insert on public.story_telemetry for insert
      with check (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- unified_telemetry — learner-owned cross-context event stream
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.unified_telemetry (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  learner_id uuid not null,
  context_id text not null,
  event_data jsonb not null,
  created_at timestamptz default now()
);
create index if not exists idx_unified_telemetry_learner on public.unified_telemetry(learner_id);
create index if not exists idx_unified_telemetry_type on public.unified_telemetry(event_type);
create index if not exists idx_unified_telemetry_created on public.unified_telemetry(created_at);
alter table public.unified_telemetry enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='unified_telemetry' and policyname='ut_select') then
    create policy ut_select on public.unified_telemetry for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='unified_telemetry' and policyname='ut_insert') then
    create policy ut_insert on public.unified_telemetry for insert
      with check (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- therapist_voice_clones — therapist-owned
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.therapist_voice_clones (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null unique,
  elevenlabs_voice_id text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.therapist_voice_clones enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='therapist_voice_clones' and policyname='tvc_select') then
    create policy tvc_select on public.therapist_voice_clones for select
      using (auth.uid() = therapist_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_voice_clones' and policyname='tvc_write') then
    create policy tvc_write on public.therapist_voice_clones for all
      using (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'))
      with check (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- learner_rewards — learner-owned
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.learner_rewards (
  learner_id uuid primary key,
  total_stars integer default 0,
  streak_count integer default 0,
  last_session_stars integer default 0,
  updated_at timestamptz default now()
);
alter table public.learner_rewards enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='learner_rewards' and policyname='lr_select') then
    create policy lr_select on public.learner_rewards for select
      using (auth.uid() = learner_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='learner_rewards' and policyname='lr_insert') then
    create policy lr_insert on public.learner_rewards for insert
      with check (auth.uid() = learner_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='learner_rewards' and policyname='lr_update') then
    create policy lr_update on public.learner_rewards for update
      using (auth.uid() = learner_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- coop_sessions — shared room between a child and parent
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.coop_sessions (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  child_id uuid not null,
  parent_id uuid not null,
  game_id text not null,
  mode text default 'cooperative',
  state jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_coop_sessions_room on public.coop_sessions(room_code);
create index if not exists idx_coop_sessions_child on public.coop_sessions(child_id);
alter table public.coop_sessions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='coop_sessions' and policyname='coop_select') then
    create policy coop_select on public.coop_sessions for select
      using (auth.uid() = child_id or auth.uid() = parent_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='coop_sessions' and policyname='coop_insert') then
    create policy coop_insert on public.coop_sessions for insert
      with check (auth.uid() = child_id or auth.uid() = parent_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='coop_sessions' and policyname='coop_update') then
    create policy coop_update on public.coop_sessions for update
      using (auth.uid() = child_id or auth.uid() = parent_id);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- therapist_assignments — therapist-owned
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.therapist_assignments (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null,
  learner_ids text[] not null,
  game_id text not null,
  phoneme_targets text[] not null,
  difficulty_config jsonb not null,
  custom_prompt text,
  pass_threshold real default 0.7,
  scheduled_for timestamptz,
  allow_coop boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_therapist_assignments_therapist on public.therapist_assignments(therapist_id);
create index if not exists idx_therapist_assignments_scheduled on public.therapist_assignments(scheduled_for);
alter table public.therapist_assignments enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='therapist_assignments' and policyname='ta_select') then
    create policy ta_select on public.therapist_assignments for select
      using (auth.uid() = therapist_id or public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_assignments' and policyname='ta_insert') then
    create policy ta_insert on public.therapist_assignments for insert
      with check (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_assignments' and policyname='ta_update') then
    create policy ta_update on public.therapist_assignments for update
      using (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
  if not exists (select 1 from pg_policies where tablename='therapist_assignments' and policyname='ta_delete') then
    create policy ta_delete on public.therapist_assignments for delete
      using (auth.uid() = therapist_id and public.has_role(auth.uid(),'therapist'));
  end if;
end $$;
