import Link from "next/link";

import { BrandMark } from "@/presentation/components/brand";
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
        "flex min-h-dvh flex-col bg-background",
        "pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]",
        "pr-[calc(1rem+env(safe-area-inset-right,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center **:data-[slot=input]:h-11 **:data-[slot=input]:rounded-xl">
        <header className="mb-6">
          <Link
            href="/login"
            aria-label="Habit Tracker"
            className="inline-flex rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <BrandMark className="size-9" />
          </Link>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-balance text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
            {subtitle}
          </p>
        </header>

        {children}

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
