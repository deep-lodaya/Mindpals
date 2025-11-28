# Schema Diagnosis Guide

## Your Error
```
ERROR: 42703: column "email" does not exist
```

This means your `profiles` table doesn't have an `email` column.

## Step 1: Check Actual Schema

Run this query in Supabase SQL Editor to see what columns you actually have:

```sql
-- See all columns in your profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Copy the results and note which columns exist.

## Step 2: Likely Scenarios

### Scenario A: New Empty Table
Your table probably has just:
- `id` (UUID)
- Maybe `updated_at`
- Nothing else

### Scenario B: Table with Some Columns
You might have:
- `id`
- `username`
- `full_name` or `name`
- `avatar_url`
- Maybe some pet-related columns
- But NO `email`

## Step 3: Updated Migration (No Email References)

Run **this instead** of the previous migration:

```sql
-- Add only what's missing (safe to run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Add constraint
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_user_type 
  CHECK (user_type IN ('user', 'therapist'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
```

## Step 4: Verify It Worked

```sql
-- This should work now
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

## Step 5: If You Need Email Column

If your app needs email stored in profiles (not just auth), add it:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Optional: Make it unique
ALTER TABLE profiles ADD CONSTRAINT unique_email UNIQUE (email);
```

## Complete Schema Template

If you want to recreate profiles from scratch with everything:

```sql
-- Drop old table if needed (WARNING: deletes data!)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create complete profiles table
CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  coins INTEGER DEFAULT 0,
  
  -- Pet fields (for regular users)
  pet_type TEXT,
  pet_name TEXT,
  pet_hunger INTEGER,
  pet_happiness INTEGER,
  pet_health INTEGER,
  last_fed TIMESTAMP,
  last_played TIMESTAMP,
  
  -- Role & therapist fields
  user_type TEXT DEFAULT 'user',
  specialization TEXT,
  experience_years INTEGER,
  languages JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  rating FLOAT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  response_time_label TEXT,
  is_online BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "users_read_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX idx_user_type ON profiles(user_type);
CREATE INDEX idx_username ON profiles(username);
```

## Next: Update Registration Code

Once your schema is fixed, we'll need to update `TherapistRegistration.tsx` to:
1. NOT try to insert `email` into profiles (since auth.email exists separately)
2. Only insert fields that actually exist in your table

## Questions to Answer

1. **What columns DO exist in your profiles table?**
   - Run the query from Step 1 and tell me the results

2. **Is this a fresh project or migrating from something?**
   - Fresh → use Complete Schema Template
   - Existing → adapt based on what's there

3. **Do you want email stored in profiles or just in auth?**
   - Just in auth → don't add it
   - In both → add with migration

---

**Next: Run Step 1 query and share results so I can give you exact SQL to run!**
