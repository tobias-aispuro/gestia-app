"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg";
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

function subscribeNoop() {
  return () => {};
}

/** true once running in the browser — avoids a portal on the server render. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const mounted = useIsClient();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Ref en vez de dependencia directa: si `onClose` no está memoizado en el
  // caller (ej. cambia en cada tecla que se tipea dentro del modal), no
  // queremos que el efecto de abajo se vuelva a disparar y robe el foco.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && panel) {
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 animate-[fade-in_200ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col rounded-lg border border-border-default bg-raised shadow-lg",
          "animate-[scale-in_200ms_ease-out]",
          size === "lg" ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 id="modal-title" className="heading-display text-base">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-body transition-colors duration-150 cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
