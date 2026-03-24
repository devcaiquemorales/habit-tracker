/** Map common Supabase Auth errors to short, readable English copy. */
export function formatAuthErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (m.includes("user already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (m.includes("password")) {
    return raw;
  }
  return raw;
}
