// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import "./global.css";

import type { Metadata, Viewport } from "next";
import { Fira_Code, Geist, Lora } from "next/font/google";

import { intlLocaleForAppLocale } from "@/lib/app-locale";
import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { I18nProvider } from "@/presentation/lib/i18n/i18n-provider";

import { RouteTransitionShell } from "./route-transition-shell";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

/** Install / standalone: aligns with `manifest.ts` for a consistent home-screen chrome. */
export const viewport: Viewport = {
  themeColor: "#16141f",
  colorScheme: "dark",
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
    statusBarStyle: "black-translucent",
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
    <html lang={htmlLang} className="page-scrollbar-hidden">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} dark page-scrollbar-hidden antialiased`}
      >
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[45] bg-background"
          style={{ height: "env(safe-area-inset-top, 0px)" }}
          aria-hidden
        />
        <I18nProvider initialLocale={locale}>
          <RouteTransitionShell>{children}</RouteTransitionShell>
        </I18nProvider>
      </body>
    </html>
  );
}
