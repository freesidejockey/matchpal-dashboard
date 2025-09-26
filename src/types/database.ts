export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: 'Tutor' | 'Client' | 'Admin'
  onboarding_completed: boolean | null
  questionnaire_completed: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  id: string // Required for insert since it comes from auth.users
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>