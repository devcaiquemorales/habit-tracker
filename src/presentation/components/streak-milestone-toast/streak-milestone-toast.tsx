"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

export type StreakMilestoneToastPayload =
  | { kind: "milestone"; habitName: string; streak: number }
  | { kind: "recovery"; habitName: string; missedDays: 1 | 2 };

export interface StreakMilestoneToastProps {
  payload: StreakMilestoneToastPayload;
  onDismiss: () => void;
}

const MILESTONE_I18N: Partial<Record<number, string>> = {
  7: "streakToast.milestone7",
  14: "streakToast.milestone14",
  21: "streakToast.milestone21",
  30: "streakToast.milestone30",
  60: "streakToast.milestone60",
  90: "streakToast.milestone90",
  180: "streakToast.milestone180",
  365: "streakToast.milestone365",
};

export function StreakMilestoneToast({
  payload,
  onDismiss,
}: StreakMilestoneToastProps) {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const dismissed = useRef(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const finishDismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    onDismissRef.current();
  };

  const message =
    payload.kind === "recovery"
      ? payload.missedDays === 1
        ? t("streakToast.recovery1", { habit: payload.habitName })
        : t("streakToast.recovery2", { habit: payload.habitName })
      : (() => {
          const key = MILESTONE_I18N[payload.streak];
          return key
            ? t(key, { habit: payload.habitName })
            : t("streakToast.milestoneFallback", {
                habit: payload.habitName,
                n: payload.streak,
              });
        })();

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const tExit = window.setTimeout(() => setExiting(true), 4000);
    const tDone = window.setTimeout(() => finishDismiss(), 4300);
    return () => {
      window.clearTimeout(tExit);
      window.clearTimeout(tDone);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {visible && !exiting ? (
          <m.div
            key="streak-toast"
            role="status"
            aria-live="polite"
            className={cn(
              "pointer-events-none fixed left-1/2 z-40 max-w-xs -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-lg",
              "bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]",
            )}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.15 }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }
            }
          >
            <p className="text-center text-sm leading-snug text-zinc-100">
              {message}
            </p>
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}
