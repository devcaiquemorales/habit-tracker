"use client";

import { useState } from "react";

import { PROFILE_MOTIVATION_PHRASE_MAX } from "@/domain/constants/profile-limits";
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
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

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
  onSave: (nextPhrase: string) => void | Promise<void>;
}

interface EditMotivationDialogFieldsProps {
  initialDraft: string;
  onSave: (nextPhrase: string) => void | Promise<void>;
  onRequestClose: () => void;
}

function EditMotivationDialogFields({
  initialDraft,
  onSave,
  onRequestClose,
}: EditMotivationDialogFieldsProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(initialDraft);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const trimmed = draft.trim();
  const canSave = trimmed.length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setRemoteError(null);
    triggerInteractionFeedback({ haptic: false });
    setSaving(true);
    try {
      await Promise.resolve(onSave(trimmed));
      onRequestClose();
    } catch (err) {
      setRemoteError(
        err instanceof Error ? err.message : t("editMotivation.genericError"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader className="space-y-1 border-b border-border/40 px-5 py-4 sm:px-6">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {t("editMotivation.title")}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {t("editMotivation.description")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 px-5 py-4 sm:px-6">
        {remoteError ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {remoteError}
          </p>
        ) : null}
        <Label htmlFor="motivation-phrase" className="text-muted-foreground">
          {t("editMotivation.label")}
        </Label>
        <Input
          id="motivation-phrase"
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.slice(0, PROFILE_MOTIVATION_PHRASE_MAX))
          }
          disabled={saving}
          placeholder={t("editMotivation.placeholder")}
          maxLength={PROFILE_MOTIVATION_PHRASE_MAX}
          autoComplete="off"
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSave();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          {draft.length}/{PROFILE_MOTIVATION_PHRASE_MAX}
        </p>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            className="min-h-11 w-full sm:min-h-9 sm:w-auto"
            onClick={() => triggerInteractionFeedback({ haptic: false })}
          >
            {t("common.cancel")}
          </Button>
        </DialogClose>
        <Button
          type="button"
          loading={saving}
          loadingText={t("common.saving")}
          disabled={!canSave}
          className="min-h-11 w-full min-w-30 sm:min-h-9 sm:w-auto"
          onClick={() => void handleSave()}
        >
          {t("editMotivation.save")}
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
