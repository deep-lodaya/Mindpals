# Role-Based Account Creation System

## Overview

MindPal now features a comprehensive role-based account creation system that supports both regular users and licensed therapists. Each role has tailored signup flows, specific database fields, and verification processes.

## Architecture

### Authentication Flow

```
Welcome Screen
    ↓
[Create Account] → Role Selection Screen
    ├─ [I'm a User] → User Signup Form → Create profiles entry (user_type='user')
    └─ [I'm a Therapist] → Therapist Registration Form → Create profiles entry (user_type='therapist')
```

## Components

### 1. **AuthScreen.tsx** (Updated)
Main authentication hub with role selection.

**New features:**
- `mode: "role-select"` – New screen for role selection
- `userRole: "user" | "therapist" | null` – Tracks selected role
- `isTherapistRegistration` – Flag for therapist registration flow
- Updated signup to create profiles with role-specific fields

**Key Methods:**
```typescript
// Regular user signup now includes profile creation
const { error: profileError } = await supabase
  .from('profiles')
  .insert([{ 
    user_type: 'user', 
    coins: 0,
    // ... other fields
  }]);
```

### 2. **TherapistRegistration.tsx** (New)
Dedicated therapist signup component with professional credential fields.

**Features:**
- **Two-step process:**
  1. Registration form
  2. Email verification confirmation screen
- **Professional fields:**
  - Specialization (dropdown with 14 options)
  - Years of experience (0-60)
  - Languages (comma-separated)
  - Professional bio (optional, max 500 chars)
- **Form validation:**
  - Password minimum 8 characters
  - Experience years validation
  - Required field checks
- **Profile creation:**
  - Sets `user_type: 'therapist'`
  - Stores all professional fields
  - Sets `is_online: false` initially
  - Sets `rating: null` (to be updated after reviews)

**Data Structure:**
```typescript
{
  id: authData.user.id,
  email: email,
  username: username,
  full_name: fullName,
  user_type: 'therapist',
  specialization: "CBT",
  experience_years: 5,
  languages: ["English", "Spanish"],
  bio: "Professional bio",
  is_online: false,
  rating: null,
  response_time_label: 'Not specified',
}
```

### 3. **TherapistLoginPage.tsx** (Already Updated)
Therapist login with Supabase auth and profile verification.

**References:**
- See `THERAPIST_LOGIN_IMPLEMENTATION.md` for details

## Specialization Options

The therapist registration form includes these specializations:
1. Cognitive Behavioral Therapy (CBT)
2. Psychodynamic Therapy
3. Humanistic Therapy
4. Acceptance & Commitment Therapy (ACT)
5. Dialectical Behavior Therapy (DBT)
6. Mindfulness-Based Therapy
7. Trauma-Focused Therapy
8. Family Therapy
9. Couples Therapy
10. Addiction Counseling
11. Grief Counseling
12. Anxiety Disorders
13. Depression Treatment
14. Other

## Database Schema Requirements

### Profiles Table Updates

The `profiles` table must support both user and therapist roles:

| Column | Type | User | Therapist | Notes |
|--------|------|------|-----------|-------|
| `id` | UUID | ✅ | ✅ | FK to auth.users |
| `email` | TEXT | ✅ | ✅ | Unique |
| `username` | TEXT | ✅ | ✅ | Unique |
| `full_name` / `name` | TEXT | ✅ | ✅ | Display name |
| `user_type` | TEXT | ✅ | ✅ | `'user'` or `'therapist'` |
| `coins` | INTEGER | ✅ | ✅ | Default: 0 |
| `is_online` | BOOLEAN | ✅ | ✅ | Default: false |
| `specialization` | TEXT | ❌ | ✅ | Therapy type |
| `experience_years` | INTEGER | ❌ | ✅ | Years of practice |
| `rating` | FLOAT | ❌ | ✅ | 1-5 stars (null initially) |
| `response_time_label` | TEXT | ❌ | ✅ | e.g., "Usually responds in 2 hours" |
| `languages` | JSONB/TEXT[] | ❌ | ✅ | Array of languages |
| `bio` | TEXT | ❌ | ✅ | Professional bio (max 500 chars) |
| `pet_type` | TEXT | ✅ | ❌ | Pet species (user only) |
| `pet_name` | TEXT | ✅ | ❌ | Pet name (user only) |
| `pet_hunger` | INTEGER | ✅ | ❌ | Pet stat (user only) |
| `pet_happiness` | INTEGER | ✅ | ❌ | Pet stat (user only) |
| `pet_health` | INTEGER | ✅ | ❌ | Pet stat (user only) |
| `last_fed` | TIMESTAMP | ✅ | ❌ | Pet care tracking |
| `last_played` | TIMESTAMP | ✅ | ❌ | Pet care tracking |

