import { useForm } from "react-hook-form"

type MemberSelectProps = {
  fieldName: string
}

export function MemberSelect({ fieldName }: MemberSelectProps) {
  const form = useForm()
  return (
    <>
      <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="memberEmail">
        Member
      </label>
      <input
        className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
        {...form.register(fieldName, { required: true })}
        required
      />
    </>
  )
}
