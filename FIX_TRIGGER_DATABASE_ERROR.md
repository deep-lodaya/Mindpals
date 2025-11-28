# Fix: Database Error Saving New User - Trigger RLS Issue

## Problem
Auth signup fails with: `Database error saving new user`

This happens because the trigger function (which runs as `service_role`) is trying to insert into the `profiles` table, but RLS policies might be blocking it or there's an issue with the trigger.

## Solution

Run this updated SQL in Supabase SQL Editor to fix the trigger:

```sql
-- ============================================================================
-- FIXED: Auth Trigger with Better Error Handling
-- ============================================================================

-- Step 1: Drop the old trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create improved trigger function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    name,
    user_type,
    coins
  )
  VALUES (
    new.id,
    COALESCE(new.user_metadata->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.user_metadata->>'full_name', new.email),
    COALESCE(new.user_metadata->>'user_type', 'user'),
    0
  );
  
  RETURN new;
EXCEPTION WHEN others THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

## If the Above Doesn't Work

If you still get the error, the issue might be with RLS policies blocking the service role. Run this to check:

```sql
-- Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- If needed, temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Then test signup in your app

-- After testing works, re-enable it:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## Alternative: Remove Metadata Requirement

If the trigger is still failing, try simplifying it to not rely on metadata:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, user_type, coins)
  VALUES (
    new.id,
    split_part(new.email, '@', 1),
    split_part(new.email, '@', 1),
    'user',
    0
  );
  RETURN new;
EXCEPTION WHEN others THEN
  RAISE WARNING 'Profile creation failed: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Testing

1. Run the SQL above
2. Restart dev server: `npm run dev`
3. Try signup again

## Still Getting Errors?

Check Supabase logs:
1. Go to Supabase Dashboard → Logs
2. Look for any trigger function errors
3. Share what you see in the logs

The most common causes:
- RLS policy blocking the service role insert
- Missing columns in profiles table
- Data type mismatch (e.g., `coins` must be INTEGER)
