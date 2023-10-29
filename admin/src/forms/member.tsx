import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { TwirpError } from "twirp-ts"

import { ErrorMessage } from "@hookform/error-message"

import { useClient } from "../client"
import { memberRoute } from "../router"
import { Member } from "../rpc"
import { Button } from "../units/button"

type MemberFormProps = {
  member?: Member
}

export function MemberForm({ member }: MemberFormProps) {
  const { handleSubmit, register, formState, setError } = useForm({
    defaultValues: {
      ...member,
    },
  })
  const client = useClient()
  const navigate = useNavigate()

  async function onSubmit(data: any) {
    try {
      const resp = member === undefined ? await client.CreateMember(data) : await client.UpdateMember(data)
      navigate(memberRoute(resp.email))
    } catch (err) {
      const message = err instanceof TwirpError ? err.message : (err as Error).message
      setError("root.submit", { type: "custom", message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-2xl mx-auto">
        <ErrorMessage name="root.submit" errors={formState.errors} />
        <div className="grid grid-cols-3 gap-4 max-w-xl bg-white p-4 rounded-lg drop-shadow">
          {member === undefined && (
            <>
              <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="memberEmail">
                Email Address
              </label>
              <input
                className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
                {...register("email", { required: true })}
                required
              />
            </>
          )}
          <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="memberEmail">
            First Name
          </label>
          <input
            className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
            {...register("firstName")}
          />
          <label className="flex items-center justify-end text-sm text-gray-800" htmlFor="memberEmail">
            Last Name
          </label>
          <input
            className="col-span-2 rounded-md border-2 border-slate-200 px-2 py-1 focus:drop-shadow"
            {...register("lastName")}
          />
        </div>
        <div className="mt-4">
          <Button color="primary" disabled={formState.isSubmitting}>
            Save Member
          </Button>
        </div>
      </div>
    </form>
  )
}