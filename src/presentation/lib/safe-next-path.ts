/** Keeps post-login redirects on this site: `//host` and `/\host` are other origins. */
export function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || /^\/[/\\]/.test(raw)) return "/";
  return raw;
}
