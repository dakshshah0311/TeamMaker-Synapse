-- Preflight: inspect the existing profile schema, foreign keys, policies,
-- auth triggers, and profile-avatar bucket policies before applying changes.
SELECT
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT
  constraint_row.conname AS constraint_name,
  constraint_row.contype AS constraint_type,
  pg_get_constraintdef(constraint_row.oid) AS definition
FROM pg_constraint AS constraint_row
WHERE constraint_row.conrelid = 'public.profiles'::regclass
ORDER BY constraint_row.conname;

SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

SELECT
  t.tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_definition,
  p.oid::regprocedure AS function_name,
  pg_get_functiondef(p.oid) AS function_definition,
  t.tgenabled AS trigger_enabled
FROM pg_trigger AS t
JOIN pg_proc AS p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'auth.users'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'profile-avatars';

BEGIN;

DO $preflight$
DECLARE
  profile_id_attnum smallint;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'Expected existing public.profiles; this migration never creates a profile table.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
      AND udt_name = 'uuid'
  ) THEN
    RAISE EXCEPTION 'public.profiles.id must exist as UUID.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name IN ('name', 'email')
    GROUP BY table_schema, table_name
    HAVING COUNT(DISTINCT column_name) = 2
  ) THEN
    RAISE EXCEPTION 'Expected existing public.profiles.name and public.profiles.email columns.';
  END IF;

  SELECT attribute.attnum
  INTO profile_id_attnum
  FROM pg_attribute AS attribute
  WHERE attribute.attrelid = 'public.profiles'::regclass
    AND attribute.attname = 'id'
    AND NOT attribute.attisdropped;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_index AS profile_index
    WHERE profile_index.indrelid = 'public.profiles'::regclass
      AND profile_index.indisunique
      AND profile_index.indisvalid
      AND profile_index.indnkeyatts = 1
      AND profile_index.indkey[0] = profile_id_attnum
  ) THEN
    RAISE EXCEPTION 'public.profiles.id must have a unique constraint/index for safe profile updates.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_trigger AS t
    WHERE t.tgfoid = to_regprocedure('public.create_profile_from_auth_user()')
      AND t.tgrelid <> 'auth.users'::regclass
      AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'The existing profile trigger function is attached to another table; inspect it before updating.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_trigger AS t
    JOIN pg_proc AS p ON p.oid = t.tgfoid
    WHERE t.tgrelid = 'auth.users'::regclass
      AND NOT t.tgisinternal
      AND (
        t.tgname = 'on_auth_user_created'
        OR p.prosrc ILIKE '%profiles%'
        OR p.proname ILIKE '%profile%'
      )
      AND p.oid IS DISTINCT FROM to_regprocedure('public.create_profile_from_auth_user()')
  ) THEN
    RAISE EXCEPTION 'An existing auth.users profile-related trigger uses another function. Inspect the preflight output before proceeding; no trigger was replaced.';
  END IF;
END
$preflight$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tech_stack text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS avatar_url text;

DO $username_preflight$
BEGIN
  IF EXISTS (
    SELECT lower(btrim(username))
    FROM public.profiles
    WHERE username IS NOT NULL
      AND btrim(username) <> ''
    GROUP BY lower(btrim(username))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate profile usernames exist (case-insensitive). Resolve duplicates before adding the unique username index.';
  END IF;
END
$username_preflight$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(btrim(username)))
  WHERE username IS NOT NULL AND btrim(username) <> '';

CREATE OR REPLACE FUNCTION public.create_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, username)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'name'), ''),
      'Synapse Member'
    ),
    NEW.email,
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'username'), '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

DO $function_owner$
DECLARE
  profile_table_owner name;
BEGIN
  SELECT pg_get_userbyid(relation.relowner)
  INTO profile_table_owner
  FROM pg_class AS relation
  WHERE relation.oid = 'public.profiles'::regclass;

  EXECUTE format(
    'ALTER FUNCTION public.create_profile_from_auth_user() OWNER TO %I',
    profile_table_owner
  );
END
$function_owner$;

REVOKE ALL ON FUNCTION public.create_profile_from_auth_user() FROM PUBLIC;

DO $ensure_profile_trigger$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger AS t
    WHERE t.tgrelid = 'auth.users'::regclass
      AND t.tgfoid = 'public.create_profile_from_auth_user()'::regprocedure
      AND NOT t.tgisinternal
  ) THEN
    EXECUTE '
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_profile_from_auth_user()
    ';
  END IF;
END
$ensure_profile_trigger$;

-- Backfill only missing rows; existing user-edited profile data is preserved.
INSERT INTO public.profiles (id, name, email, username)
SELECT
  auth_user.id,
  COALESCE(
    NULLIF(BTRIM(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(BTRIM(auth_user.raw_user_meta_data ->> 'name'), ''),
    'Synapse Member'
  ),
  auth_user.email,
  NULLIF(BTRIM(auth_user.raw_user_meta_data ->> 'username'), '')
FROM auth.users AS auth_user
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;

DO $replace_profile_policies$
DECLARE
  existing_policy record;
BEGIN
  FOR existing_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', existing_policy.policyname);
  END LOOP;

  CREATE POLICY profiles_select_own
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

  CREATE POLICY profiles_update_own
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);
END
$replace_profile_policies$;

REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (name, username, bio, skills, tech_stack, avatar_url)
  ON TABLE public.profiles TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = false;

DROP POLICY IF EXISTS teamforge_profile_avatars_owner_guard ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_read_own ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_upload_own ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_update_own ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_delete_own ON storage.objects;

-- A restrictive guard also narrows any pre-existing broad storage policies,
-- but only for this bucket; unrelated Storage buckets are not affected.
CREATE POLICY teamforge_profile_avatars_owner_guard
  ON storage.objects
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (
    bucket_id <> 'profile-avatars'
    OR (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      AND (SELECT auth.uid()) IS NOT NULL
    )
  )
  WITH CHECK (
    bucket_id <> 'profile-avatars'
    OR (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      AND (SELECT auth.uid()) IS NOT NULL
    )
  );

CREATE POLICY teamforge_profile_avatars_read_own
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY teamforge_profile_avatars_upload_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY teamforge_profile_avatars_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY teamforge_profile_avatars_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

COMMIT;
