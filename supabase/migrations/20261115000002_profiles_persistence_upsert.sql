-- Inspect the real existing profile schema, constraints, and policies first.
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

BEGIN;

DO $profile_preflight$
DECLARE
  profile_id_attnum smallint;
  skills_type text;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'Expected the existing public.profiles table; no profile table will be created.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
      AND udt_name = 'uuid'
  ) THEN
    RAISE EXCEPTION 'public.profiles.id must exist as UUID to match auth.uid().';
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
    RAISE EXCEPTION 'The existing profile schema must contain name and email; this migration maps the form full name to name.';
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
    RAISE EXCEPTION 'public.profiles.id needs a unique index or constraint for upsert(onConflict: id).';
  END IF;

  SELECT udt_name
  INTO skills_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'skills';

  IF skills_type IS NOT NULL AND skills_type NOT IN ('_text', '_varchar', 'json', 'jsonb') THEN
    RAISE EXCEPTION 'Unsupported public.profiles.skills type: %. Expected text[], varchar[], json, or jsonb.', skills_type;
  END IF;
END
$profile_preflight$;

-- The existing table uses name, not full_name. Add only missing profile fields.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tech_stack text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Preserve paths written by the earlier profile editor migration, if present.
DO $migrate_avatar_path$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'avatar_path'
  ) THEN
    EXECUTE '
      UPDATE public.profiles
      SET avatar_url = avatar_path
      WHERE avatar_url IS NULL
        AND avatar_path IS NOT NULL
    ';
  END IF;
END
$migrate_avatar_path$;

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
    RAISE EXCEPTION 'Duplicate profile usernames exist (case-insensitive). Resolve those duplicates before saving unique usernames.';
  END IF;
END
$username_preflight$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(btrim(username)))
  WHERE username IS NOT NULL AND btrim(username) <> '';

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

  CREATE POLICY profiles_insert_own
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

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
GRANT INSERT (id, name, email, username, bio, skills, tech_stack, avatar_url)
  ON TABLE public.profiles TO authenticated;
GRANT UPDATE (id, name, email, username, bio, skills, tech_stack, avatar_url)
  ON TABLE public.profiles TO authenticated;

-- Keep profile images private. The stored avatar_url is the user's Storage path;
-- the frontend generates an authenticated signed URL for display.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS teamforge_profile_avatars_owner_guard ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_read_own ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_upload_own ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_update_own ON storage.objects;
DROP POLICY IF EXISTS teamforge_profile_avatars_delete_own ON storage.objects;

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

SELECT
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY cmd, policyname;

SELECT
  relation.relrowsecurity AS row_level_security_enabled,
  relation.relforcerowsecurity AS row_level_security_forced
FROM pg_class AS relation
WHERE relation.oid = 'public.profiles'::regclass;

COMMIT;

NOTIFY pgrst, 'reload schema';
