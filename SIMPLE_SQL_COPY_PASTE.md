# 📋 SQL Migration - Copy & Paste Guide

## 🎯 What You Need to Do (3 Steps)

### Step 1: Copy This SQL Code ⬇️

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_user_type 
  CHECK (user_type IN ('user', 'therapist'));

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_rating 
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE POLICY IF NOT EXISTS "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "service_role_all_access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

### Step 2: Paste Into Supabase

1. Go to: https://app.supabase.com
2. Select your project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Paste the SQL above into the white text area
6. Click the blue **RUN** button

### Step 3: Restart & Test

```bash
npm run dev
```

Then test: Create Account → "I'm a Therapist" → Fill form → Submit → ✅ Done!

---

## 🎓 What This SQL Does

| What | Why |
|------|-----|
| `ADD COLUMN user_type` | Marks users as 'user' or 'therapist' |
| `ADD COLUMN specialization` | What therapist specializes in (CBT, DBT, etc.) |
| `ADD COLUMN experience_years` | How many years therapist has been practicing |
| `ADD COLUMN languages` | Languages therapist speaks |
| `ADD COLUMN bio` | Therapist's professional description |
| `ADD COLUMN rating` | Client ratings (1-5 stars) |
| `ADD COLUMN response_time_label` | e.g., "Usually responds in 2 hours" |
| `ADD COLUMN is_online` | Whether therapist is currently online |
| `ADD CONSTRAINT valid_user_type` | Ensures only 'user' or 'therapist' values |
| `ADD CONSTRAINT valid_rating` | Ensures ratings are 1-5 |
| `CREATE INDEX` | Makes queries fast |
| `CREATE POLICY` | Security - users can only see their own data |

---

## ✅ Success Indicators

After running the SQL, you should see:
- ✅ "Query executed successfully"
- ✅ No red error messages
- ✅ Green checkmark

Then test:
- ✅ Therapist registration works
- ✅ Data saves to database
- ✅ Can see new fields in Supabase Table Editor

---

## ❌ If Something Goes Wrong

| Error | Solution |
|-------|----------|
| "column already exists" | ✅ OK! Just means you already have it |
| "relation profiles does not exist" | Create the table first (see DATABASE_MIGRATION.md) |
| "permission denied" | RLS issue - run all 4 CREATE POLICY statements |
| Long SQL code not pasting | Copy it in sections, run each section separately |

---

## 📁 Related Files

- `COMPLETE_SQL_MIGRATION.sql` - Full SQL with comments
- `COPY_PASTE_SQL.md` - This file
- `DATABASE_MIGRATION.md` - Detailed reference
- `QUICK_START_DB.md` - Quick reference

---

**That's it! You're done!** 🎉
