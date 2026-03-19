// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import "./global.css";

import type { Metadata } from "next";
import { Fira_Code, Geist, Lora } from "next/font/google";

import { UiSoundPreload } from "@/presentation/components/ui-sound-preload";

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

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your habits and achieve your goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} dark antialiased`}
      >
        <UiSoundPreload />
        {children}
      </body>
    </html>
  );
}
