import clsx from "clsx"
import { createContext, type PropsWithChildren, useCallback, useContext, useState } from "react"

type Toast = { id: number; kind: "success" | "error"; message: string }

type ToastFn = {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastFn | null>(null)

let nextId = 1

// ToastProvider shows short-lived notifications in a polite live region.
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = nextId++
    setToasts((t) => [...t, { id, kind, message }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 8000 : 4000)
  }, [])

  const [value] = useState<ToastFn>(() => ({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  }))

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={clsx(
              "pointer-events-auto flex w-full max-w-sm items-start justify-between gap-4 rounded-lg px-4 py-3 text-sm shadow-lg ring-1",
              t.kind === "success" ? "bg-white text-gray-900 ring-gray-200" : "bg-red-50 text-red-800 ring-red-200",
            )}
          >
            <span>{t.message}</span>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-700"
              aria-label="Dismiss"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastFn {
  const toast = useContext(ToastContext)
  if (!toast) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return toast
}
