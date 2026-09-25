-- Aivora Studio schema (clean start)
-- Multi-tenant by user_id; Identity Lock + production ops

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'Owner' check (role in ('Owner','Admin','Creator','Reviewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Studio settings (1 row per user for MVP)
create table if not exists public.studio_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  studio_name text not null default 'Aivora Studio',
  default_language text not null default 'es-CU',
  default_platform text not null default 'instagram',
  transparency_required boolean not null default true,
  require_review_before_library boolean not null default true,
  require_library_before_publish boolean not null default true,
  preferred_tools jsonb not null default '["gemini_image","gemini_video","higgsfield"]'::jsonb,
  social_handles jsonb not null default '{"instagram":"@aivora.creators"}'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);

-- Canonical identity for Aivora (per user workspace)
create table if not exists public.identity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Aivora',
  age int not null default 25,
  nationality text not null default 'Cubana',
  origin_city text not null default 'La Habana',
  bio text,
  transparency_note text,
  active_version_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.identity_versions (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid not null references public.identity_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version text not null,
  changelog text,
  appearance jsonb not null default '{}'::jsonb,
  personality jsonb not null default '{}'::jsonb,
  voice_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reference_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  status text not null default 'Candidate',
  image_path text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sku text,
  description text,
  specs jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  dimensions text,
  claims jsonb not null default '[]'::jsonb,
  visual_details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  concept text not null,
  format_hint text,
  campaign_hint text,
  status text not null default 'draft',
  production_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  objective text not null,
  status text not null default 'draft',
  product_id uuid references public.products(id) on delete set null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.productions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null default 'reel',
  status text not null default 'PLANNED',
  idea_id uuid references public.ideas(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  identity_lock jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.production_scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  scene_order int not null default 1,
  title text not null,
  description text,
  camera text,
  pose text,
  expression text,
  dialogue text,
  duration_sec int,
  override_lock boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  scene_id uuid not null references public.production_scenes(id) on delete cascade,
  tool text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  scene_id uuid not null references public.production_scenes(id) on delete cascade,
  kind text not null default 'image',
  storage_path text,
  file_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  production_id uuid not null references public.productions(id) on delete cascade,
  asset_id uuid not null references public.generated_assets(id) on delete cascade,
  checklist jsonb not null default '{}'::jsonb,
  decision text not null default 'PENDING',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.library_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  production_id uuid references public.productions(id) on delete set null,
  scene_id uuid,
  asset_id uuid,
  kind text not null default 'image',
  storage_path text,
  file_name text,
  tags jsonb not null default '[]'::jsonb,
  product_id uuid references public.products(id) on delete set null,
  approved_at timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  platform text not null,
  status text not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  library_asset_id uuid references public.library_assets(id) on delete set null,
  production_id uuid references public.productions(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  caption text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  platform text not null,
  format text,
  library_asset_id uuid references public.library_assets(id) on delete set null,
  publication_id uuid references public.publications(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.publication_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  publication_id uuid not null references public.publications(id) on delete cascade,
  platform text not null,
  views int not null default 0,
  reach int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  shares int not null default 0,
  saves int not null default 0,
  followers_gained int not null default 0,
  engagement_rate numeric(6,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'Creator',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Workspace bootstrap on signup (must be SECURITY DEFINER so auth.users trigger can write)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  iid uuid;
  vid uuid;
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 'Owner');

  insert into public.studio_settings (user_id) values (new.id);

  insert into public.identity_profiles (user_id, name, age, nationality, origin_city, bio, transparency_note)
  values (
    new.id,
    'Aivora',
    25,
    'Cubana',
    'La Habana',
    'Creadora virtual cubana creada con inteligencia artificial.',
    'Siempre debe quedar claro que Aivora es IA.'
  )
  returning id into iid;

  insert into public.identity_versions (identity_id, user_id, version, changelog, appearance, personality, voice_profile)
  values (
    iid,
    new.id,
    'v1',
    'Identidad canónica inicial',
    '{"face":"Rostro ovalado, rasgos suaves","eyes":"Verde oliva / avellana","hair":"Castaño ondulado a hombros","body":"Delgada-atlética natural","realism":"Fotorealismo alto"}'::jsonb,
    '{"traits":["cálida","auténtica","empática","curiosa"],"tone":"Conversacional, cercana","speech":"Español cubano natural","limits":["No chatbot","No caricatura"]}'::jsonb,
    '{"name":"Aivora Voice v1","description":"Femenina, cálida, habanera suave"}'::jsonb
  )
  returning id into vid;

  update public.identity_profiles set active_version_id = vid where id = iid;

  insert into public.team_members (user_id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Admin'), new.email, 'Owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.studio_settings enable row level security;
alter table public.identity_profiles enable row level security;
alter table public.identity_versions enable row level security;
alter table public.reference_assets enable row level security;
alter table public.products enable row level security;
alter table public.ideas enable row level security;
alter table public.campaigns enable row level security;
alter table public.productions enable row level security;
alter table public.production_scenes enable row level security;
alter table public.prompts enable row level security;
alter table public.generated_assets enable row level security;
alter table public.reviews enable row level security;
alter table public.library_assets enable row level security;
alter table public.publications enable row level security;
alter table public.calendar_items enable row level security;
alter table public.publication_metrics enable row level security;
alter table public.team_members enable row level security;

-- Owner policies (authenticated + auth.uid = user_id)
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','studio_settings','identity_profiles','identity_versions','reference_assets','products',
    'ideas','campaigns','productions','production_scenes','prompts','generated_assets','reviews',
    'library_assets','publications','calendar_items','publication_metrics','team_members'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t||'_select_own', t);
    execute format('drop policy if exists %I on public.%I', t||'_insert_own', t);
    execute format('drop policy if exists %I on public.%I', t||'_update_own', t);
    execute format('drop policy if exists %I on public.%I', t||'_delete_own', t);

    if t = 'profiles' then
      execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = id)', t||'_select_own', t);
      execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = id)', t||'_insert_own', t);
      execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id)', t||'_update_own', t);
    else
      execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t||'_select_own', t);
      execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t||'_insert_own', t);
      execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t||'_update_own', t);
      execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t||'_delete_own', t);
    end if;
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Storage bucket for media
insert into storage.buckets (id, name, public)
values ('aivora-media', 'aivora-media', false)
on conflict (id) do nothing;

drop policy if exists aivora_media_select on storage.objects;
drop policy if exists aivora_media_insert on storage.objects;
drop policy if exists aivora_media_update on storage.objects;
drop policy if exists aivora_media_delete on storage.objects;

create policy aivora_media_select on storage.objects for select to authenticated
using (bucket_id = 'aivora-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy aivora_media_insert on storage.objects for insert to authenticated
with check (bucket_id = 'aivora-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy aivora_media_update on storage.objects for update to authenticated
using (bucket_id = 'aivora-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'aivora-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy aivora_media_delete on storage.objects for delete to authenticated
using (bucket_id = 'aivora-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
