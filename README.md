# ລະບົບຂໍ້ມູນຜູ້ເຂົ້າຮ່ວມກິດຈະກຳ (Activity Participant Database System)

A bilingual (Lao/English) admin app for tracking activities, their participants,
and a reusable people database. Rebuilt as a Next.js + Supabase app from an
earlier prototype (kept in [`legacy-artifact/`](./legacy-artifact) for reference).

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
editor and run [`supabase/schema.sql`](./supabase/schema.sql). It creates all
tables (provinces, districts, village clusters, activity types, people,
activities, activity participants), enables row-level security with a
permissive policy, and seeds the location/type reference tables.

> The default RLS policy allows full read/write for the anon key, since this
> is an internal single-tenant tool with no auth layer yet. Tighten it (e.g.
> require `auth.uid()`) before exposing the anon key outside a trusted network.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
your Supabase project's API settings.

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without the env vars set,
the app still renders with a "Supabase is not configured" notice on each page.

## Structure

- `app/` — Next.js App Router pages: Dashboard, Activities (list + detail),
  People Database, Reference Tables
- `components/` — shared UI (`ui.js`), modals (`ActivityModal`, `PersonModal`),
  reference-table editors (`RefList.js`), and the sidebar shell (`AppShell.js`)
- `lib/api.js` — Supabase query functions
- `lib/useReferenceData.js` — shared hook for provinces/districts/clusters/types
- `lib/translations.js`, `lib/I18nContext.js` — Lao/English i18n
- `supabase/schema.sql` — database schema, RLS policies, and seed data
