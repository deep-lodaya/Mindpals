# 🎯 COMPLETE SQL MIGRATION - Ready to Copy & Run

## Your SQL Code (Copy All of This)

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

## How to Run (3 Simple Steps)

### 1. Open Supabase SQL Editor
- Go to: https://app.supabase.com
- Select your project
- Left sidebar: **SQL Editor**
- Button: **New Query**

### 2. Paste the SQL
- Click in the white editor area
- Paste ALL the SQL code above (Cmd+V or Ctrl+V)

### 3. Click RUN
- Blue **RUN** button (bottom right)
- Wait for green checkmark ✅

## Then Restart Your App
```bash
npm run dev
```

## Test It Works
1. Go to app
2. **Create Account** → **"I'm a Therapist"**
3. Fill in all fields
4. **Register** → Should work! ✅

---

**That's all you need to do!** Your database is now ready for role-based therapist registration. 🎉
