"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";

export default function AppGroupTemplate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
