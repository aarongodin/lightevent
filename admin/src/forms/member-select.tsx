import { useQuery } from "@connectrpc/connect-query"
import clsx from "clsx"
import { useId, useState } from "react"

import type { Member } from "../gen/lightevent/v1/service_pb"
import { formatName } from "../lib/format"
import { useDebouncedValue } from "../lib/hooks"
import { LightEventService } from "../lib/rpc"
import { Button } from "../units/button"
import { inputClassName } from "../units/field"

type MemberSelectProps = {
  id: string
  value: Member | null
  onChange: (member: Member | null) => void
  invalid?: boolean
}

// MemberSelect is an accessible combobox for searching and choosing a member.
export function MemberSelect({ id, value, onChange, invalid }: MemberSelectProps) {
  const listId = useId()
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const search = useDebouncedValue(input.trim())
  const query = useQuery(
    LightEventService.method.listMembers,
    { search, limit: 8 },
    { enabled: search.length > 0, placeholderData: (prev) => prev },
  )
  const results = search.length > 0 ? (query.data?.members ?? []) : []

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm">
        <span>
          <span className="font-medium">{formatName(value.firstName, value.lastName) || value.email}</span>
          {(value.firstName || value.lastName) && <span className="ml-2 text-gray-500">{value.email}</span>}
        </span>
        <Button color="white" size="small" onClick={() => onChange(null)} aria-label="Choose a different member">
          Change
        </Button>
      </div>
    )
  }

  function choose(member: Member) {
    onChange(member)
    setInput("")
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter" && open && results[active]) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const showList = open && search.length > 0
  return (
    <div className="relative">
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        aria-invalid={invalid}
        autoComplete="off"
        placeholder="Search by name or email"
        className={inputClassName}
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200"
        >
          {results.length === 0 && (
            <div className="px-3 py-2 text-gray-500 italic">
              {query.isFetching ? "Searching…" : "No members found."}
            </div>
          )}
          {results.map((member, idx) => (
            <div
              key={member.uid}
              id={`${listId}-${idx}`}
              role="option"
              tabIndex={-1}
              aria-selected={idx === active}
              className={clsx("cursor-pointer px-3 py-2", { "bg-blue-50": idx === active })}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(member)
              }}
              onMouseEnter={() => setActive(idx)}
            >
              <span className="font-medium">{formatName(member.firstName, member.lastName) || member.email}</span>
              {(member.firstName || member.lastName) && <span className="ml-2 text-gray-500">{member.email}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
