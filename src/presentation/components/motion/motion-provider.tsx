"use client";

import { domAnimation,LazyMotion } from "framer-motion";

export const sharedVariants = {
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
  },
  staggerContainer: {
    initial: { opacity: 1 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  },
  listItem: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
};

export function MotionProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
