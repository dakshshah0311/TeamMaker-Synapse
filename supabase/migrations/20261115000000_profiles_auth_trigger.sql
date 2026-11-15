-- Inspect the existing profile schema, constraints, policies, and auth triggers
-- before this migration makes any changes.
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
ORDER BY conname;

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
  trigger_name,
  pg_get_triggerdef(trigger_oid) AS trigger_definition,
  function_definition,
  trigger_enabled
FROM (
  SELECT
    t.tgname AS trigger_name,
    t.oid AS trigger_oid,
    pg_get_functiondef(t.tgfoid) AS function_definition,
    t.tgenabled AS trigger_enabled
  FROM pg_trigger AS t
  WHERE t.tgrelid = 'auth.users'::regclass
    AND NOT t.tgisinternal
) AS auth_triggers
ORDER BY trigger_name;

BEGIN;

DO $preflight$
DECLARE
  profile_id_attnum smallint;
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'Expected existing table public.profiles; no table was created.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
      AND udt_name = 'uuid'
  ) THEN
    RAISE EXCEPTION 'public.profiles.id must exist and be UUID before installing the auth trigger.';
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
    RAISE EXCEPTION 'public.profiles.id needs a unique constraint or index to prevent duplicate profiles.';
  END IF;

  IF to_regprocedure('public.create_profile_from_auth_user()') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM pg_trigger AS t
       WHERE t.tgfoid = to_regprocedure('public.create_profile_from_auth_user()')
         AND t.tgrelid <> 'auth.users'::regclass
         AND NOT t.tgisinternal
     ) THEN
    RAISE EXCEPTION 'public.create_profile_from_auth_user() is already used by another table trigger; inspect it before changing the function.';
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
      AND (
        t.tgname <> 'on_auth_user_created'
        OR p.oid IS DISTINCT FROM to_regprocedure('public.create_profile_from_auth_user()')
        OR t.tgtype <> 5
        OR t.tgqual IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'An existing auth.users profile-related trigger needs manual review. See the preflight trigger definitions; no trigger or profile policy was changed.';
  END IF;
END
$preflight$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;

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

DO $replace_policies$
DECLARE
  existing_policy record;
BEGIN
  -- Replace every existing policy so permissive policies cannot broaden access.
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
$replace_policies$;

DO $create_trigger$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger AS t
    WHERE t.tgrelid = 'auth.users'::regclass
      AND t.tgfoid = 'public.create_profile_from_auth_user()'::regprocedure
      AND NOT t.tgisinternal
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_trigger AS t
      WHERE t.tgrelid = 'auth.users'::regclass
        AND t.tgfoid = 'public.create_profile_from_auth_user()'::regprocedure
        AND NOT t.tgisinternal
        AND t.tgenabled IN ('D', 'R')
    ) THEN
      RAISE EXCEPTION 'The existing profile trigger is disabled or replica-only; inspect it and enable it explicitly.';
    END IF;
    RAISE NOTICE 'An auth.users trigger already uses create_profile_from_auth_user(); no duplicate trigger was created.';
  ELSE
    EXECUTE '
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_profile_from_auth_user()
    ';
  END IF;
END
$create_trigger$;

COMMIT;
