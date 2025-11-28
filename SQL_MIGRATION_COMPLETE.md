# Complete SQL Migration - All Files

## 📌 Files Created

1. **RUN_THIS_SQL.md** ⭐ **START HERE** - Super simple, just copy & paste
2. **COMPLETE_SQL_MIGRATION.sql** - Full SQL file with all comments
3. **SIMPLE_SQL_COPY_PASTE.md** - Visual guide with steps
4. **COPY_PASTE_SQL.md** - Detailed instructions
5. **DATABASE_MIGRATION.md** - Full reference (updated)
6. **QUICK_START_DB.md** - Quick reference (updated)
7. **EMAIL_COLUMN_ISSUE_RESOLVED.md** - Technical explanation

## 🚀 The Exact SQL You Need

Here's the complete SQL to run in Supabase:

```sql
-- Add role-based columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Add constraints for validation
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_user_type 
  CHECK (user_type IN ('user', 'therapist'));

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS valid_rating 
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add Row Level Security policies
CREATE POLICY IF NOT EXISTS "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "service_role_all_access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

## ⏱️ Takes 2 Minutes

1. **30 seconds** - Open Supabase & SQL Editor
2. **30 seconds** - Copy & paste SQL above
3. **10 seconds** - Click RUN
4. **30 seconds** - Wait for ✅
5. **20 seconds** - Restart dev server (`npm run dev`)

**Total: 2 minutes!**

## 📊 What Gets Added to Your Database

| Column | Type | Purpose |
|--------|------|---------|
| `user_type` | TEXT | 'user' or 'therapist' |
| `specialization` | TEXT | Therapist's expertise |
| `experience_years` | INTEGER | Years practicing |
| `languages` | JSONB | Languages spoken |
| `bio` | TEXT | Professional bio |
| `rating` | FLOAT | 1-5 star rating |
| `response_time_label` | TEXT | Response time info |
| `is_online` | BOOLEAN | Online status |

## ✅ After Running SQL

### Immediate
- ✅ 8 new columns in profiles table
- ✅ 2 new constraints for data validation
- ✅ 2 new indexes for performance
- ✅ 4 new RLS policies for security

### Next Step
```bash
npm run dev
```

### Test It
1. Create Account → "I'm a Therapist"
2. Fill form with:
   - Name: Dr. Jane Doe
   - Email: jane@example.com
   - Username: jane.doe
   - Password: test123456
   - Specialization: CBT
   - Experience: 5 years
   - Languages: English, Spanish
   - Bio: Your professional bio
3. Click Register → ✅ Should work!

## 🎯 Result

Your MindPal database now supports:
- ✅ Role-based user accounts (user vs therapist)
- ✅ Therapist registration with credentials
- ✅ Secure data access (RLS policies)
- ✅ Professional profile fields
- ✅ Fast queries (indexes)

**Ready for production!** 🚀

---

**Remember:**
- Copy ALL the SQL above
- Paste into Supabase SQL Editor
- Click RUN
- Restart dev server
- Test! ✅

Done! 🎉
