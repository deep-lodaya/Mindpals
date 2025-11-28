# Fix RLS Policy Issue with Auth Trigger

## Problem
When new users sign up, they get an RLS policy violation:
```
new row violates row-level security policy for table "profiles"
```

## Root Cause
Your RLS policy requires `auth.uid() = id` to insert, but the profile row doesn't exist yet when the user tries to create it.

## Solution: Create Auth Trigger

Run this SQL in your Supabase SQL Editor to automatically create a profile row when a new user signs up:

```sql
-- ============================================================================
-- Create Auth Trigger for Automatic Profile Creation
-- ============================================================================

-- Step 1: Create the trigger function
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

-- Step 2: Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## How It Works

1. When a user signs up with `supabase.auth.signUp()`, a new row is created in `auth.users`
2. The `on_auth_user_created` trigger fires automatically
3. The `handle_new_user()` function extracts user metadata and creates a matching `profiles` row
4. The new profile row has `id = auth.uid()`, so RLS policies are satisfied
5. Then your app can update the profile with additional fields (specialization, bio, etc.)

## Implementation for Your App

Your signup code will now work like this:

```typescript
// Step 1: Sign up creates auth user (trigger creates profile automatically)
const { data, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      username: username,
      user_type: userRole, // 'user' or 'therapist'
    },
  },
});

// Step 2: Now you can immediately update the profile with full details
// (for therapists, add specialization, languages, bio, etc.)
if (data.user) {
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      specialization: specialization,
      experience_years: experience_years,
      languages: languages,
      bio: bio,
      is_online: true,
      // ... other therapist fields
    })
    .eq('id', data.user.id);
}
```

## Testing

1. Paste the SQL trigger code into Supabase SQL Editor and run it
2. Restart your dev server: `npm run dev`
3. Test registration again - it should now work!
4. Verify in Supabase Table Editor that new profiles are being created automatically

## Next Steps

After running this SQL trigger, your registration code can be simplified because the profile row is automatically created. The app just needs to update it with additional fields.