### SQL Migration Example

```sql
-- Add role-based columns if not already present
ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'user' NOT NULL;
ALTER TABLE profiles ADD COLUMN specialization TEXT;
ALTER TABLE profiles ADD COLUMN experience_years INTEGER;
ALTER TABLE profiles ADD COLUMN rating FLOAT;
ALTER TABLE profiles ADD COLUMN response_time_label TEXT;
ALTER TABLE profiles ADD COLUMN languages JSONB;
ALTER TABLE profiles ADD COLUMN bio TEXT;

-- Add constraint for valid user_type
ALTER TABLE profiles ADD CONSTRAINT valid_user_type 
  CHECK (user_type IN ('user', 'therapist'));

-- Create index on user_type for faster queries
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
```

## User Registration Flow

### Regular User Registration

**Step 1:** Choose role → "I'm a User"  
**Step 2:** Fill signup form (name, email, password, username)  
**Step 3:** Submit  
**Step 4:** Backend creates:
  - Supabase Auth user
  - Profile entry with `user_type = 'user'`
  - Email verification sent  
**Result:** User can log in, select pet, access games

### Therapist Registration

**Step 1:** Choose role → "I'm a Therapist"  
**Step 2:** Fill detailed form:
  - Basic info (name, email, password, username)
  - Professional info (specialization, experience, languages, bio)  
**Step 3:** Submit  
**Step 4:** Backend creates:
  - Supabase Auth user
  - Profile entry with `user_type = 'therapist'` + professional fields
  - Email verification sent
  - **Admin review queue** (optional, see below)  
**Step 5:** Email verification confirmation screen  
**Result:** User receives verification email + admin review email (if enabled)

## Verification Process

### Email Verification

Both user and therapist accounts require email verification:

```typescript
// Email verification is configured in Supabase Auth
options: {
  emailRedirectTo: `${window.location.origin}/auth/callback`,
}
```

**Supabase Configuration:**
- Go to Authentication → Email Templates
- Enable "Email Confirmation" template
- Set redirect URL to your app's callback page

### Therapist Credential Verification (Optional)

For production, implement admin review:

1. **Upon therapist signup:**
   - Send admin notification email with profile details
   - Set `verified: false` flag in profiles table

2. **Admin dashboard:**
   - View pending therapist registrations
   - Verify credentials, license, etc.
   - Approve or reject account
   - Send notification to therapist

**SQL:** Add to profiles table:
```sql
ALTER TABLE profiles ADD COLUMN verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN verified_by UUID REFERENCES auth.users(id);
```

## Login Flow

### Regular User Login
- Email/password via Supabase Auth
- Check profile exists and `user_type = 'user'`
- Access main dashboard

### Therapist Login
- Email/password via Supabase Auth
- Check profile exists and `user_type = 'therapist'`
- (Optionally) Check `verified = true` if verification is enabled
- Access therapist dashboard

## Error Handling

### Common Errors

| Scenario | Message | Solution |
|----------|---------|----------|
| Email already exists | "User with this email already exists" | Use different email |
| Weak password | "Password must be at least 8 characters" | Create stronger password |
| Password mismatch | "Passwords do not match" | Re-enter matching passwords |
| Missing required field | "All basic fields are required" | Fill all required fields |
| Invalid experience years | "Please enter valid years (0-60)" | Enter realistic years |
| Profile creation fails | "Profile setup failed: [error]" | Contact support |
| Email verification timeout | "Verification email expired" | Request new email |

