export function TableLoader() {
  const rows = []
  for (let i = 0; i < 5; i++) {
    rows.push(
      <div key={`loader-row-${i}`} className="grid grid-cols-7 items-center gap-4">
        <div className="h-6 bg-gray-200 rounded col-span-2"></div>
        <div className="h-4 bg-gray-200 rounded col-span-3"></div>
        <div className="h-4 bg-gray-200 rounded col-span-1"></div>
        <div className="h-6 bg-gray-200 rounded col-span-1"></div>
      </div>,
    )
  }
  return (
    <div className="shadow bg-white rounded-lg p-4 w-full mx-auto">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="space-y-4">{rows}</div>
        </div>
      </div>
    </div>
  )
}
