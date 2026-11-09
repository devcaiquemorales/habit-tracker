import { cn } from "@/presentation/lib/utils";

/** App mark: a rounded H cut out of a brand-colored tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden
      className={cn("size-4.5 shrink-0 fill-brand", className)}
    >
      <path
        fillRule="evenodd"
        d="M38 0H122A38 38 0 0 1 160 38V122A38 38 0 0 1 122 160H38A38 38 0 0 1 0 122V38A38 38 0 0 1 38 0ZM49.9 32.4A11.9 11.9 0 0 1 61.8 44.3V66.7H98.2V44.3A11.9 11.9 0 0 1 122 44.3V115.7A11.9 11.9 0 0 1 98.2 115.7V90.5H61.8V115.7A11.9 11.9 0 0 1 38 115.7V44.3A11.9 11.9 0 0 1 49.9 32.4Z"
      />
    </svg>
  );
}
