import type { AppLocale } from "@/lib/app-locale";

import type { EnMessages } from "./dictionaries/en";
import { enMessages } from "./dictionaries/en";
import { ptMessages } from "./dictionaries/pt";

export type Messages = EnMessages;

export function getMessages(locale: AppLocale): Messages {
  return locale === "pt" ? ptMessages : enMessages;
}

function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    return v !== undefined && v !== null ? String(v) : `{${key}}`;
  });
}

export function createTranslator(messages: Messages) {
  return function t(
    key: string,
    vars?: Record<string, string | number>,
  ): string {
    const raw = getByPath(messages, key);
    if (typeof raw !== "string") {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation: ${key}`);
      }
      return key;
    }
    return interpolate(raw, vars);
  };
}

export type TranslateFn = ReturnType<typeof createTranslator>;
