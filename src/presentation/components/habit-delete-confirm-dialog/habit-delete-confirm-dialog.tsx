"use client";

import { useEffect, useState } from "react";

import { deleteHabitAction } from "@/app/actions/habit-actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/ui/alert-dialog";
import { Button } from "@/presentation/components/ui/button";
import { formatActionError } from "@/presentation/lib/action-error";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

type HabitDeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitId: string;
  habitName: string;
  onDeleted: () => void;
};

export function HabitDeleteConfirmDialog({
  open,
  onOpenChange,
  habitId,
  habitName,
  onDeleted,
}: HabitDeleteConfirmDialogProps) {
  const { t } = useI18n();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleConfirm = async () => {
    setError(null);
    setDeleting(true);
    try {
      const result = await deleteHabitAction(habitId);
      const msg = formatActionError(result, t);
      if (msg) {
        setError(msg);
        return;
      }
      onDeleted();
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[min(100%-2rem,22rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteHabit.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteHabit.descriptionBefore")}{" "}
            <span className="font-medium text-foreground">{habitName}</span>{" "}
            {t("deleteHabit.descriptionAfter")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={deleting}
            >
              {t("deleteHabit.cancel")}
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 w-full sm:w-auto"
            loading={deleting}
            loadingText={t("common.deleting")}
            onClick={() => void handleConfirm()}
          >
            {t("deleteHabit.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
