export default function AuthLoading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6">
      <div
        className="size-9 shrink-0 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden
      />
      <p
        className="text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Loading...
      </p>
    </div>
  );
}
