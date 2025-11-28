# Supabase Database Migration Guide

## Issue
The therapist registration feature requires additional columns in the `profiles` table that don't currently exist:
- `bio`
- `specialization`
- `experience_years`
- `languages`
- `rating`
- `response_time_label`
- `user_type`
- `is_online`

## Solution

### Step 1: Run SQL Migration in Supabase

Go to **Supabase Dashboard** → **SQL Editor** and run the following migration:

```sql
-- Add therapist-specific columns to profiles table
-- Run this migration to support role-based user types
-- NOTE: Email is stored in auth.users, not profiles

-- Add user_type column (distinguish between 'user' and 'therapist')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';

-- Add therapist-specific columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Add constraints
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_user_type 
  CHECK (user_type IN ('user', 'therapist'));

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_rating 
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
```

### Step 2: Verify the Changes

Run this query to confirm the columns were added:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Expected new columns:
- `user_type` (TEXT, default 'user')
- `specialization` (TEXT, nullable)
- `experience_years` (INTEGER, nullable)
- `languages` (JSONB, default [])
- `bio` (TEXT, nullable)
- `rating` (FLOAT, nullable)
- `response_time_label` (TEXT, nullable)
- `is_online` (BOOLEAN, default false)

**Note:** Email is stored in `auth.users`, not in `profiles`

### Step 3: Update RLS Policies (Optional but Recommended)

Add these RLS policies to ensure proper access control:

```sql
-- Allow users to read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "service_role_all_access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

## Detailed Column Descriptions

| Column | Type | Purpose | Required |
|--------|------|---------|----------|
| `user_type` | TEXT | Distinguish between 'user' and 'therapist' | Yes (DEFAULT: 'user') |
| `specialization` | TEXT | Therapist's area of expertise (e.g., "CBT", "Psychotherapy") | No (therapist only) |
| `experience_years` | INTEGER | Years of professional experience | No (therapist only) |
| `languages` | JSONB | Array of languages therapist speaks | No (therapist only, DEFAULT: []) |
| `bio` | TEXT | Professional biography/description | No (therapist only) |
| `rating` | FLOAT | Average rating from clients (1-5) | No (therapist only, initially NULL) |
| `response_time_label` | TEXT | e.g., "Usually responds in 2 hours" | No (therapist only) |
| `is_online` | BOOLEAN | Current online status | No (DEFAULT: false) |

## Testing the Migration

After running the migration, test with these queries:

```sql
-- Check current profiles
SELECT id, user_type, specialization, experience_years, is_online
FROM profiles
LIMIT 5;

-- Check for therapist profiles
SELECT id, specialization, experience_years, languages, rating
FROM profiles
WHERE user_type = 'therapist';

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

## Troubleshooting

### Error: "relation "profiles" does not exist"
**Solution:** The profiles table hasn't been created. Create it first:

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  name TEXT,
  avatar_url TEXT,
  coins INTEGER DEFAULT 0,
  pet_type TEXT,
  pet_name TEXT,
  pet_hunger INTEGER,
  pet_happiness INTEGER,
  pet_health INTEGER,
  last_fed TIMESTAMP,
  last_played TIMESTAMP,
  user_type TEXT DEFAULT 'user',
  specialization TEXT,
  experience_years INTEGER,
  languages JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  rating FLOAT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  response_time_label TEXT,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies
CREATE POLICY "users_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Error: "column already exists"
**Solution:** This is fine! The `IF NOT EXISTS` clause prevents errors. Proceed to Step 2 to verify.

### Columns still not showing in app
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Stop dev server and restart
3. Check Supabase project is correct (verify projectId and apiKey in `src/utils/supabase/info.tsx`)

## Post-Migration Steps

### 1. Refresh Schema Cache
In Supabase dashboard:
- Go to **SQL Editor** → Run any query → Schema cache refreshes automatically

### 2. Restart Development Server
```bash
# Stop current dev server (Ctrl+C)
# Restart it
npm run dev
```

### 3. Test Registration Flow
1. Go to app → Create Account → Choose "I'm a Therapist"
2. Fill out all fields including specialization, experience, languages
3. Submit and verify profile is created successfully

### 4. Verify Data
In Supabase dashboard → **Table Editor** → **profiles**
- Check new therapist records have all fields populated
- Verify `user_type = 'therapist'` for therapist accounts
- Verify `user_type = 'user'` for regular user accounts

## Backup Before Migration (Recommended)

If you have existing data, backup first:

```sql
-- Backup current profiles
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- You can restore with:
-- DELETE FROM profiles; INSERT INTO profiles SELECT * FROM profiles_backup;
```

## Next Steps

After migration:
1. ✅ Run SQL migration (Step 1)
2. ✅ Verify columns exist (Step 2)
3. ✅ Update RLS policies (Step 3)
4. ✅ Restart dev server
5. ✅ Test therapist registration
6. ✅ Test therapist login
7. ✅ Check data in table editor

All set! Your database will now support role-based user types and therapist profiles.
