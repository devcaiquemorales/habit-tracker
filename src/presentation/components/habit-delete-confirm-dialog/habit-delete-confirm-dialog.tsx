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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleConfirm = async () => {
    setError(null);
    setDeleting(true);
    try {
      const { error: msg } = await deleteHabitAction(habitId);
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
          <AlertDialogTitle>Delete habit?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">{habitName}</span>{" "}
            and its activity history.
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
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 w-full sm:w-auto"
            loading={deleting}
            loadingText="Deleting..."
            onClick={() => void handleConfirm()}
          >
            Delete habit
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
