# Step-by-Step: Fix RLS Policy Issue

## The Problem
You're getting: `new row violates row-level security policy for table "profiles"`

## The Solution (3 Steps)

### Step 1: Run Auth Trigger SQL
1. Go to [Supabase Dashboard](https://app.supabase.com) → SQL Editor
2. Click "New Query"
3. Copy and paste this entire SQL block:

```sql
-- Create Auth Trigger for Automatic Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    name,
    user_type,
    coins,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.user_metadata->>'username', new.email),
    COALESCE(new.user_metadata->>'full_name', ''),
    COALESCE(new.user_metadata->>'user_type', 'user'),
    0,
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **RUN**
5. You should see: `Success. No rows returned`

### Step 2: Restart Your Dev Server
```bash
npm run dev
```

### Step 3: Test Registration
1. In your app, click "Sign Up"
2. Select role: "I'm a Therapist"
3. Fill in form and submit
4. Should work now! ✅

## How It Works

**Before:** 
- User signs up → RLS policy blocks profile insert because no row exists yet → Error

**After:**
- User signs up → Auth trigger fires → Creates profile row automatically → App can update it → Success ✅

## Verification

After testing, check Supabase Table Editor:
1. Go to Supabase Dashboard → Table Editor
2. Click "profiles" table
3. You should see new profiles appearing with `user_type = 'user'` or `user_type = 'therapist'`

## Need Help?

If you still get errors:
- Check browser DevTools → Console for detailed error messages
- The SQL might not have run properly - try running each statement separately
- Make sure RLS is still enabled on the profiles table (it should be)

---

## Technical Details (Optional Reading)

The trigger works by:
1. Listening to the `auth.users` table for new user insertions
2. Extracting metadata: `username`, `full_name`, `user_type` from auth user metadata
3. Creating matching profile row with `id = auth.uid()` (same as auth user ID)
4. Now RLS policies are satisfied: `auth.uid() = profiles.id` ✅

This is the recommended Supabase pattern for role-based auth systems.
