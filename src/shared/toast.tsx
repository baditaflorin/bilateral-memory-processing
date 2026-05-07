import { X } from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

type ToastTone = "info" | "success" | "warning" | "error";

interface Toast {
  readonly id: string;
  readonly tone: ToastTone;
  readonly message: string;
}

interface ToastContextValue {
  readonly notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => dismiss(id), 5_000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-32px))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white p-3 text-sm text-ink shadow-quiet"
            data-tone={toast.tone}
            key={toast.id}
            role="status"
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-tide data-[tone=error]:bg-ember data-[tone=success]:bg-moss data-[tone=warning]:bg-saffron" />
            <p className="min-w-0 flex-1 leading-6">{toast.message}</p>
            <button
              aria-label="Dismiss message"
              className="rounded-md p-1 text-ink/50 hover:bg-ink/5 hover:text-ink"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
