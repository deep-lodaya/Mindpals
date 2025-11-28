# 🚀 COPY-PASTE SQL MIGRATION - Step by Step

## The Complete SQL Code (Copy Everything Below)

```sql
-- ============================================================================
-- MindPal Therapist Role-Based System - Complete Database Migration
-- ============================================================================

-- STEP 1: Add therapist-specific columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- STEP 2: Add constraints
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_user_type 
  CHECK (user_type IN ('user', 'therapist'));

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_rating 
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- STEP 4: Add RLS Policies
CREATE POLICY IF NOT EXISTS "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "service_role_all_access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

---

## How to Run It

### Step 1️⃣: Open Supabase
Go to: **https://app.supabase.com**

### Step 2️⃣: Select Your Project
Click on your MindPal project

### Step 3️⃣: Open SQL Editor
Left sidebar → **SQL Editor**

### Step 4️⃣: Create New Query
Click: **New Query** (or **New** → **SQL Query**)

### Step 5️⃣: Copy All SQL Above
Select all the SQL code from the box above (starts with `--` and ends after the last `FOR`)

### Step 6️⃣: Paste Into Editor
- Right-click in the SQL editor
- Select **Paste** (or Cmd+V / Ctrl+V)

### Step 7️⃣: Click RUN
Big blue **RUN** button in bottom right

### Step 8️⃣: Wait for Success ✅
You should see a green checkmark and "Query executed successfully"

---

## After Running SQL

### 1. Restart Your Dev Server
```bash
# Press Ctrl+C in your terminal to stop
# Then:
npm run dev
```

### 2. Test It
1. Go to http://localhost:3001 (or wherever your app is)
2. Click: **Create Account**
3. Choose: **"I'm a Therapist"**
4. Fill in:
   - Full Name: Dr. John Smith
   - Username: john.smith
   - Email: john@example.com
   - Password: something123
   - Confirm Password: something123
   - Specialization: Cognitive Behavioral Therapy (CBT)
   - Years of Experience: 5
   - Languages: English, Spanish
   - Bio: I'm an experienced therapist...
5. Click: **Register as Therapist**
6. ✅ Should work!

### 3. Verify in Supabase
- Go back to Supabase dashboard
- Left sidebar → **Table Editor**
- Click: **profiles**
- Scroll right to see new columns (user_type, specialization, etc.)
- Look for your new therapist record

---

## What If I Get an Error?

### Error: "column already exists"
✅ **OK!** This means you already have that column. Keep going.

### Error: "relation profiles does not exist"
❌ Your profiles table doesn't exist. 
→ See: `DATABASE_MIGRATION.md` → Troubleshooting → Create Table section

### Error: "permission denied" or RLS error
⚠️ RLS (Row Level Security) might be blocking. 
→ Go to Supabase → Authentication → Policies
→ Check if profiles table has RLS enabled

### Error: "42703: column does not exist"
❌ Different column is missing.
→ Check which column in the error message
→ Add it manually using: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS [column_name] [type];`

---

## All Done! ✅

Your database now supports:
- ✅ Role-based user types (user vs therapist)
- ✅ Therapist professional fields (specialization, experience, languages, bio, rating)
- ✅ Online status tracking
- ✅ Secure RLS policies

Next: Test therapist registration! 🎉
