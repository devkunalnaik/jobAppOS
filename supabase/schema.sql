create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  job jsonb not null,
  status text not null check (status in ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index if not exists job_applications_user_created_idx
  on public.job_applications (user_id, created_at desc);

alter table public.job_applications enable row level security;

drop policy if exists "Users can manage their own applications" on public.job_applications;
create policy "Users can manage their own applications"
  on public.job_applications
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.job_applications to authenticated;