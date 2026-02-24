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

