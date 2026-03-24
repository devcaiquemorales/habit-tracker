import { cn } from "@/presentation/lib/utils";

interface AuthShellSkeletonProps {
  /** Shown under the spinner in the form panel */
  statusLabel: string;
  className?: string;
}

/**
 * Mirrors the refined AuthShell layout so route loading and Suspense fallbacks
 * feel continuous with the real auth screens.
 */
export function AuthShellSkeleton({
  statusLabel,
  className,
}: AuthShellSkeletonProps) {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-background px-4 py-8",
        "pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]",
        "pr-[calc(1rem+env(safe-area-inset-right,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <header className="mb-10 text-center">
          <div className="mx-auto h-8 w-40 animate-pulse rounded-md bg-muted/40" />
          <div className="mx-auto mt-3 h-3 w-48 animate-pulse rounded bg-muted/25" />
        </header>

        <div className="overflow-hidden rounded-2xl border border-white/8 bg-card/20 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
          <div className="border-b border-white/3 px-6 py-5 sm:px-8 sm:py-6">
            <div className="mx-auto mb-2 h-6 w-[min(14rem,85%)] animate-pulse rounded bg-muted/35" />
            <div className="mx-auto h-4 w-full max-w-xs animate-pulse rounded bg-muted/20" />
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-8 sm:px-8">
            <div
              className="size-9 shrink-0 animate-spin rounded-full border-2 border-muted border-t-primary"
              aria-hidden
            />
            <p
              className="text-center text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {statusLabel}
            </p>
            <div className="w-full space-y-3 pt-2">
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted/20" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted/20" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-muted/25" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
