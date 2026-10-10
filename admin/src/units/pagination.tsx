import { Button } from "./button"

type PaginationProps = {
  offset: number
  limit: number
  total: number
  onChange: (offset: number) => void
}

export function Pagination({ offset, limit, total, onChange }: PaginationProps) {
  if (total <= limit && offset === 0) {
    return null
  }
  const start = total === 0 ? 0 : offset + 1
  const end = Math.min(offset + limit, total)
  return (
    <nav className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-600" aria-label="Pagination">
      <p>
        Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex gap-2">
        <Button
          color="white"
          size="small"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          Previous
        </Button>
        <Button color="white" size="small" disabled={end >= total} onClick={() => onChange(offset + limit)}>
          Next
        </Button>
      </div>
    </nav>
  )
}
