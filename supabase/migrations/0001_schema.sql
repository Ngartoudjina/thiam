-- =============================================================================
--  Bijouterie THIAM 24 Carats — schéma de contenu
--  À exécuter dans l'éditeur SQL de Supabase, ou via `supabase db push`.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
--  Types
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('visible', 'hidden');
  end if;

  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'editor');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
--  Horodatage automatique
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
--  users — profil applicatif adossé à auth.users
-- -----------------------------------------------------------------------------

create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text        not null unique,
  full_name   text,
  role        public.user_role not null default 'editor',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is
  'Profils administrateurs. Une ligne ici autorise l''accès au tableau de bord ; un compte auth.users sans profil n''a aucun droit.';

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

-- Renseigne le profil dès la création du compte d'authentification.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case
      when (select count(*) from public.users) = 0 then 'admin'::public.user_role
      else 'editor'::public.user_role
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prédicat réutilisé par toutes les politiques d'écriture.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
--  collections
-- -----------------------------------------------------------------------------

create table if not exists public.collections (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  name         text        not null,
  tagline      text        not null default '',
  description  text,
  category     text        not null default 'bijoux',
  status       public.content_status not null default 'visible',
  position     integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint collections_name_not_blank check (length(btrim(name)) > 0)
);

create index if not exists collections_position_idx on public.collections (position);
create index if not exists collections_status_idx on public.collections (status);

drop trigger if exists collections_touch_updated_at on public.collections;
create trigger collections_touch_updated_at
  before update on public.collections
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
--  collection_images
-- -----------------------------------------------------------------------------

create table if not exists public.collection_images (
  id            uuid primary key default gen_random_uuid(),
  collection_id uuid        not null references public.collections (id) on delete cascade,
  storage_path  text        not null,
  alt           text        not null default '',
  width         integer     not null default 0,
  height        integer     not null default 0,
  position      integer     not null default 0,
  is_primary    boolean     not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists collection_images_collection_idx
  on public.collection_images (collection_id, position);

-- Une seule image principale par collection.
create unique index if not exists collection_images_single_primary_idx
  on public.collection_images (collection_id)
  where is_primary;

-- -----------------------------------------------------------------------------
--  gallery_images — mosaïque « Entrer dans la vitrine »
-- -----------------------------------------------------------------------------

create table if not exists public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  storage_path text        not null,
  alt          text        not null default '',
  caption      text,
  width        integer     not null default 0,
  height       integer     not null default 0,
  col_span     smallint    not null default 1 check (col_span between 1 and 2),
  row_span     smallint    not null default 2 check (row_span between 2 and 3),
  status       public.content_status not null default 'visible',
  position     integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists gallery_images_position_idx on public.gallery_images (position);

drop trigger if exists gallery_images_touch_updated_at on public.gallery_images;
create trigger gallery_images_touch_updated_at
  before update on public.gallery_images
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
--  services
-- -----------------------------------------------------------------------------

create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  icon        text        not null default 'repair',
  title       text        not null,
  description text        not null default '',
  price       text        not null default '',
  status      public.content_status not null default 'visible',
  position    integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint services_title_not_blank check (length(btrim(title)) > 0)
);

create index if not exists services_position_idx on public.services (position);

drop trigger if exists services_touch_updated_at on public.services;
create trigger services_touch_updated_at
  before update on public.services
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
--  testimonials
-- -----------------------------------------------------------------------------

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text        not null,
  author      text        not null,
  context     text        not null default '',
  rating      smallint    not null default 5 check (rating between 1 and 5),
  is_featured boolean     not null default false,
  status      public.content_status not null default 'visible',
  position    integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint testimonials_quote_not_blank check (length(btrim(quote)) > 0)
);

create index if not exists testimonials_position_idx on public.testimonials (position);

drop trigger if exists testimonials_touch_updated_at on public.testimonials;
create trigger testimonials_touch_updated_at
  before update on public.testimonials
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
--  faq
-- -----------------------------------------------------------------------------

create table if not exists public.faq (
  id         uuid primary key default gen_random_uuid(),
  question   text        not null,
  answer     text        not null,
  status     public.content_status not null default 'visible',
  position   integer     not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faq_question_not_blank check (length(btrim(question)) > 0)
);

create index if not exists faq_position_idx on public.faq (position);

drop trigger if exists faq_touch_updated_at on public.faq;
create trigger faq_touch_updated_at
  before update on public.faq
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
--  settings — blocs de contenu singuliers, en JSON typé côté application
--  Clés attendues : hero, about, contact, hours, social, stats
-- -----------------------------------------------------------------------------

create table if not exists public.settings (
  key        text primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_touch_updated_at on public.settings;
create trigger settings_touch_updated_at
  before update on public.settings
  for each row execute function public.touch_updated_at();

-- =============================================================================
--  Row Level Security
--  Lecture publique du contenu visible ; écriture réservée au personnel.
-- =============================================================================

alter table public.users             enable row level security;
alter table public.collections       enable row level security;
alter table public.collection_images enable row level security;
alter table public.gallery_images    enable row level security;
alter table public.services          enable row level security;
alter table public.testimonials      enable row level security;
alter table public.faq               enable row level security;
alter table public.settings          enable row level security;

-- users ----------------------------------------------------------------------
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists users_admin_write on public.users;
create policy users_admin_write on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- collections ----------------------------------------------------------------
drop policy if exists collections_public_read on public.collections;
create policy collections_public_read on public.collections
  for select using (status = 'visible' or public.is_staff());

drop policy if exists collections_staff_write on public.collections;
create policy collections_staff_write on public.collections
  for all using (public.is_staff()) with check (public.is_staff());

-- collection_images ----------------------------------------------------------
drop policy if exists collection_images_public_read on public.collection_images;
create policy collection_images_public_read on public.collection_images
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.collections c
      where c.id = collection_id and c.status = 'visible'
    )
  );

drop policy if exists collection_images_staff_write on public.collection_images;
create policy collection_images_staff_write on public.collection_images
  for all using (public.is_staff()) with check (public.is_staff());

-- gallery_images -------------------------------------------------------------
drop policy if exists gallery_images_public_read on public.gallery_images;
create policy gallery_images_public_read on public.gallery_images
  for select using (status = 'visible' or public.is_staff());

drop policy if exists gallery_images_staff_write on public.gallery_images;
create policy gallery_images_staff_write on public.gallery_images
  for all using (public.is_staff()) with check (public.is_staff());

-- services -------------------------------------------------------------------
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
  for select using (status = 'visible' or public.is_staff());

drop policy if exists services_staff_write on public.services;
create policy services_staff_write on public.services
  for all using (public.is_staff()) with check (public.is_staff());

-- testimonials ---------------------------------------------------------------
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select using (status = 'visible' or public.is_staff());

drop policy if exists testimonials_staff_write on public.testimonials;
create policy testimonials_staff_write on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());

-- faq ------------------------------------------------------------------------
drop policy if exists faq_public_read on public.faq;
create policy faq_public_read on public.faq
  for select using (status = 'visible' or public.is_staff());

drop policy if exists faq_staff_write on public.faq;
create policy faq_staff_write on public.faq
  for all using (public.is_staff()) with check (public.is_staff());

-- settings -------------------------------------------------------------------
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select using (true);

drop policy if exists settings_staff_write on public.settings;
create policy settings_staff_write on public.settings
  for all using (public.is_staff()) with check (public.is_staff());
