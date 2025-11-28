export type PetType = 'cat' | 'dog' | 'penguin' | 'rabbit';

export interface Pet {
  color: string;
  id: string;           // or number if you prefer
  name: string;
  emoji: string;        // e.g. "🐶"
  type: PetType;        // used in petAnimations[pet.type]
  description: string;
}

// User type for both regular users and therapists
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
  pet_mood: 'happy' | 'sad' | 'calm' | 'angry' | 'excited' | 'anxious' | 'irritated' | 'frustrated' | 'content' | 'energetic';
  // Therapist-specific fields (optional for regular users)
  specialization?: string | null;
  experience_years?: number | null;
  rating?: number | null;
  response_time_label?: string | null;
  languages?: string[] | null;
  bio?: string | null;
  is_online?: boolean;
}

export interface JournalEntry {
  id?: string;
  mood: 'happy' | 'sad' | 'calm' | 'anxious' | 'excited' | 'angry' | 'irritated' | 'frustrated' | 'content' | 'energetic';
  content: string;
  date: Date;
  confidence?: number;
  aiAnalysis?: string;
}

export type Profile = {
  id: string;
  updated_at?: string;
  email?: string;
  username: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  website?: string;
  coins: number;
  user_type?: 'user' | 'therapist';
  pet_type?: string;
  pet_name?: string;
  pet_hunger?: number;
  pet_happiness?: number;
  pet_health?: number;
  last_fed?: string;
  last_played?: string;
  // Therapist-specific fields
  specialization?: string | null;
  experience_years?: number | null;
  rating?: number | null;
  response_time_label?: string | null;
  languages?: string[] | null;
  bio?: string | null;
  is_online?: boolean;
};

