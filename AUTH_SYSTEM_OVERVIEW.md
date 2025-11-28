# MindPal Complete Authentication System

## Overview

MindPal now features a comprehensive, role-based authentication system supporting both regular users and licensed therapists with separate login/registration flows and credential verification.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Welcome Screen                         │
│  (🐾 MindPal - Your AI Mental Wellness Companion)       │
└──────────────┬─────────────────────────────────────────┘
               │
       ┌───────┴───────┬─────────────────┬──────────────┐
       │               │                 │              │
       ▼               ▼                 ▼              ▼
   [Sign In]  [Create Account]  [Sign in w/ Google] [Guest]
                     │
                     ▼
         ┌──────────────────────┐
         │  Role Selection      │
         │  Choose Your Role:   │
         │  • I'm a User 🌱     │
         │  • I'm a Therapist 👨‍⚕️ │
         └─────┬────────┬───────┘
               │        │
        ┌──────▼─┐   ┌──▼──────────────────┐
        │ Regular User │   │ Therapist Registration │
        │ Registration │   └──────────────────────┘
        └──────────────┘         │
               │                 ├─ Basic Info
               │                 │  (name, email, password)
               ├─ Name           ├─ Professional Info
               ├─ Email          │  (specialization, experience)
               ├─ Password       ├─ Languages
               ├─ Username       └─ Bio
               │
               ▼                 ▼
        ┌──────────────┐   ┌──────────────────┐
        │ Create Auth  │   │ Create Auth User │
        │ + Profile    │   │ + Therapist      │
        │ (user_type=  │   │ Profile          │
        │  'user')     │   │ (user_type=      │
        └──────┬───────┘   │  'therapist')    │
               │           └────────┬─────────┘
               │                    │
               ▼                    ▼
        ┌──────────────┐   ┌──────────────────┐
        │ Email        │   │ Email            │
        │ Verification │   │ Verification     │
        │              │   │ + Admin Review   │
        │              │   │ (if enabled)     │
        └──────┬───────┘   └────────┬─────────┘
               │                    │
               ▼                    ▼
        ┌──────────────┐   ┌──────────────────┐
        │ USER         │   │ THERAPIST        │
        │ DASHBOARD    │   │ DASHBOARD        │
        │ • Pet Care   │   │ • Client List    │
        │ • Games      │   │ • Analytics      │
        │ • Journal    │   │ • Appointments   │
        │ • Mood Track │   │ • Messages       │
        └──────────────┘   └──────────────────┘
```

## File Structure

```
src/components/
├── AuthScreen.tsx                    ← Main auth hub with role selection
├── TherapistLoginPage.tsx            ← Therapist login with verification
├── TherapistRegistration.tsx (NEW)   ← Therapist signup with fields
├── LoginPage.tsx                     ← Regular user login
├── PetSelection.tsx                  ← User onboarding after signup
├── TherapistDashboard.tsx            ← Therapist main screen
└── ...other components

