import type { ReactNode } from "react";

import { cn } from "@/presentation/lib/utils";

type AuthFormNoticeVariant = "error" | "info" | "success";

interface AuthFormNoticeProps {
  variant: AuthFormNoticeVariant;
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}

export function AuthFormNotice({
  variant,
  children,
  className,
  role,
}: AuthFormNoticeProps) {
  const resolvedRole =
    role ?? (variant === "error" ? "alert" : "status");

  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm leading-snug",
        variant === "error" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        variant === "info" &&
          "border-border/50 bg-muted/30 text-foreground",
        variant === "success" &&
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-100/90",
        className,
      )}
      role={resolvedRole}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {children}
    </p>
  );
}
