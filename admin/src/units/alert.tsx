import classNames from "classnames"

type AlertProps = {
  variant: "error" | "warning" | "info" | "success" | "light" | "secondary"
  content: string
  title?: string
}

export function Alert({ variant, title, content }: AlertProps) {
  const cls = classNames(
    "border text-sm rounded-md p-4 my-4",
    { "bg-red-50 border-red-200 text-red-600": variant === "error" },
    { "bg-gray-800/[.1] border-gray-200 text-gray-600": variant === "secondary" },
  )

  return (
    <div className={cls} role="alert">
      {title && <span className="font-bold mr-4">{title}</span>}
      {content}
    </div>
  )
}

// {
/* 
<div class="bg-blue-50 border border-blue-200 text-sm text-blue-600 rounded-md p-4" role="alert">
  <span class="font-bold">Info</span> alert! You should check in on some of those fields below.
</div>
<div class="bg-green-50 border border-green-200 text-sm text-green-600 rounded-md p-4" role="alert">
  <span class="font-bold">Success</span> alert! You should check in on some of those fields below.
</div>
<div class="bg-red-50 border border-red-200 text-sm text-red-600 rounded-md p-4" role="alert">
  <span class="font-bold">Danger</span> alert! You should check in on some of those fields below.
</div>
<div class="bg-orange-50 border border-orange-200 text-sm text-orange-600 rounded-md p-4" role="alert">
  <span class="font-bold">Warning</span> alert! You should check in on some of those fields below.
</div>
<div class="bg-white/[.1] border border-white/[.1] text-sm text-gray-600 rounded-md p-4 dark:text-gray-400" role="alert">
  <span class="font-bold">Light</span> alert! You should check in on some of those fields below.
</div> */
// }
