## Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and edit files inside `app/`—the dev server supports fast refresh.

## Supabase setup

1. Duplicate `.env.local.example` to `.env.local`.
2. Fill in the following values from your Supabase project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart the dev server whenever env vars change.

### How auth works

- `middleware.ts` refreshes sessions on every request, so server components always receive fresh cookies.
- `lib/supabase/server.ts` and `lib/supabase/client.ts` centralize Supabase client creation for server components, server actions, and client components.
- `SupabaseProvider` (used in `app/layout.tsx`) exposes the browser client and the latest session through React context—call `useSupabase()` inside client components to read `session` or issue queries.

With this wiring in place, you can start building database queries or auth flows directly with the Supabase clients. Refer to the [Supabase Auth server-side guide](https://supabase.com/docs/guides/auth/server-side/nextjs) for deeper usage patterns.

