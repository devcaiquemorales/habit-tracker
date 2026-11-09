"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, type RefObject, useRef } from "react";

import { DialogPortal } from "@/presentation/components/ui/dialog";
import { useSheetDrag } from "@/presentation/hooks/use-sheet-drag";

/** Mounted only while open, so its refs exist when the drag listeners attach. */
function BottomSheetSurface({
  overlayRef,
  onDismiss,
  children,
}: {
  overlayRef: RefObject<HTMLDivElement | null>;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  useSheetDrag({ surfaceRef, overlayRef, onDismiss });

  return (
    <div
      ref={surfaceRef}
      className="flex h-full min-h-0 flex-col rounded-t-3xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 will-change-transform data-settling:transition-transform data-settling:duration-[260ms] data-settling:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none **:data-[slot=input]:rounded-xl"
    >
      <div
        aria-hidden
        className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-3 select-none active:cursor-grabbing"
      >
        <span className="h-1 w-9 rounded-full bg-muted-foreground/40" />
      </div>
      {children}
    </div>
  );
}

export function BottomSheetContent({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <DialogPortal>
      <DialogPrimitive.Overlay
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-black/50 duration-[260ms] supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Content
        // Focusing the first field would raise the keyboard over the sheet.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus({ preventScroll: true });
        }}
        className="fixed inset-x-0 bottom-0 z-[101] h-[70dvh] w-full outline-none data-open:animate-in data-open:duration-[420ms] data-open:ease-[cubic-bezier(0.32,0.72,0,1)] data-open:slide-in-from-bottom data-closed:animate-out data-closed:duration-[260ms] data-closed:ease-[cubic-bezier(0.32,0.72,0,1)] data-closed:slide-out-to-bottom motion-reduce:animate-none"
      >
        <BottomSheetSurface overlayRef={overlayRef} onDismiss={onDismiss}>
          {children}
        </BottomSheetSurface>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
