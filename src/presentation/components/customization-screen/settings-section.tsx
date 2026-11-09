import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 px-1 pb-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        {title}
      </h2>
      <div className="rounded-[1.25rem] bg-sidebar p-4">{children}</div>
    </section>
  );
}
