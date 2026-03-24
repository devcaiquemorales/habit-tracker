import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/presentation/lib/utils";

export function Spinner({
  className,
  ...props
}: ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      aria-hidden
      className={cn("size-4 shrink-0 animate-spin", className)}
      {...props}
    />
  );
}
