"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check, CircleAlert, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

let seq = 0;

const STYLES: Record<ToastType, { barre: string; icone: string; Icon: typeof Check }> = {
  success: { barre: "var(--vert-feuille)", icone: "var(--texte-succes)", Icon: Check },
  error: { barre: "var(--vip)", icone: "var(--vip)", Icon: CircleAlert },
  info: { barre: "var(--action-verte)", icone: "var(--action-verte)", Icon: Info },
};

function Toaster({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((t) => {
        const s = STYLES[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-champ border border-bordure bg-carte p-3 shadow-lg"
            style={{ borderLeft: `3px solid ${s.barre}` }}
          >
            <s.Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: s.icone }} strokeWidth={2} />
            <p className="flex-1 text-sm text-principal">{t.message}</p>
            <button
              onClick={() => onClose(t.id)}
              aria-label="Fermer"
              className="shrink-0 text-tertiaire transition-colors hover:text-secondaire"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++seq;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <Toaster toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}
