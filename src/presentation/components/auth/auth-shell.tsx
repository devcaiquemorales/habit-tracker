import Link from "next/link";

import { cn } from "@/presentation/lib/utils";

interface AuthShellProps {
  brandLabel: string;
  /** Short product line under the wordmark (optional). */
  brandTagline?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthShell({
  brandLabel,
  brandTagline,
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthShellProps) {
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
          <Link
            href="/login"
            className="group inline-flex flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="font-serif text-[1.65rem] leading-none font-medium tracking-tight text-foreground transition-colors group-hover:text-foreground/90 sm:text-[1.85rem]">
              {brandLabel}
            </span>
            {brandTagline ? (
              <span className="max-w-[16rem] text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground/80 uppercase">
                {brandTagline}
              </span>
            ) : null}
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl border border-white/8 bg-card/20 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
          <div className="border-b border-white/3 px-6 py-5 text-center sm:px-8 sm:py-6">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            <p className="mx-auto mt-2 max-w-88 text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
        </div>

        {footer ? (
          <div className="mt-9 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
