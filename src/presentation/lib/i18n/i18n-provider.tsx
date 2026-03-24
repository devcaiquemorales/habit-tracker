"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

import type { AppLocale } from "@/lib/app-locale";

import { createTranslator, getMessages, type TranslateFn } from "./messages";

type I18nContextValue = {
  locale: AppLocale;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: AppLocale;
}) {
  const value = useMemo(() => {
    const t = createTranslator(getMessages(initialLocale));
    return { locale: initialLocale, t };
  }, [initialLocale]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
