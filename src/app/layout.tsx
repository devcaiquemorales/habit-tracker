// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import "./global.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { intlLocaleForAppLocale } from "@/lib/app-locale";
import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { ConvexClientProvider } from "@/presentation/components/convex/convex-client-provider";
import { MotionProvider } from "@/presentation/components/motion";
import { I18nProvider } from "@/presentation/lib/i18n/i18n-provider";

import { RouteTransitionShell } from "./route-transition-shell";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/** Install / standalone: aligns with `manifest.ts` for a consistent home-screen chrome. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
  ],
  width: "device-width",
  initialScale: 1,
  /** Lets `env(safe-area-inset-*)` reflect notches and home indicators in PWAs / Safari. */
  viewportFit: "cover",
};

export const metadata: Metadata = {
  applicationName: "Habit Tracker",
  title: "Habit Tracker",
  description: "Track your habits and achieve your goals",
  appleWebApp: {
    capable: true,
    title: "Habit Tracker",
    statusBarStyle: "black",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerAppLocale();
  const htmlLang = intlLocaleForAppLocale(locale);

  return (
    <html
      lang={htmlLang}
      translate="no"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} page-scrollbar-hidden antialiased`}
    >
      <body className="page-scrollbar-hidden">
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[45] bg-background"
          style={{ height: "env(safe-area-inset-top, 0px)" }}
          aria-hidden
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <ConvexClientProvider>
              <I18nProvider initialLocale={locale}>
                <RouteTransitionShell>{children}</RouteTransitionShell>
              </I18nProvider>
            </ConvexClientProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
