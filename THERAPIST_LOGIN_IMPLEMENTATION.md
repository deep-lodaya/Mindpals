# TherapistLoginPage – Supabase Authentication Implementation

## Overview
The `TherapistLoginPage` component has been refactored to use **Supabase authentication** instead of hardcoded credentials. This implementation ensures that only verified therapists (with `user_type === 'therapist'`) can access the therapist dashboard.

## Changes Made

### 1. **TherapistLoginPage.tsx** (`src/components/TherapistLoginPage.tsx`)

#### Before (Hardcoded):
```typescript
// Hardcoded credentials
const THERAPIST_EMAIL = 'therapist@mindpal.app';
const THERAPIST_PASSWORD = 'supersecretpassword';
const THERAPIST_CRR = '12345';

// Fake delay and hardcoded user object
const therapistUser: User = {
  id: 'therapist-123',
  name: 'Dr. Sarah Mitchell',
  // ...
};
```

#### After (Supabase):
The component now:
1. **Signs in** with Supabase using email/password: `supabase.auth.signInWithPassword()`
2. **Fetches the profile** from the `profiles` table using the auth user's ID
3. **Verifies therapist status** by checking `profile.user_type === 'therapist'`
4. **Signs out** if the user is not a therapist
5. **Builds a complete User object** with all required fields including therapist-specific data
6. **Handles errors gracefully** with user-friendly messages

#### Key Implementation Details:
```typescript
// Step 1: Sign in
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Step 2: Fetch profile
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', authData.user.id)
  .single();

// Step 3: Verify therapist status
if (profile.user_type !== 'therapist') {
  await supabase.auth.signOut();
  setError('This login is only for verified therapists...');
}

// Step 4: Build User object
const therapistUser: User = {
  id: profile.id,
  email: authData.user.email || profile.email,
  name: profile.full_name || profile.name,
  user_type: 'therapist',
  is_Premium: true,
  // ... plus therapist-specific fields from profile
  specialization: profile.specialization,
  experience_years: profile.experience_years,
  rating: profile.rating,
  response_time_label: profile.response_time_label,
  languages: profile.languages,
  bio: profile.bio,
  is_online: profile.is_online,
};
```

#### UI Changes:
- **Removed** the "Central Rehabilitation Register (CRR) Number" field (no longer needed)
- **Kept** email and password fields
- **Maintained** all existing styling and animations
- **Kept** error display and loading states

### 2. **types.tsx** (`src/types.tsx`)

Added comprehensive type definitions:

#### New `User` Interface:
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  user_type: 'user' | 'therapist';
  is_Premium: boolean;
  createdAt: Date;
  selected_pet: string | null;
  coins: number;
  journal_entries: JournalEntry[];
  pet_mood: 'happy' | 'sad' | 'calm' | ...;
  // Therapist-specific fields (optional for regular users)
  specialization?: string | null;
  experience_years?: number | null;
  rating?: number | null;
  response_time_label?: string | null;
  languages?: string[] | null;
  bio?: string | null;
  is_online?: boolean;
}
```

#### New `JournalEntry` Interface:
```typescript
export interface JournalEntry {
  id?: string;
  mood: 'happy' | 'sad' | 'calm' | ...;
  content: string;
  date: Date;
  confidence?: number;
  aiAnalysis?: string;
}
```

#### Updated `Profile` Type:
Extended to match the database schema with therapist-specific fields.

#### Added `PetType`:
```typescript
export type PetType = 'cat' | 'dog' | 'penguin' | 'rabbit';
```

## Supabase Database Schema Requirements

For this implementation to work, your Supabase `profiles` table must have the following columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | ✅ | Foreign key to `auth.users.id` |
| `email` | TEXT | ✅ | User email |
| `username` | TEXT | ✅ | Unique username |
| `full_name` | TEXT | ❌ | User's full name |
| `name` | TEXT | ❌ | Alternative full name field |
| `user_type` | TEXT | ✅ | `'user'` or `'therapist'` |
| `coins` | INTEGER | ✅ | User's coin balance |
| `specialization` | TEXT | ❌ | Therapist specialization (e.g., "CBT", "Psychotherapy") |
| `experience_years` | INTEGER | ❌ | Years of professional experience |
| `rating` | FLOAT | ❌ | Therapist rating (1-5) |
| `response_time_label` | TEXT | ❌ | Response time info |
| `languages` | JSONB or TEXT[] | ❌ | Languages the therapist speaks |
| `bio` | TEXT | ❌ | Therapist biography |
| `is_online` | BOOLEAN | ❌ | Online status |

## Error Handling

The component now provides user-friendly error messages for:

1. **Invalid Credentials**: "Authentication failed. Please check your credentials."
2. **Profile Not Found**: "Unable to fetch your profile. Please contact support."
3. **Not a Therapist**: "This login is only for verified therapists. Please contact support if you believe this is an error."
4. **Unexpected Errors**: "An unexpected error occurred. Please try again."

## Security Features

✅ **No hardcoded credentials** – Uses Supabase Auth  
✅ **Role-based access control** – Only `user_type === 'therapist'` can log in  
✅ **Automatic sign-out** – Non-therapists are signed out immediately  
✅ **Password not stored** – Only sent to Supabase Auth  
✅ **Session persistence** – Handled by Supabase client

## Testing

### To Test Locally:

1. **Create a therapist account in Supabase**:
   - Go to Supabase dashboard → Authentication → Users
   - Create a new user with email and password
   - Create/update their profile in the `profiles` table with `user_type = 'therapist'`

2. **Run the dev server**:
   ```bash
   npm run dev
   ```

3. **Navigate to therapist login**:
   - Click "Login as Therapist" from the auth screen
   - Enter your therapist credentials
   - Verify you're redirected to the TherapistDashboard

### Test Cases:

- ✅ Therapist with correct credentials → success
- ❌ Non-therapist account → rejected with error message
- ❌ Invalid credentials → authentication error
- ❌ Non-existent profile → fetch error

## Files Modified

1. `src/components/TherapistLoginPage.tsx` – Updated authentication logic
2. `src/types.tsx` – Added User, JournalEntry, and updated Profile types

## Next Steps (Optional Enhancements)

- [ ] Add "Forgot Password" functionality using Supabase
- [ ] Implement therapist registration/onboarding flow
- [ ] Add 2FA (Two-Factor Authentication) for therapist accounts
- [ ] Create admin dashboard to manage therapist verification status
- [ ] Add email verification requirement for therapist signups
- [ ] Implement rate limiting on login attempts

## References

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase Client**: `src/utils/supabase/client.tsx`
- **User Types**: `src/types.tsx`
