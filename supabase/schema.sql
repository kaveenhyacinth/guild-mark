create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#059669',
  goal_type text check (goal_type in ('weekly', 'total')),
  goal_target_hours integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes > 0),
  practice_date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sessions_user_date_idx on public.sessions (user_id, practice_date desc);
create index if not exists sessions_user_skill_date_idx on public.sessions (user_id, skill_id, practice_date desc);
create index if not exists skills_user_created_idx on public.skills (user_id, created_at desc);

alter table public.skills enable row level security;
alter table public.sessions enable row level security;
alter table public.user_preferences enable row level security;

create policy "users_manage_own_skills"
  on public.skills
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_manage_own_sessions"
  on public.sessions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_manage_own_preferences"
  on public.user_preferences
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
