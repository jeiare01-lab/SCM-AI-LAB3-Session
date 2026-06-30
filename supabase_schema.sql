-- ════════════════════════════════════════════════════════════════════════════
-- PGB AI Lab 3 — Live Session Schema
-- Run this in Supabase SQL Editor before first use
-- ════════════════════════════════════════════════════════════════════════════

-- Sessions table: one row per facilitator session (keyed by 4-digit PIN)
create table if not exists lab3_sessions (
  pin text primary key,
  current_slide int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Presence table: tracks which participants are active in a session
create table if not exists lab3_presence (
  id uuid primary key default gen_random_uuid(),
  pin text not null references lab3_sessions(pin) on delete cascade,
  name text not null,
  last_seen timestamptz not null default now(),
  unique (pin, name)
);

-- Answers table: every submitted answer, one row per participant per question
create table if not exists lab3_answers (
  id uuid primary key default gen_random_uuid(),
  pin text not null references lab3_sessions(pin) on delete cascade,
  slide_id int not null,
  question_id text not null,
  name text not null,
  answer_text text not null,
  submitted_at timestamptz not null default now(),
  unique (pin, slide_id, question_id, name)
);

-- Indexes for fast polling lookups
create index if not exists idx_lab3_presence_pin on lab3_presence(pin);
create index if not exists idx_lab3_answers_pin on lab3_answers(pin);
create index if not exists idx_lab3_answers_pin_slide on lab3_answers(pin, slide_id);

-- ── Row Level Security: permissive anon policies (matches PGB's existing tool pattern) ──
alter table lab3_sessions enable row level security;
alter table lab3_presence enable row level security;
alter table lab3_answers enable row level security;

create policy "anon_all_sessions" on lab3_sessions for all using (true) with check (true);
create policy "anon_all_presence" on lab3_presence for all using (true) with check (true);
create policy "anon_all_answers" on lab3_answers for all using (true) with check (true);

-- ── Auto-update updated_at on session changes ──
create or replace function lab3_touch_session() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_lab3_touch_session on lab3_sessions;
create trigger trg_lab3_touch_session
  before update on lab3_sessions
  for each row execute function lab3_touch_session();

-- ── Optional: auto-cleanup sessions older than 7 days (run manually or via cron) ──
-- delete from lab3_sessions where created_at < now() - interval '7 days';