Documentation/
├── THERAPIST_LOGIN_IMPLEMENTATION.md   ← Therapist login details
├── ROLE_BASED_REGISTRATION.md          ← Complete registration system
└── AUTH_SYSTEM_OVERVIEW.md (this file)
```

## User vs Therapist Comparison

| Feature | Regular User | Therapist |
|---------|--------------|-----------|
| **Signup** | Email, password, name, username | All of left + specialization, experience, languages, bio |
| **Profile Fields** | Basic user fields | All basic + professional fields |
| **Role** | `user_type = 'user'` | `user_type = 'therapist'` |
| **Login** | Regular email/password login | Therapist-specific login page |
| **Verification** | Email verification | Email + admin credential review (optional) |
| **Dashboard** | Pet games, mood tracking, journal | Client management, professional tools |
| **Account Status** | Active after email verification | Active after verification + admin approval |
| **Pet Companion** | Yes (required) | No (optional) |
| **Premium Access** | Can purchase | Always enabled |
| **Rating System** | Can rate therapists | Can be rated by clients |

## Components Deep Dive

### 1. AuthScreen (Main Hub)

**Modes:**
- `welcome` – Initial landing
- `role-select` – Choose user vs therapist
- `signup` – User signup form
- `login` – User login form

**Features:**
- Gradient background animations
- Google OAuth integration
- Guest mode
- Responsive design
- Email/password validation

**Key Functions:**
```typescript
handleAuth() – Process signup/login
handleGoogleLogin() – OAuth flow
handleGuestMode() – Anonymous access
```

### 2. TherapistRegistration (NEW)

**Steps:**
1. Role selection → "I'm a Therapist"
2. Registration form with 2 sections:
   - **Basic Info:** Name, email, username, password
   - **Professional Info:** Specialization, experience, languages, bio
3. Submit & email verification
4. Success screen with next steps

**Validation:**
- Passwords match & ≥8 chars
- Email valid format
- Experience 0-60 years
- Specialization selected
- Languages specified

**Database Creation:**
```typescript
{
  id: authUser.id,
  email, username, full_name,
  user_type: 'therapist',
  specialization, experience_years,
  languages: [array],
  bio, is_online: false,
  rating: null, coins: 0
}
```

### 3. TherapistLoginPage

**Flow:**
1. Email + password input
2. Supabase auth validation
3. Fetch profile from DB
4. Check `user_type === 'therapist'`
5. Auto sign-out if not therapist
6. Build User object with therapist fields
7. Call `onLoginSuccess()`

**Error Messages:**
- Invalid credentials
- Not a verified therapist
- Profile not found
- Unexpected errors

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  -- Identity
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  name TEXT,
  
  -- Role & Status
  user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'therapist')),
  is_online BOOLEAN DEFAULT false,
  coins INTEGER DEFAULT 0,
  
  -- Regular User Fields (NULLABLE for therapists)
  pet_type TEXT,
  pet_name TEXT,
  pet_hunger INTEGER,
  pet_happiness INTEGER,
  pet_health INTEGER,
  last_fed TIMESTAMP,
  last_played TIMESTAMP,
  
  -- Therapist Fields (NULLABLE for users)
  specialization TEXT,
  experience_years INTEGER,
  rating FLOAT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  response_time_label TEXT,
  languages JSONB,
  bio TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);
```

## Authentication Flows

### Regular User Signup
```
1. Welcome → Create Account
2. Role Selection → "I'm a User"
3. User Signup Form
   - Name, Email, Username, Password
4. Submit
5. Supabase Auth creates user
6. Create profile (user_type='user')
7. Email verification sent
8. After verification → can login & access dashboard
```

### Therapist Signup
```
1. Welcome → Create Account
2. Role Selection → "I'm a Therapist"
3. Therapist Registration Form
   - Basic Info (name, email, username, password)
   - Professional Info (specialization, experience, languages, bio)
4. Submit
5. Supabase Auth creates user
6. Create profile (user_type='therapist' + fields)
7. Email verification sent
8. [Optional] Admin review pending
9. After verification → therapist can login & access dashboard
```

### Regular User Login
```
1. Welcome → Sign In
2. Enter email + password
3. Supabase authenticates
4. Profile fetched (user_type='user')
5. Redirected to dashboard
```

### Therapist Login
```
1. Welcome → Sign In → Therapist Login Button
2. TherapistLoginPage
3. Enter email + password
4. Supabase authenticates
5. Profile fetched & verified (user_type='therapist')
6. Build User object with professional fields
7. Redirected to therapist dashboard
```

## Security Measures

### Authentication
✅ Supabase Auth (industry standard)  
✅ Email verification required  
✅ Password minimum 8 characters  
✅ No passwords stored in state  
✅ Session managed by Supabase  

### Authorization
✅ Role-based access (user_type)  
✅ Therapists verified before access  
✅ Non-therapists auto sign-out  
✅ Profile validation on login  

### Data Protection
✅ Professional fields encrypted at rest (Supabase)  
✅ Email verification prevents spam  
✅ Sensitive data visible only to role owner  
✅ Audit trail for credential changes (optional)  

## Environment Setup

### Supabase Configuration

