export default function UnexpectedError({ error }: { error: any }) {
  console.log(error)
  return (
    <div className="flex w-screen h-screen items-center justify-center">
      <div className="w-96 flex flex-col items-center gap-6">
        <h1 className="text-lg font-bold">Something unexpected happened</h1>
        {error.message}
      </div>
    </div>
  )
}