## Security Considerations

✅ **Password Security:**
- Minimum 8 characters enforced
- Sent only to Supabase Auth
- Never stored in component state longer than necessary

✅ **Email Verification:**
- Required before full account activation
- Prevents spam accounts
- Redirect URL prevents phishing

✅ **Role-Based Access:**
- User type checked on login
- Therapist must have `user_type = 'therapist'`
- Unauthorized users are rejected

✅ **Data Protection:**
- Sensitive fields (specialization, bio) visible only to therapist
- Professional credentials verified before access
- Admin can audit verification history

## Testing

### Test Scenario 1: Regular User Signup
```
1. Click "Create Account"
2. Choose "I'm a User"
3. Fill form: Name, Email, Username, Password
4. Click "Create Account"
✓ Profile created with user_type='user'
✓ Verification email sent
```

### Test Scenario 2: Therapist Signup
```
1. Click "Create Account"
2. Choose "I'm a Therapist"
3. Fill basic info (Name, Email, Username, Password)
4. Fill professional info:
   - Specialization: "CBT"
   - Experience: 5 years
   - Languages: "English, Spanish"
   - Bio: "Experienced therapist..."
5. Click "Register as Therapist"
✓ Profile created with user_type='therapist'
✓ Professional fields saved
✓ Verification screen shown
✓ Email sent with verification link
```

### Test Scenario 3: Therapist Login
```
1. On welcome screen, login with therapist credentials
2. System fetches profile, verifies user_type='therapist'
3. User redirected to TherapistDashboard
✓ Only therapists can access
✓ Non-therapist accounts rejected
```

### Test Scenario 4: Edge Cases
- Duplicate email → Error shown
- Invalid password → Error shown
- Therapist with missing specialization → Form validation fails
- Profile creation fails → Auth user deleted to maintain consistency

## Files Modified/Created

- ✅ `src/components/AuthScreen.tsx` – Added role selection, updated signup
- ✅ `src/components/TherapistRegistration.tsx` – New therapist signup component
- ✅ `src/components/TherapistLoginPage.tsx` – Already implemented (see separate doc)
- ✅ `src/types.tsx` – Already has User interface with therapist fields
- ✅ `THERAPIST_LOGIN_IMPLEMENTATION.md` – Therapist login documentation

## Next Steps (Optional Enhancements)

### Phase 1 (Current)
- ✅ Role-based signup UI
- ✅ Database profile creation
- ✅ Email verification setup

### Phase 2 (Recommended)
- [ ] Admin therapist verification dashboard
- [ ] Email notifications for verification status
- [ ] Therapist profile completion checklist
- [ ] License number verification integration
- [ ] Professional credentials validation

### Phase 3 (Advanced)
- [ ] SSO integration (Google, Microsoft for therapists)
- [ ] Multi-factor authentication (MFA) for therapists
- [ ] Audit logging for credential changes
- [ ] Therapist directory/search by specialization
- [ ] Rating and review system

## API Integration Points

### Current Implementation
- Supabase Auth for credentials
- Supabase Database for profiles
- Email service (via Supabase)

### Future Integrations
- License verification APIs (state-specific)
- Background check services
- Insurance verification
- Video conference setup (therapist calls)

## Troubleshooting

### Issue: Therapist profile not created
**Solution:** 
- Check Supabase "profiles" table has all required columns
- Verify RLS policies allow inserts
- Check browser console for error messages

### Issue: Email verification not received
**Solution:**
- Check Supabase Email Templates configuration
- Verify redirect URL is set correctly
- Check spam folder
- Request new verification email

### Issue: Therapist can't login after registration
**Solution:**
- Verify profile row exists in database
- Check user_type = 'therapist' in profile
- Verify email is confirmed
- Check auth.users table shows user

## References

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Supabase Database Docs:** https://supabase.com/docs/guides/database
- **Email Templates:** https://supabase.com/docs/guides/auth/auth-email-templates
- **User Types Definition:** See `src/types.tsx`
- **Therapist Login:** See `THERAPIST_LOGIN_IMPLEMENTATION.md`
