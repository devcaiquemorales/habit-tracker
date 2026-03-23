/**
 * Profile fields intended to align with a future Supabase `user_profiles` (or similar) row.
 */
export interface UserProfile {
  displayName: string;
  /** Personal line shown on the home subtitle after the date. */
  motivationPhrase: string;
}
