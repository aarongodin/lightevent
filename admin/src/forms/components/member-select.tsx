import clsx from "clsx"
import { PropsWithChildren, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

import { useClient } from "../../client"
import { Member, MemberList } from "../../rpc"
import { Button } from "../../units/button"
import { Condition } from "../../units/condition"

type MemberSelectProps = {
  fieldName: string
}

type MemberSelectResultsProps = {
  results: MemberList["members"]
  selectMember: (member: Member) => void
}

function ResultsBin({ children }: PropsWithChildren) {
  return <div className="absolute mt-2 rounded-md bg-white border border-slate-400 w-full">{children}</div>
}

function MemberSelectResults({ results, selectMember }: MemberSelectResultsProps) {
  return (
    <ResultsBin>
      {results.map((result, idx) => {
        const cls = clsx("p-2 hover:bg-slate-100 cursor-pointer block", {
          "rounded-t-md": idx === 0,
          "rounded-b-md": idx === results.length - 1,
          "border-b border-slate-200": idx < results.length,
        })
        return (
          <a key={result.email} className={cls} onClick={() => selectMember(result)}>
            <span className="mr-4">
              {result.firstName} {result.lastName}
            </span>
            {result.email}
          </a>
        )
      })}
    </ResultsBin>
  )
}

function EmptyResultsNotice() {
  return (
    <ResultsBin>
      <div className="p-2 italic">No results found.</div>
    </ResultsBin>
  )
}

export function MemberSelect({ fieldName }: MemberSelectProps) {
  const client = useClient()
  const form = useFormContext()
  const values = form.getValues()
  const [selected, setSelected] = useState(false)
  const [results, setResults] = useState<MemberList["members"]>([])
  const watchInput = form.watch(fieldName)

  useEffect(() => {
    if (watchInput === undefined || watchInput.trim().length === 0) {
      setResults([])
      return
    }
    client.ListMembers({ search: watchInput }).then(({ members }) => setResults(members))
  }, [watchInput])

  if (selected) {
    return (
      <div className="flex justify-between items-center col-span-2">
        <span className="col-span-2">{values[fieldName]}</span>
        <Button color="white" className="px-2" onClick={() => setSelected(false)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    )
  }

  function handleSelectMember(member: Member) {
    setSelected(true)
    form.setValue(fieldName, member.email)
  }

  return (
    <div className="col-span-2">
      <input
        className="w-full rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
        {...form.register(fieldName, { required: true })}
        required
      />
      <Condition
        value={form.getFieldState(fieldName).isDirty && watchInput.trim().length > 0}
        items={
          <Condition
            value={results.length > 0}
            items={[
              <MemberSelectResults results={results} selectMember={handleSelectMember} />,
              <EmptyResultsNotice />,
            ]}
          ></Condition>
        }
      ></Condition>
    </div>
  )
}
