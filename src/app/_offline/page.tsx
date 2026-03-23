/**
 * Precached document fallback for navigation failures when offline (Workbox + @ducanh2912/next-pwa).
 */
export default function OfflinePage() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background text-center"
      style={{
        paddingLeft: "calc(1.5rem + env(safe-area-inset-left, 0px))",
        paddingRight: "calc(1.5rem + env(safe-area-inset-right, 0px))",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <p className="text-lg font-semibold text-foreground">You are offline</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Check your connection. This screen loads from cache so the app shell
        stays usable.
      </p>
    </main>
  );
}
