// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import "./global.css";

import type { Metadata, Viewport } from "next";
import { Fira_Code, Geist, Lora } from "next/font/google";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="page-scrollbar-hidden">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} dark page-scrollbar-hidden antialiased`}
      >
        <RouteTransitionShell>{children}</RouteTransitionShell>
      </body>
    </html>
  );
}
