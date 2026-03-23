"use client";

import { useState } from "react";

import { Button } from "@/presentation/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

const MOTIVATION_MAX_LENGTH = 120;

export interface EditMotivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Increment when opening the dialog so the draft remounts from `motivationPhrase`
   * (opening via local state does not go through `onOpenChange(true)`).
   */
  formResetKey: number;
  /** Current phrase; used to seed the field when the dialog opens. */
  motivationPhrase: string;
  onSave: (nextPhrase: string) => void;
}

interface EditMotivationDialogFieldsProps {
  initialDraft: string;
  onSave: (nextPhrase: string) => void;
  onRequestClose: () => void;
}

function EditMotivationDialogFields({
  initialDraft,
  onSave,
  onRequestClose,
}: EditMotivationDialogFieldsProps) {
  const [draft, setDraft] = useState(initialDraft);

  const trimmed = draft.trim();
  const canSave = trimmed.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    triggerInteractionFeedback({ haptic: false });
    onSave(trimmed);
    onRequestClose();
  };

  return (
    <>
      <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4 sm:px-6">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          Your reason
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Keep your motivation close
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 px-5 py-4 sm:px-6">
        <Label htmlFor="motivation-phrase" className="text-muted-foreground">
          What keeps you going?
        </Label>
        <Input
          id="motivation-phrase"
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.slice(0, MOTIVATION_MAX_LENGTH))
          }
          placeholder="For my future"
          maxLength={MOTIVATION_MAX_LENGTH}
          autoComplete="off"
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          {draft.length}/{MOTIVATION_MAX_LENGTH}
        </p>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:min-h-9 sm:w-auto"
            onClick={() => triggerInteractionFeedback({ haptic: false })}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          disabled={!canSave}
          className="min-h-11 w-full sm:min-h-9 sm:w-auto"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </>
  );
}

export function EditMotivationDialog({
  open,
  onOpenChange,
  formResetKey,
  motivationPhrase,
  onSave,
}: EditMotivationDialogProps) {
  const fieldsKey = `${formResetKey}-${motivationPhrase}`;

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-dvh max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-border/40 p-0 shadow-xl sm:max-w-md"
      >
        <EditMotivationDialogFields
          key={fieldsKey}
          initialDraft={motivationPhrase}
          onSave={onSave}
          onRequestClose={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
