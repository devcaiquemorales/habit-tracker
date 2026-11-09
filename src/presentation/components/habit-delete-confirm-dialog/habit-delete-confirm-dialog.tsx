"use client";

import { useState } from "react";

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
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
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
  const { deleteHabit } = useDashboardMutations();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null);
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setError(null);
    setDeleting(true);
    const message = formatActionError(await deleteHabit(habitId), t);
    setDeleting(false);

    if (message) {
      setError(message);
      return;
    }
    handleOpenChange(false);
    onDeleted();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
            >
              {t("deleteHabit.cancel")}
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive-solid"
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
