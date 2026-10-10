export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="animate-pulse space-y-4">
        <div className="h-4 rounded bg-gray-200" />
        {Array.from({ length: rows }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
          <div key={i} className="grid grid-cols-7 items-center gap-4">
            <div className="col-span-2 h-5 rounded bg-gray-200" />
            <div className="col-span-3 h-4 rounded bg-gray-200" />
            <div className="col-span-1 h-4 rounded bg-gray-200" />
            <div className="col-span-1 h-5 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
