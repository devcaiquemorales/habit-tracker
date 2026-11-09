import { cn } from "@/presentation/lib/utils";

interface AuthShellSkeletonProps {
  /** Announced to assistive tech while the form loads. */
  statusLabel: string;
  className?: string;
}

/** Mirrors the AuthShell layout so loading feels continuous with the real screens. */
export function AuthShellSkeleton({
  statusLabel,
  className,
}: AuthShellSkeletonProps) {
  return (
    <div
      className={cn("flex w-full flex-col gap-5", className)}
      role="status"
      aria-label={statusLabel}
    >
      <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
    </div>
  );
}
