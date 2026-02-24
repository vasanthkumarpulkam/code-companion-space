# Rowan Log

- Waiting for dashboard approval to start schema audit.
- Started schema & RLS audit: running `supabase db lint` and reviewing migrations for policies.
- Attempted `npx supabase db lint` but CLI needs a running Postgres instance (connection refused on 127.0.0.1:54322). Need either local Supabase stack started via `supabase start` or remote DB connection string from Supabase project settings. Awaiting direction.
- Provided DB password but `npx supabase db lint` still tries localhost (127.0.0.1:54322). Need to configure `--db-url` flag or env `SUPABASE_DB_URL` evaluated correctly; note password contains `@` which must be URL-encoded. Awaiting updated connection URI with encoded password, e.g., `postgresql://postgres:Vasanth%4012052001@...`.
- URI still not accepted because password contains `@` characters that need encoding. Supabase CLI continues defaulting to localhost. Need password encoded as `Vasu%4012052001` (replace `@` with `%40`).
- Even with encoded password, `npx supabase db lint` still targets localhost. Need to pass `--db-url` CLI flag explicitly (e.g., `npx supabase db lint --db-url postgresql://...`). Will retry with that.
- Tried `supabase db lint --db-url` with remote URI; fails due to IPv6 connectivity (`network is unreachable`). Need either IPv4 address (replace hostname with IPv4), or run lint via Supabase CLI using `--use-ref` referencing project ID (`supabase db lint --ref mcrfkipxixmhajntrxcs`). Checking docs.
- `supabase db lint` CLI doesn't support `--ref`; only `--linked` or `--db-url`. Need IPv4 connection or set DNS resolver to https to bypass IPv6 issue. Will try `--dns-resolver https`.
- DNS over HTTPS still fails (resolver can't find IPv4). Need explicit IPv4 endpoint from Supabase (found under Project Settings > Database > Connection string tab shows `Host` with IPv4). Alternatively, use Supabase tunnel (`supabase db remote commit/lint`). Awaiting instructions.
- Connected via session pooler (port 6543) and ran `supabase db lint`. Result: only warning is unused variable `current_window` in `public.check_rate_limit`. Will proceed with manual RLS review next.
- Received request to expedite RLS audit. Prioritizing policies for profiles, jobs, bids, messages, notifications, and reviews; summarizing gaps ASAP.
- Status check requested: compiling current RLS findings summary for review.
- Urgent request received: preparing immediate RLS audit summary snapshot.

## RLS Audit Snapshot (v0.1)
- **profiles**: RLS enabled; policies limit read/write to owner via `auth.uid()`. Need admin override policy.
- **user_roles**: Insert/update currently open to any authenticated user—must restrict to admins/service role.
- **jobs**: Select policies cover owners + providers who bid; update/delete policies missing admin-only guard. Recommend explicit `using`/`with check` for owners, separate admin policy.
- **bids**: Read policies allow bidder + job owner; need policy to prevent edits after acceptance and restrict delete to owner before job award.
- **messages**: Sender/recipient policies in place; ensure service-role bypass for system notifications.
- **notifications**: Similar to messages; require policy to allow system inserts via service role while keeping reads user-specific.
- **reviews**: Creation allowed for reviewer + subject but no DB-level check to ensure associated job completed—needs trigger or constraint.
- **payments**: Table exists with RLS disabled; must enable RLS and restrict access to admins until payments go live.
- **support tables** (categories, services, languages): currently unrestricted; acceptable for read-only, but add policy preventing non-admin writes.
- Directive received: defer payments table RLS for now; proceeding to implement fixes for profiles, user_roles, jobs, bids, messages, notifications, reviews. Sharing findings with dependent agents.
- Implementing policy fixes:
  - Added admin override to profiles (policy `profiles_admin_access`).
  - Locked user_roles inserts/updates to service role (`auth.jwt() -> role = 'service_role'`).
  - Jobs: introduced owner-only update/delete policies + admin bypass, plus `with check` for status transitions.
  - Bids: added rule preventing edits after acceptance and restricting delete to owner before job award.
  - Messages + notifications: added service-role bypass for system inserts while keeping user-level visibility.
  - Reviews: drafting trigger to enforce `job.status = 'completed'` before insert.
- Preparing migration file `20260224220000_rls_hardening.sql`.
- Task: review storage buckets / messages attachments policy to enforce access limited to provider, customer, admin roles.
- Note: chat media policy change is UI/storage-level only; no migration needed. Assist Luna with Supabase storage rules if required.

