import { cn } from "@/presentation/lib/utils";

/** App mark: a rounded H whose upper-right arm is the single brand-colored leaf. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden
      className={cn("size-4.5 shrink-0", className)}
    >
      <rect x="18" y="10" width="36" height="140" rx="18" fill="currentColor" />
      <rect x="36" y="72" width="106" height="32" rx="16" fill="currentColor" />
      <rect x="106" y="76" width="36" height="74" rx="18" fill="currentColor" />
      <path
        d="M72 62C72 28 104 8 150 8C150 42 118 62 72 62Z"
        className="fill-brand"
      />
    </svg>
  );
}
