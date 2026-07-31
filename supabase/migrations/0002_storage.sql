-- =============================================================================
--  Stockage des visuels
--
--  Un seul compartiment `media`, organisé par dossiers :
--    media/collections/<id>/<fichier>   photos d'une collection
--    media/gallery/<fichier>            mosaïque de la vitrine
--    media/content/<fichier>            hero, à propos, portraits
--
--  Lecture publique (le site sert les images), écriture réservée au personnel.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 Mo : la compression côté client descend bien en dessous
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lecture ---------------------------------------------------------------------
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

-- Écriture --------------------------------------------------------------------
drop policy if exists media_staff_insert on storage.objects;
create policy media_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists media_staff_update on storage.objects;
create policy media_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());

drop policy if exists media_staff_delete on storage.objects;
create policy media_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
