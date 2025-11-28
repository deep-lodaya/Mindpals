# Quick Diagnosis: Check Your Profiles Table

Run these SQL queries one at a time in Supabase SQL Editor to diagnose the issue:

## Query 1: Check all columns in profiles table
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

**Expected output should include:**
- id (uuid)
- username (text)
- name (text)
- user_type (text)
- coins (integer)
- created_at (timestamp)
- updated_at (timestamp)
- specialization (text)
- experience_years (integer)
- languages (jsonb)
- bio (text)
- rating (numeric)
- response_time_label (text)
- is_online (boolean)

---

## Query 2: Check RLS policies
```sql
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**You should see 4 policies:**
- users_read_own_profile
- users_update_own_profile
- users_insert_own_profile
- service_role_all_access

---

## Query 3: Check if RLS is enabled
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
```

**Should show: rowsecurity = true**

---

## Query 4: Try manual insert to test RLS
```sql
-- This should work (service role can insert)
INSERT INTO public.profiles (id, username, name, user_type, coins)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test_user',
  'Test User',
  'user',
  0
);

-- Check if it was inserted
SELECT * FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Clean up
DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
```

---

## What to Report

Run all 4 queries and tell me:
1. What columns are missing (if any)?
2. What are the actual RLS policy names?
3. Is rowsecurity = true?
4. Can the manual insert in Query 4 succeed?

This will help identify exactly what's blocking the signup.
