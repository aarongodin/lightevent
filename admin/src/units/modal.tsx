import { type PropsWithChildren, type ReactNode, useEffect, useId, useRef } from "react"

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
  footer?: ReactNode
}>

// Modal uses the native <dialog> element, which traps focus, closes on Escape and makes the rest of the page
// inert while open.
export function Modal({ open, title, onClose, footer, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself, outside the panel) closes the dialog.
        if (e.target === ref.current) {
          onClose()
        }
      }}
      onKeyDown={() => undefined}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-transparent p-0 backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="rounded-lg bg-white p-5 shadow-xl">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <div className="mt-3 text-sm text-gray-700">{children}</div>
          {footer && <div className="mt-5 flex flex-row-reverse flex-wrap gap-2">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}
