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
        "rounded-xl px-3 py-2.5 text-sm leading-snug",
        variant === "error" &&
          "bg-destructive/10 text-destructive",
        variant === "info" &&
          "bg-muted text-foreground",
        variant === "success" &&
          "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
        className,
      )}
      role={resolvedRole}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {children}
    </p>
  );
}
