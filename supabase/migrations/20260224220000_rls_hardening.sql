-- RLS Hardening migration (2026-02-24)
-- Strengthen profiles/user_roles/jobs/bids/messages/notifications/reviews
-- Skip payments per directive.

set check_function_bodies = off;

-- Ensure extension is available
create extension if not exists "uuid-ossp";

------------------------------------------------------------
-- Profiles admin override
------------------------------------------------------------
create policy "Admins can manage all profiles"
  on public.profiles
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

------------------------------------------------------------
-- User roles locked to service role
------------------------------------------------------------
create policy "Service role manages user roles"
  on public.user_roles
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

------------------------------------------------------------
-- Jobs owner/admin policies + with check
------------------------------------------------------------
create policy "Job owners can update jobs"
  on public.jobs
  for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

delete policy if exists "Job owners can delete their jobs" on public.jobs;
create policy "Job owners can delete jobs"
  on public.jobs
  for delete
  using (auth.uid() = customer_id);

create policy "Admins can manage jobs"
  on public.jobs
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

------------------------------------------------------------
-- Bids - prevent edits post acceptance + owner deletions
------------------------------------------------------------
create policy "Providers update pending bids"
  on public.bids
  for update
  using (auth.uid() = provider_id and status = 'pending')
  with check (auth.uid() = provider_id and status = 'pending');

create policy "Providers delete pending bids"
  on public.bids
  for delete
  using (auth.uid() = provider_id and status = 'pending');

create policy "Admins manage bids"
  on public.bids
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

------------------------------------------------------------
-- Messages/Notifications service role bypass
------------------------------------------------------------
create policy "Service role insert messages"
  on public.messages
  for insert
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "Service role insert notifications"
  on public.notifications
  for insert
  with check (auth.jwt() ->> 'role' = 'service_role');

------------------------------------------------------------
-- Reviews require completed jobs
------------------------------------------------------------
create or replace function public.ensure_completed_job_review()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.jobs j
    where j.id = new.job_id and j.status = 'completed'
  ) then
    raise exception 'Cannot review job before completion';
  end if;
  return new;
end;
$$;

create trigger reviews_require_completed_job
  before insert on public.reviews
  for each row execute procedure public.ensure_completed_job_review();

