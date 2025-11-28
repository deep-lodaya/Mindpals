# Data Persistence Issue - Diagnosis Steps

## Problem
Data disappears on page refresh even though RLS policies are applied.

## Root Cause
Most likely: Your Supabase Auth user IDs don't match the UUIDs in your `users` table. The RLS policies check `auth.uid() = users.id`, so if they don't match, all reads/writes are blocked.

## Quick Diagnosis (run these in Supabase SQL Editor)

### 1. Check what auth user IDs exist
```sql
-- Lists all Supabase Auth users and their IDs
SELECT id, email, created_at 
FROM auth.users 
LIMIT 10;
```
Copy the `id` value (e.g., `abc123...`).

### 2. Check what user IDs exist in your users table
```sql
-- Lists all users in your custom users table
SELECT id, email, username, coins 
FROM public.users 
LIMIT 10;
```

### 3. Compare
If the IDs from step 1 and step 2 **don't match**, that's the problem.

---

## Solution (pick one)

### Option A: Disable RLS temporarily (quick test, not for production)
If you want to confirm RLS is the blocker, run:
```sql
-- Disable RLS on users table to allow all reads/writes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;
```

Then refresh the app. If data now persists, RLS is the issue.

**To re-enable afterward:**
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
```

---

### Option B: Sync Auth UIDs with Users Table (Recommended)

**Before you do this:** Back up your `users` table or take a screenshot of important data.

#### For existing users:
If you have a test user with UUID `11111111-1111-1111-1111-111111111111` in `users`, you need to either:

a) **Migrate the user row to use the real auth UID:**
   - First, find the real auth UID from `auth.users` for the email you're testing with.
   - Then run:
   ```sql
   -- Example: replace the old UUID with the auth user's real UUID
   UPDATE public.users 
   SET id = 'REAL-AUTH-UUID-HERE'  -- Replace with actual auth UID
   WHERE email = 'test@example.com';
   ```

b) **Or create a new auth user:** 
   - Sign up a fresh account via the app (don't use the test user).
   - The RLS policies will allow that new auth user to manage their own rows.

#### For new signups going forward:
Once you sign up with real credentials, the app's session handler will create a matching `users` row automatically (with the correct `auth.uid()`).

---

### Option C: Create Server-Side Trigger (Most Robust)

Create an Auth trigger that automatically creates a `users` row when a new auth user signs up:

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, coins, streak_count)
  VALUES (
    new.id,
    new.email,
    new.user_metadata->>'username',
    100,
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

This ensures every new auth user automatically gets a matching `users` row with the same ID.

---

## Next Steps

1. **Run the diagnostic SQL above** (steps 1-2) and tell me:
   - Do the auth user IDs match the `users.id` values?
   - If not, which email/user are you testing with?

2. **Or test Option A** (disable RLS) to confirm RLS is the blocker.

3. Once confirmed, I'll help you pick the best solution and implement it.

---

## Debug Logs

Open browser DevTools → Console and look for:
- `⚠️ RLS Permission Denied: auth.uid() may not equal users.id` — RLS blocked the read
- `⚠️ RLS POLICY BLOCKED UPDATE` — RLS blocked the write

If you see these, RLS/ID mismatch is 100% the issue.