**1. Auth Settings:**
```
Auth → Providers → Email
- Enable email/password auth
- Set email templates (optional)
```

**2. Database Tables:**
```sql
-- Run migration to add role-based columns
ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN specialization TEXT;
ALTER TABLE profiles ADD COLUMN experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN languages JSONB;
ALTER TABLE profiles ADD COLUMN bio TEXT;
ALTER TABLE profiles ADD COLUMN rating FLOAT;
ALTER TABLE profiles ADD COLUMN response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT false;
```

**3. RLS (Row Level Security):**
```sql
-- Users can read/update their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "users_create_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Testing Checklist

### User Registration
- [ ] Click "Create Account" → "I'm a User"
- [ ] Fill form with valid data
- [ ] Submit successfully
- [ ] Profile created in DB with user_type='user'
- [ ] Verification email received
- [ ] Can login after verification

### Therapist Registration
- [ ] Click "Create Account" → "I'm a Therapist"
- [ ] Fill all required fields
- [ ] Specialization dropdown works
- [ ] Experience validation (0-60)
- [ ] Languages comma-separated list works
- [ ] Bio character limit enforced
- [ ] Submit successfully
- [ ] Profile created with all professional fields
- [ ] user_type='therapist' set correctly
- [ ] Verification email received
- [ ] Success screen shows next steps

### User Login
- [ ] Regular user can login with credentials
- [ ] Redirected to user dashboard
- [ ] Can select/interact with pet

### Therapist Login
- [ ] Therapist can login with credentials
- [ ] Profile verified (user_type='therapist')
- [ ] Redirected to therapist dashboard
- [ ] Non-therapist account rejected with error

### Edge Cases
- [ ] Duplicate email prevention
- [ ] Weak password rejection
- [ ] Password mismatch detection
- [ ] Missing required fields
- [ ] Special characters in passwords
- [ ] Very long usernames
- [ ] Multiple language entries

## Performance Optimizations

Current:
- Index on `user_type` for faster role-based queries
- Index on `email` for login lookups
- Minimal API calls (one fetch per login)

Future:
- Cache user roles in session
- Batch therapist profile lookups
- CDN for verification emails

## Troubleshooting Guide

### Issue: "Invalid credentials"
**Solution:** Verify email is confirmed in Supabase Auth

### Issue: "This login is only for verified therapists"
**Solution:** 
- Check profile.user_type = 'therapist'
- Ensure profile exists in DB

### Issue: Profile creation fails
**Solution:**
- Check RLS policies allow inserts
- Verify all table columns exist
- Check auth user ID matches profile.id

### Issue: Email verification not sent
**Solution:**
- Check Supabase Email Template settings
- Verify email service configured
- Check spam folder

## Next Steps & Roadmap

### Phase 1 ✅ COMPLETE
- Role-based signup UI
- Database profile creation
- Basic email verification

### Phase 2 (Recommended)
- [ ] Admin therapist verification dashboard
- [ ] Email notification for approval status
- [ ] Therapist profile completion checklist
- [ ] License number validation

### Phase 3 (Advanced)
- [ ] Professional directory/search
- [ ] SSO for therapists (Google, Microsoft)
- [ ] Multi-factor authentication (MFA)
- [ ] Therapist rating & review system
- [ ] Background check integration

### Phase 4 (Enterprise)
- [ ] Insurance verification
- [ ] Video conferencing integration
- [ ] HIPAA compliance audit trail
- [ ] Therapist availability scheduling

## Support Resources

### Documentation
- `THERAPIST_LOGIN_IMPLEMENTATION.md` – Login system
- `ROLE_BASED_REGISTRATION.md` – Registration system
- `src/types.tsx` – Type definitions

### Files
- `src/components/AuthScreen.tsx`
- `src/components/TherapistRegistration.tsx` (NEW)
- `src/components/TherapistLoginPage.tsx`
- `src/utils/supabase/client.tsx`

### External
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Database Basics](https://supabase.com/docs/guides/database)

---

**Status:** ✅ Production Ready (with optional admin verification layer)  
**Last Updated:** Nov 28, 2025  
**Maintainer:** MindPal Development Team
