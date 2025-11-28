# ⚡ Quick Start: Database Migration

## The Error You Got
```
Profile setup failed: Could not find the 'bio' column of 'profiles' in the schema cache
```

## Why It Happened
Your Supabase `profiles` table is missing therapist-specific columns needed for the new role-based system.

## How to Fix (5 Minutes)

### Option 1: Automated (Recommended)
```bash
# Make script executable
chmod +x SETUP_DATABASE.sh

# Run it
./SETUP_DATABASE.sh
```

This will show you the exact SQL to run.

### Option 2: Manual SQL Migration

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Left sidebar → SQL Editor
   - Click "New query"

3. **Copy & Paste This:**

```sql
-- Add therapist-specific columns (safe to run - uses IF NOT EXISTS)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
```

4. **Click RUN**
5. **Wait for green checkmark**

### Option 3: Complete Schema (If Table Doesn't Exist)

If your `profiles` table doesn't exist, create it first:

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  name TEXT,
  coins INTEGER DEFAULT 0,
  user_type TEXT DEFAULT 'user',
  specialization TEXT,
  experience_years INTEGER,
  languages JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  rating FLOAT,
  response_time_label TEXT,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## After Running Migration

### 1. Restart Dev Server
```bash
# Stop: Ctrl+C
# Then:
npm run dev
```

### 2. Test It
1. Go to app → Create Account
2. Choose "I'm a Therapist"
3. Fill in all fields
4. Click "Register as Therapist"
5. ✅ Should succeed!

### 3. Verify in Supabase
- Go to Table Editor
- Click "profiles"
- Should see new records with therapist data

## Columns Added

| Column | Purpose |
|--------|---------|
| `user_type` | 'user' or 'therapist' |
| `specialization` | Therapist's expertise area |
| `experience_years` | Years of practice |
| `languages` | Languages spoken |
| `bio` | Professional description |
| `rating` | Client ratings (1-5) |
| `response_time_label` | "Usually responds in X hours" |
| `is_online` | Online status |

**Note:** Email is stored in `auth.users`, not in `profiles` table. The code has been updated to reflect this.

## Troubleshooting

### Still Getting the Error?
1. Check if columns actually exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles';
```

2. Make sure you're in the right Supabase project
   - Check `src/utils/supabase/info.tsx`
   - Verify projectId matches dashboard URL

3. Clear cache and restart:
```bash
# Clear browser cache: Cmd+Shift+Delete
# Restart dev server
npm run dev
```

### Migration Failed?
- If you see "column already exists" - that's fine! Move on.
- If you see "relation profiles does not exist" - use Option 3 above
- Otherwise, read full docs: `DATABASE_MIGRATION.md`

## Done! 🎉

Your system is now ready for:
- ✅ Role-based user registration
- ✅ Therapist signup with credentials
- ✅ Therapist login & verification
- ✅ User vs Therapist dashboards

Next: Try registering as a therapist!

---

**Need Help?**
- See: `DATABASE_MIGRATION.md` (detailed guide)
- See: `AUTH_SYSTEM_OVERVIEW.md` (complete architecture)
- See: `ROLE_BASED_REGISTRATION.md` (registration system)
