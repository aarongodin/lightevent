import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"

// useDebouncedValue returns value after it has stopped changing for delay milliseconds.
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

// useDocumentTitle sets the browser tab title.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · LightEvent` : "LightEvent"
  }, [title])
}

// usePageParams reads and writes list state (search, page offset, filter) in the URL so it survives
// navigation and can be shared.
export function usePageParams() {
  const [params, setParams] = useSearchParams()
  const offset = Math.max(0, Number.parseInt(params.get("offset") ?? "0", 10) || 0)
  const search = params.get("q") ?? ""

  function update(changes: Record<string, string | number | null>) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === "" || value === 0) {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        }
        return next
      },
      { replace: true },
    )
  }

  return { params, offset, search, update }
}
