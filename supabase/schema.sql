-- Activity Participant Database System
-- Schema mirrors the original design (provinces > districts > village clusters,
-- activity main/sub types, people, activities, activity participants).
-- Run this in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- Sequences must exist before the tables below, since their DEFAULT
-- expressions resolve the sequence name (via an implicit regclass cast)
-- at CREATE TABLE time, not at insert time.
create sequence if not exists people_code_seq;
create sequence if not exists activities_code_seq;

-- ---------- reference: location ----------

create table if not exists provinces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references provinces(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists districts_province_id_idx on districts(province_id);

create table if not exists village_clusters (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists village_clusters_district_id_idx on village_clusters(district_id);

-- ---------- reference: activity types ----------

create table if not exists activity_main_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists activity_sub_types (
  id uuid primary key default gen_random_uuid(),
  main_id uuid not null references activity_main_types(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_sub_types_main_id_idx on activity_sub_types(main_id);

-- ---------- people ----------

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default ('PSN-' || lpad(nextval('people_code_seq')::text, 3, '0')),
  first_name text not null,
  last_name text not null default '',
  gender text not null default 'male' check (gender in ('male', 'female')),
  province_id uuid references provinces(id) on delete set null,
  district_id uuid references districts(id) on delete set null,
  phone text default '',
  position text default '',
  office text default '',
  created_at timestamptz not null default now()
);
create index if not exists people_province_id_idx on people(province_id);
create index if not exists people_district_id_idx on people(district_id);

-- ---------- activities ----------

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default ('AC-' || extract(year from now())::text || '-' || lpad(nextval('activities_code_seq')::text, 3, '0')),
  name text not null,
  location text default '',
  province_id uuid references provinces(id) on delete set null,
  district_id uuid references districts(id) on delete set null,
  main_id uuid references activity_main_types(id) on delete set null,
  sub_id uuid references activity_sub_types(id) on delete set null,
  activity_date date,
  created_at timestamptz not null default now()
);
create index if not exists activities_province_id_idx on activities(province_id);
create index if not exists activities_district_id_idx on activities(district_id);
create index if not exists activities_main_id_idx on activities(main_id);

-- ---------- activity participants (join) ----------

create table if not exists activity_participants (
  activity_id uuid not null references activities(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  role text not null default 'participant'
    check (role in ('participant', 'chair', 'trainer', 'observer', 'other')),
  created_at timestamptz not null default now(),
  primary key (activity_id, person_id)
);
create index if not exists activity_participants_person_id_idx on activity_participants(person_id);

-- ---------- row level security ----------
-- This is an internal single-tenant admin tool with no auth layer in the
-- original design, so RLS is enabled with a permissive policy for the
-- anon/authenticated roles. Tighten this (e.g. require auth.uid()) before
-- exposing the anon key beyond a trusted internal network.

alter table provinces enable row level security;
alter table districts enable row level security;
alter table village_clusters enable row level security;
alter table activity_main_types enable row level security;
alter table activity_sub_types enable row level security;
alter table people enable row level security;
alter table activities enable row level security;
alter table activity_participants enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'provinces', 'districts', 'village_clusters',
    'activity_main_types', 'activity_sub_types',
    'people', 'activities', 'activity_participants'
  ])
  loop
    execute format('drop policy if exists "allow all for anon/authenticated" on %I;', t);
    execute format(
      'create policy "allow all for anon/authenticated" on %I for all using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ---------- seed data (matches the original design's demo data) ----------

with prov as (
  insert into provinces (name) values
    ('ນະຄອນຫຼວງວຽງຈັນ'),
    ('ຫຼວງພະບາງ'),
    ('ຈຳປາສັກ')
  returning id, name
),
dist as (
  insert into districts (province_id, name)
  select id, d.name from prov, (values
    ('ນະຄອນຫຼວງວຽງຈັນ', 'ຈັນທະບູລີ'),
    ('ນະຄອນຫຼວງວຽງຈັນ', 'ສີສັດຕະນາກ'),
    ('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊເສດຖາ'),
    ('ຫຼວງພະບາງ', 'ເມືອງຫຼວງພະບາງ'),
    ('ຫຼວງພະບາງ', 'ນ້ຳບາກ'),
    ('ຈຳປາສັກ', 'ໂພນທອງ'),
    ('ຈຳປາສັກ', 'ປາກເຊ')
  ) as d(province_name, name)
  where prov.name = d.province_name
  returning id, name, province_id
),
clus as (
  insert into village_clusters (district_id, name)
  select id, c.name from dist, (values
    ('ຈັນທະບູລີ', 'ສຸກສາລາ ບ້ານໂພນສີນວນ'),
    ('ຈັນທະບູລີ', 'ສຸກສາລາ ບ້ານທົ່ງກາງ'),
    ('ເມືອງຫຼວງພະບາງ', 'ສຸກສາລາ ບ້ານວັດຈອມສີ'),
    ('ປາກເຊ', 'ສຸກສາລາ ບ້ານໂພນສະອາດ')
  ) as c(district_name, name)
  where dist.name = c.district_name
  returning id
),
main as (
  insert into activity_main_types (name) values
    ('ຝຶກອົບຮົມ (Training)'),
    ('ປະຊຸມ (Meeting)'),
    ('ສຳມະນາ (Seminar)'),
    ('ເວີກຊອບ (Workshop)')
  returning id, name
),
sub as (
  insert into activity_sub_types (main_id, name)
  select id, s.name from main, (values
    ('ຝຶກອົບຮົມ (Training)', 'ຝຶກອົບຮົມວິຊາການ'),
    ('ຝຶກອົບຮົມ (Training)', 'ຝຶກອົບຮົມທັກສະ'),
    ('ປະຊຸມ (Meeting)', 'ປະຊຸມສາມັນ'),
    ('ປະຊຸມ (Meeting)', 'ປະຊຸມວິສາມັນ'),
    ('ສຳມະນາ (Seminar)', 'ສຳມະນາທາງວິຊາການ'),
    ('ເວີກຊອບ (Workshop)', 'ເວີກຊອບການວາງແຜນ')
  ) as s(main_name, name)
  where main.name = s.main_name
  returning id
)
select 1;

-- People and activities are left for the app to create via the UI once
-- connected to Supabase (their codes rely on the sequences above).
