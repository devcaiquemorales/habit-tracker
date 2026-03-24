import Link from "next/link";

import { cn } from "@/presentation/lib/utils";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthShell({
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
        <header className="mb-8 text-center">
          <Link
            href="/login"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Habit Tracker
          </Link>
        </header>

        <div className="rounded-xl border border-border/60 bg-card/40 p-6 shadow-sm ring-1 ring-foreground/5 sm:p-8">
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {children}
        </div>

        {footer ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
