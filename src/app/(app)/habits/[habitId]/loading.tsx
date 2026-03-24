export default function HabitDetailLoading() {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-background pt-[env(safe-area-inset-top,0px)] pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] text-foreground md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))]"
      aria-busy="true"
      aria-label="Loading habit"
    >
      <div className="flex items-center gap-3 pt-2">
        <div className="size-10 shrink-0 animate-pulse rounded-lg bg-white/10" />
        <div className="h-7 max-w-[12rem] flex-1 animate-pulse rounded-lg bg-white/10" />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-xl bg-white/[0.03] p-4">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-white/10" />
          <div className="h-3 w-full max-w-xs animate-pulse rounded bg-white/5" />
        </div>
        <div className="h-28 animate-pulse rounded-xl bg-white/5" />
        <div className="h-24 animate-pulse rounded-xl bg-white/5" />
      </div>
    </main>
  );
}
